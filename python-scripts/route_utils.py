import openrouteservice
from .config import API_KEY

client = openrouteservice.Client(key=API_KEY)

def gerar_rota(pontos, evitar_poligonos=None, preference='shortest'):
    params = {
        "coordinates": pontos,
        "profile": "driving-car",
        "format": "geojson",
        "preference": preference
    }
    if evitar_poligonos:
        params["options"] = {"avoid_polygons": evitar_poligonos}

    resposta = client.directions(**params)

    # Extrair distância (metros) e duração (segundos)
    try:
        summary = resposta['features'][0]['properties']['summary']
        distancia_km = summary['distance'] / 1000
        duracao_min = summary['duration'] / 60
        print(f"🚗 Rota: {distancia_km:.2f} km, {duracao_min:.1f} min")
    except Exception as e:
        print(f"⚠️ Erro ao extrair resumo da rota: {e}")

    return resposta
