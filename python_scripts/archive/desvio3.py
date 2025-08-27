import folium
from folium.plugins import AntPath
import openrouteservice
from shapely.geometry import shape, LineString
from geopy.geocoders import Nominatim
import time
import csv

# ========= CONFIGURAÇÕES =========
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

def rota_intersecta_area(rota_coords, area_geojson):
    linha_rota = LineString([(lon, lat) for lat, lon in rota_coords])
    poligono = shape(area_geojson)
    return linha_rota.intersects(poligono)

def adicionar_marcadores(mapa, coords, ponto_acidente=None):
    folium.Marker(coords[0], tooltip="🚀 Origem", icon=folium.Icon(color="green")).add_to(mapa)
    folium.Marker(coords[-1], tooltip="🏁 Destino", icon=folium.Icon(color="blue")).add_to(mapa)
    if ponto_acidente:
        folium.Marker(
            location=ponto_acidente,
            popup="⚠️ Acidente! Desvio aplicado",
            icon=folium.Icon(color="orange", icon="exclamation-sign")
        ).add_to(mapa)

def simular_movimento(coords):
    print("🚚 Iniciando simulação da rota...")
    for i, ponto in enumerate(coords):
        print(f"🔹 Posição {i+1}/{len(coords)}: {ponto}")
        time.sleep(0.2)

# ========= DADOS =========
origem = buscar_coordenadas("Avenida Champagnat, 1466, Vila Velha, ES")
destino = buscar_coordenadas("Guarapari, Espírito Santo")
ponto_desvio = buscar_coordenadas("R. Manoel Alvarenga, 1995 - Guarapari, ES, 29220-525")
ponto_acidente = (-20.61122, -40.47823)

retangulo_proibido = {
    "type": "Polygon",
    "coordinates": [[
        [-40.43419554113889, -20.623076925489],
        [-40.458861135228865, -20.613587593708445],
        [-40.46821668024409, -20.62913171359884],
        [-40.43285443670034, -20.640377115590127],
        [-40.43419554113889, -20.623076925489]
    ]]
}

zona_sombra_centro = (-20.586668505408504, -40.42401329169895)
raio_sombra_metros = 2000

# ========= ROTAS =========

# Rota original direta
rota_original_geo = gerar_rota([origem, destino])
coords_original = [(p[1], p[0]) for p in rota_original_geo['features'][0]['geometry']['coordinates']]

# Rota com ponto de desvio e evitando área proibida
rota_com_desvio_geo = gerar_rota([origem, ponto_desvio, destino], evitar_poligonos=retangulo_proibido)
coords_desvio = [(p[1], p[0]) for p in rota_com_desvio_geo['features'][0]['geometry']['coordinates']]

# Exportar coordenadas da rota com desvio para CSV
with open("coordenadas_desvio.csv", "w", newline="") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["Latitude", "Longitude"])
    writer.writerows(coords_desvio)

print("📄 Coordenadas da rota com desvio salvas em 'coordenadas_desvio.csv'")

# ========= MAPA =========
mapa = folium.Map(location=coords_original[0], zoom_start=13)

# Rota original (animação azul)
AntPath(coords_original, color='blue', weight=4, tooltip="Rota original").add_to(mapa)

# Rota com desvio (vermelha)
folium.PolyLine(coords_desvio, color='red', weight=4, tooltip="Rota com desvio").add_to(mapa)

# Zona de sombra (sem sinal GPS)
folium.Circle(
    location=zona_sombra_centro,
    radius=raio_sombra_metros,
    color='gray',
    fill=True,
    fill_color='black',
    fill_opacity=0.4,
    tooltip="📡 Sem sinal GPS"
).add_to(mapa)

# Área proibida (retângulo)
folium.Polygon(
    locations=[(lat, lon) for lon, lat in retangulo_proibido['coordinates'][0]],
    color='yellow',
    fill=True,
    fill_opacity=0.4,
    tooltip="🚫 Zona proibida"
).add_to(mapa)

# Marcadores
adicionar_marcadores(mapa, coords_desvio, ponto_acidente)

# Zoom automático
mapa.fit_bounds([coords_original[0], coords_original[-1]])

# ========= ANÁLISE =========
if rota_intersecta_area(coords_original, retangulo_proibido):
    print("⚠️ A ROTA ORIGINAL atravessa a área proibida!")

if rota_intersecta_area(coords_desvio, retangulo_proibido):
    print("⚠️ A ROTA COM DESVIO ainda passa por área proibida!")
else:
    print("✅ A ROTA COM DESVIO evita a área proibida com sucesso.")

# ========= SALVAR MAPA =========
mapa.save("rota_hibrida.html")
print("✅ Mapa salvo como 'rota_hibrida.html'")

# ========= SIMULAÇÃO =========
# simular_movimento(coords_desvio)
