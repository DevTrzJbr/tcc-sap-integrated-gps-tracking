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
ponto_desvio_geodata = geolocator.geocode("R. Manoel Alvarenga, 1995 - Guarapari, ES, 29220-525")

# Verificação de erro
if not origem_geodata or not destino_geodata or not ponto_desvio_geodata:
    print("❌ Erro: Um dos endereços não foi encontrado. Verifique a grafia ou tente ser mais genérico.")
    print(f"Origem: {origem_geodata}")
    print(f"Destino: {destino_geodata}")
    print(f"Desvio: {ponto_desvio_geodata}")
    exit()

# Converter (lat, lon) → (lon, lat) para API
origem = (origem_geodata.longitude, origem_geodata.latitude)
destino = (destino_geodata.longitude, destino_geodata.latitude)
ponto_desvio = (ponto_desvio_geodata.longitude, ponto_desvio_geodata.latitude)

# Rota original
rota_original = client.directions(
    coordinates=[origem, destino],
    profile='driving-car',
    format='geojson'
)
coords_original = [(p[1], p[0]) for p in rota_original['features'][0]['geometry']['coordinates']]

# Simular acidente
ponto_acidente = (-20.61122, -40.47823)

# Rota com desvio
rota_com_desvio = client.directions(
    coordinates=[origem, ponto_desvio, destino],
    profile='driving-car',
    format='geojson'
)
coords_desvio = [(p[1], p[0]) for p in rota_com_desvio['features'][0]['geometry']['coordinates']]

# Zona de sombreamento (sem rastreamento GPS)
# zona_sombra_centro = (-20.6200, -40.4900)  # coordenadas aproximadas (exemplo)
zona_sombra_centro = (-20.586668505408504, -40.42401329169895)  # coordenadas aproximadas (exemplo)
raio_sombra_metros = 2000  # raio da zona de sombra em metros

# Retângulo proibido (exemplo)
retangulo_proibido = {
    "type": "Polygon",
    "coordinates": [[
        [-40.43419554113889, -20.623076925489],
        [-40.458861135228865, -20.613587593708445],
        [-40.46821668024409, -20.62913171359884],
        [-40.43285443670034, -20.640377115590127],
        [-40.43419554113889, -20.623076925489]  # fechar o polígono
    ]]
}

# Rota com desvio considerando a zona proibida
# (aqui usamos o retângulo proibido como uma opção de desvio)
rota_com_desvio = client.directions(
    coordinates=[origem, destino],
    profile='driving-car',
    format='geojson',
    options={
        "avoid_polygons": retangulo_proibido
    }
)

# Criar mapa
mapa = folium.Map(location=coords_original[0], zoom_start=13)

# Rota original
folium.PolyLine(coords_original, color='blue', weight=4, tooltip="Rota planejada").add_to(mapa)

# Rota com desvio
folium.PolyLine(coords_desvio, color='red', weight=4, tooltip="Rota com desvio").add_to(mapa)

# Zona de sombreamento (sem rastreamento GPS)
folium.Circle(
    location=zona_sombra_centro,
    radius=raio_sombra_metros,
    color='gray',
    fill=True,
    fill_color='black',
    fill_opacity=0.4,
    tooltip="📡 Sem sinal de rastreamento"
).add_to(mapa)

# Marcadores
folium.Marker(coords_original[0], tooltip="Origem", icon=folium.Icon(color="green")).add_to(mapa)
folium.Marker(coords_original[-1], tooltip="Destino", icon=folium.Icon(color="blue")).add_to(mapa)

# Marcar acidente
folium.Marker(
    location=ponto_acidente,
    popup="⚠️ Acidente! Desvio aplicado",
    icon=folium.Icon(color="orange", icon="exclamation-sign")
).add_to(mapa)

# Marcar zona proibida de desvio
folium.Polygon(
    locations = [(lat, lon) for point in retangulo_proibido["coordinates"][0] for lon, lat in [point]],
    color='yellow',
    fill=True,
    fill_opacity=0.4,
    tooltip="🚫 Zona proibida"
).add_to(mapa)

# Salvar mapa
mapa.save("rota_com_desvio.html")
print("✅ Mapa salvo como 'rota_com_desvio.html'")
