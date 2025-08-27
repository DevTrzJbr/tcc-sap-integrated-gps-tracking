import folium
import csv
import time
from folium.plugins import AntPath
import openrouteservice
from shapely.geometry import shape, LineString
from geopy.geocoders import Nominatim

# ========= CONFIG =========
API_KEY = '5b3ce3597851110001cf6248400d5875544d49e5afb8eef2454f704f'
client = openrouteservice.Client(key=API_KEY)
geolocator = Nominatim(user_agent="simulador_rota")

# ========= FUNÇÕES =========
def buscar_coordenadas(endereco):
    geo = geolocator.geocode(endereco)
    if not geo:
        raise ValueError(f"❌ Endereço não encontrado: {endereco}")
    return (geo.longitude, geo.latitude)

def gerar_rota(pontos, evitar_poligonos=None):
    return client.directions(
        coordinates=pontos,
        profile='driving-car',
        format='geojson',
        options={"avoid_polygons": evitar_poligonos} if evitar_poligonos else None
    )

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

# ========= PONTOS FIXOS =========
origem = buscar_coordenadas("Avenida Champagnat, 1466, Vila Velha, ES")
destino = buscar_coordenadas("Guarapari, Espírito Santo")

# Pontos intermediários
ponto_desvio1 = buscar_coordenadas("R. Manoel Alvarenga, 1995 - Guarapari, ES")
ponto_desvio2 = buscar_coordenadas("Av. Paris, Guarapari, ES")
parada1 = buscar_coordenadas("Praia do Morro, Guarapari, ES")
parada2 = buscar_coordenadas("Terminal de Itaparica, Vila Velha, ES")

# Áreas proibidas
retangulo1 = {
    "type": "Polygon",
    "coordinates": [[
        [-40.44, -20.62],
        [-40.45, -20.61],
        [-40.46, -20.63],
        [-40.43, -20.64],
        [-40.44, -20.62]
    ]]
}

retangulo2 = {
    "type": "Polygon",
    "coordinates": [[
        [-40.47, -20.59],
        [-40.48, -20.60],
        [-40.49, -20.58],
        [-40.46, -20.57],
        [-40.47, -20.59]
    ]]
}

# ========= CENÁRIOS =========
cenarios = [
    {
        "nome": "rota_normal",
        "pontos": [origem, destino],
        "evitar": None
    },
    {
        "nome": "rota_com_desvio_1",
        "pontos": [origem, ponto_desvio1, destino],
        "evitar": retangulo1
    },
    {
        "nome": "rota_com_paradas",
        "pontos": [origem, parada2, parada1, destino],
        "evitar": retangulo2
    }
]

# ========= PROCESSAR CENÁRIOS =========
for cenario in cenarios:
    print(f"\n🚀 Processando: {cenario['nome']}")

    try:
        rota_geo = gerar_rota(cenario["pontos"], evitar_poligonos=cenario["evitar"])
        coords = [(p[1], p[0]) for p in rota_geo['features'][0]['geometry']['coordinates']]

        # Exportar coordenadas
        csv_file = f"desvio4/{cenario['nome']}.csv"
        salvar_csv(coords, csv_file)
        print(f"📄 Coordenadas salvas em {csv_file}")

        # Exportar mapa
        html_file = f"desvio4/{cenario['nome']}.html"
        salvar_mapa(coords, html_file, titulo=cenario["nome"])
        print(f"🗺️ Mapa salvo em {html_file}")

    except Exception as e:
        print(f"❌ Erro ao processar {cenario['nome']}: {e}")
