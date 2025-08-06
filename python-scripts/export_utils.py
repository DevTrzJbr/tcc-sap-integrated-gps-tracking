import csv
import folium

def salvar_csv(coords, nome_arquivo):
    with open(nome_arquivo, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Latitude", "Longitude"])
        writer.writerows(coords)

def salvar_mapa(coords, nome_arquivo, titulo):
    mapa = folium.Map(location=coords[0], zoom_start=13)
    folium.PolyLine(coords, color='blue', weight=4, tooltip=titulo).add_to(mapa)
    folium.Marker(coords[0], tooltip="🚀 Origem", icon=folium.Icon(color="green")).add_to(mapa)
    folium.Marker(coords[-1], tooltip="🏁 Destino", icon=folium.Icon(color="blue")).add_to(mapa)
    mapa.save(nome_arquivo)
