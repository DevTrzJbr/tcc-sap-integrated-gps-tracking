import csv
import folium
import os
from datetime import datetime, timedelta

def salvar_csv(coords, nome_arquivo, id_rota):
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
            "Outras Informações"
        ])
        
        tempo_inicial = datetime.now()
        intervalo = timedelta(seconds=30)

        for idx, (lat, lon) in enumerate(coords, start=1):
            timestamp = (tempo_inicial + intervalo * (idx - 1)).isoformat(sep=" ", timespec="seconds")
            outras_info = None
            writer.writerow([id_rota, idx, lon, lat, timestamp, outras_info])

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

