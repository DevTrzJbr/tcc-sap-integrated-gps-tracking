import folium
import openrouteservice
from geopy.geocoders import Nominatim

# ========= CONFIGURAR =========
API_KEY = '5b3ce3597851110001cf6248400d5875544d49e5afb8eef2454f704f'  # Sua API Key
client = openrouteservice.Client(key=API_KEY)

# Inicializar o geocoder (OpenStreetMap)
geolocator = Nominatim(user_agent="simulador_rota")

# Buscar endereços
origem_geodata = geolocator.geocode("Avenida Champagnat, 1466, Vila Velha, ES")
destino_geodata = geolocator.geocode("Guarapari, Espírito Santo")

# Verificação de erro
if not origem_geodata or not destino_geodata:
    print("❌ Erro: Um dos endereços não foi encontrado. Verifique a grafia ou tente ser mais genérico.")
    print(f"Origem: {origem_geodata}")
    print(f"Destino: {destino_geodata}")
    exit()

# Converter (lat, lon) → (lon, lat) para API
origem = (origem_geodata.longitude, origem_geodata.latitude)
destino = (destino_geodata.longitude, destino_geodata.latitude)

# Rota original
rota_original = client.directions(
    coordinates=[origem, destino],
    profile='driving-car',
    format='geojson'
)
coords_original = [(p[1], p[0]) for p in rota_original['features'][0]['geometry']['coordinates']]

# Ponto de acidente fixo (latitude, longitude)
ponto_acidente = (-20.61122, -40.47823)

# Criar ponto de desvio próximo (~200m para leste)
# Aproximação: 0.002 graus de longitude ≈ 200 metros na latitude dessa região
desvio_lat = ponto_acidente[0]
desvio_lon = ponto_acidente[1] + 0.002
ponto_desvio = (desvio_lon, desvio_lat)  # formato (lon, lat) para API

# Rota com desvio (passando pelo ponto de desvio próximo ao acidente)
rota_com_desvio = client.directions(
    coordinates=[origem, ponto_desvio, destino],
    profile='driving-car',
    format='geojson'
)
coords_desvio = [(p[1], p[0]) for p in rota_com_desvio['features'][0]['geometry']['coordinates']]

# Criar mapa
mapa = folium.Map(location=ponto_acidente, zoom_start=13)

# Rota original
folium.PolyLine(coords_original, color='blue', weight=4, tooltip="Rota planejada").add_to(mapa)

# Rota com desvio
folium.PolyLine(coords_desvio, color='red', weight=4, tooltip="Rota com desvio").add_to(mapa)

# Marcadores
folium.Marker(coords_original[0], tooltip="Origem", icon=folium.Icon(color="green")).add_to(mapa)
folium.Marker(coords_original[-1], tooltip="Destino", icon=folium.Icon(color="blue")).add_to(mapa)

# Marcar acidente
folium.Marker(
    location=ponto_acidente,
    popup="⚠️ Acidente! Desvio aplicado",
    icon=folium.Icon(color="orange", icon="exclamation-sign")
).add_to(mapa)

# Marcar ponto de desvio
folium.Marker(
    location=(desvio_lat, desvio_lon),
    popup="🔁 Desvio",
    icon=folium.Icon(color="red", icon="arrow-right")
).add_to(mapa)

# Salvar mapa
mapa.save("rota_com_desvio2.html")
print("✅ Mapa salvo como 'rota_com_desvio2.html'")
