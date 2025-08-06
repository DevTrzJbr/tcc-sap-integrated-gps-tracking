import openrouteservice

from .config import API_KEY

client = openrouteservice.Client(key=API_KEY)

def gerar_rota(pontos, evitar_poligonos=None):
    return client.directions(
        coordinates=pontos,
        profile='driving-car',
        format='geojson',
        options={"avoid_polygons": evitar_poligonos} if evitar_poligonos else None
    )
