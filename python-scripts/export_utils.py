import csv
import folium
import os
from datetime import datetime, timedelta
import json

def salvar_csv(coords, nome_arquivo, id_rota, pontos_extra=None, areas_proibidas=None):
    """
    coords: lista de tuplas (lat, lon) da rota principal
    pontos_extra: dict {nome: (lat, lon)} de flags, paradas, etc
    areas_proibidas: lista de áreas (polígonos), cada área = {"nome": "Area 1", "coordinates": [[(lon, lat), ...]]}
    """
    pasta = os.path.dirname(nome_arquivo)
    if pasta and not os.path.exists(pasta):
        os.makedirs(pasta)
    
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
        intervalo = timedelta(seconds=30)

        # Rota principal
        for idx, (lat, lon) in enumerate(coords, start=1):
            timestamp = (tempo_inicial + intervalo * (idx - 1)).isoformat(sep=" ", timespec="seconds")
            tipo = "rota"
            nome = None
            # Origem e destino
            if idx == 1:
                tipo = "flag"
                nome = "Origem"
            elif idx == len(coords):
                tipo = "flag"
                nome = "Destino"
            writer.writerow([id_rota, idx, lon, lat, timestamp, tipo, nome])

        # Pontos extras
        if pontos_extra:
            for idx_extra, (nome, (lat, lon)) in enumerate(pontos_extra.items(), start=len(coords)+1):
                timestamp = (tempo_inicial + intervalo * (idx_extra - 1)).isoformat(sep=" ", timespec="seconds")
                writer.writerow([id_rota, idx_extra, lon, lat, timestamp, "flag", nome])

        # Áreas proibidas
        if areas_proibidas:
            for area in areas_proibidas:
                for idx_poly, (lon, lat) in enumerate(area["coordinates"][0], start=1):
                    timestamp = (tempo_inicial + intervalo * (len(coords) + idx_poly)).isoformat(sep=" ", timespec="seconds")
                    writer.writerow([id_rota, len(coords)+idx_poly, lon, lat, timestamp, "polygon", area.get("nome", "Área Proibida")])


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