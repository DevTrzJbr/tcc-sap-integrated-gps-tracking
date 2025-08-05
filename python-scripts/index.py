import folium
import openrouteservice

# Substitua com sua chave da OpenRouteService
client = openrouteservice.Client(key='5b3ce3597851110001cf6248400d5875544d49e5afb8eef2454f704f')

# Coordenadas (longitude, latitude) - atenção à ordem!
origem = (-46.6333, -23.5505)  # São Paulo centro
destino = (-46.6500, -23.5600)  # Outro ponto

# Solicitar rota por estrada
rota = client.directions(
    coordinates=[origem, destino],
    profile='driving-car',
    format='geojson'
)

# Extrair coordenadas da rota
coords_rota = [(p[1], p[0]) for p in rota['features'][0]['geometry']['coordinates']]

# Criar mapa
mapa = folium.Map(location=coords_rota[0], zoom_start=14)

# Adicionar linha da rota real (seguindo estrada)
folium.PolyLine(coords_rota, color='blue', weight=5, tooltip="Rota pela estrada").add_to(mapa)

# Marcar origem e destino
folium.Marker(coords_rota[0], tooltip="Origem").add_to(mapa)
folium.Marker(coords_rota[-1], tooltip="Destino").add_to(mapa)

# Salvar
mapa.save("rota_estrada_real.html")
