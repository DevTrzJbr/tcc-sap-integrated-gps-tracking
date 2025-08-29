import csv
import folium
import os
from datetime import datetime, timedelta
import json

import csv
import folium
import os
from datetime import datetime, timedelta
import json
import math

def _haversine_m(lat1, lon1, lat2, lon2):
    """Distância em metros entre dois pares (lat, lon)."""
    R = 6371000.0  # raio da Terra em metros
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = phi2 - phi1
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.asin(math.sqrt(a))

def salvar_csv(coords, nome_arquivo, id_rota, pontos_extra=None, areas_proibidas=None,
               duracao_min=None, tempo_parada_min=5, parada_idx=None, parada_min=0,
               raio_match_m=50):
    """
    coords: [(lat, lon)] da rota principal
    pontos_extra: dict {nome: (lat, lon)} -> paradas/desvios presentes na rota
    raio_match_m: raio em metros para considerar que a rota “passou” pelo ponto_extra
    """

    pasta = os.path.dirname(nome_arquivo)
    if pasta and not os.path.exists(pasta):
        os.makedirs(pasta)

    # Pré-processa pontos_extra para busca por proximidade
    pontos_extra = pontos_extra or {}
    extras_list = [(nome, lat, lon) for nome, (lat, lon) in pontos_extra.items()]

    with open(nome_arquivo, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "ID da Rota",
            "ID do Ponto",
            "Longitude",
            "Latitude",
            "Timestamp",
            "Tipo",
            "Nome"
        ])

        tempo_inicial = datetime.now()

        # intervalo médio entre pontos baseado na duração total
        if duracao_min:
            total_seg = duracao_min * 60
            intervalo = timedelta(seconds= total_seg / max(1, len(coords) - 1))
        else:
            intervalo = timedelta(seconds=30)

        current_time = tempo_inicial

        for idx, (lat, lon) in enumerate(coords, start=1):
            tipo, nome = "rota", None

            # Origem/Destino como flags
            if idx == 1:
                tipo, nome = "flag", "Origem"
            elif idx == len(coords):
                tipo, nome = "flag", "Destino"

            # Checa se este ponto está próximo de algum ponto_extra (match por raio)
            is_extra = False
            extra_nome = None
            for nome_e, lat_e, lon_e in extras_list:
                if _haversine_m(lat, lon, lat_e, lon_e) <= raio_match_m:
                    is_extra = True
                    extra_nome = nome_e
                    break

            if is_extra:
                tipo = "flag"
                nome = extra_nome

            # (compat) parada por índice específico
            ts = current_time
            if parada_idx and idx == parada_idx:
                ts = ts + timedelta(minutes=parada_min)

            # grava linha
            writer.writerow([
                id_rota,
                idx,
                lon,
                lat,
                ts.isoformat(sep=" ", timespec="seconds"),
                tipo,
                nome
            ])

            # avança relógio para o próximo ponto
            current_time = current_time + intervalo

            # se bateu num ponto_extra, adiciona tempo de parada
            if is_extra and tempo_parada_min and tempo_parada_min > 0:
                current_time = current_time + timedelta(minutes=tempo_parada_min)

        # Áreas proibidas (como antes)
        if areas_proibidas:
            for area in areas_proibidas:
                for idx_poly, (lon_p, lat_p) in enumerate(area["coordinates"][0], start=1):
                    writer.writerow([
                        id_rota,
                        f"poly-{idx_poly}",
                        lon_p,
                        lat_p,
                        current_time.isoformat(sep=" ", timespec="seconds"),
                        "polygon",
                        area.get("nome", "Área Proibida")
                    ])

def salvar_mapa(coords, nome_arquivo, titulo, pontos_extra=None, areas_proibidas=None):
    pasta = os.path.dirname(nome_arquivo)
    if pasta and not os.path.exists(pasta):
        os.makedirs(pasta)
    
    mapa = folium.Map(location=coords[0], zoom_start=13)

    # Linha da rota
    folium.PolyLine(coords, color='blue', weight=4, tooltip=titulo).add_to(mapa)

    # Origem e destino
    folium.Marker(coords[0], tooltip="🚀 Origem", icon=folium.Icon(color="green")).add_to(mapa)
    folium.Marker(coords[-1], tooltip="🏁 Destino", icon=folium.Icon(color="blue")).add_to(mapa)

    # Pontos extras (desvios ou paradas)
    if pontos_extra:
        for nome, (lat, lon) in pontos_extra.items():
            folium.Marker(
                [lat, lon],
                tooltip=nome,
                icon=folium.Icon(color="orange", icon="flag")
            ).add_to(mapa)

    # Áreas proibidas
    if areas_proibidas:
        for area in areas_proibidas:
            coords_area = [(lat, lon) for lon, lat in area["coordinates"][0]]
            folium.Polygon(
                locations=coords_area,
                color="red",
                fill=True,
                fill_opacity=0.3,
                tooltip="Área Proibida"
            ).add_to(mapa)

    mapa.save(nome_arquivo)


def salvar_geo(mapa_geo, nome_arquivo, titulo):
    pasta = os.path.dirname(nome_arquivo)
    if pasta and not os.path.exists(pasta):
        os.makedirs(pasta)

    with open(nome_arquivo, "w", encoding="utf-8") as f:
        json.dump(mapa_geo, f, ensure_ascii=False, indent=2)