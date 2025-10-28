import math
import openrouteservice
from .config import API_KEY

client = openrouteservice.Client(key=API_KEY)


def _haversine_km(p1, p2):
    lon1, lat1 = p1
    lon2, lat2 = p2
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def _fallback_route(pontos):
    distancia_km = 0.0
    for a, b in zip(pontos, pontos[1:]):
        distancia_km += _haversine_km(a, b)

    velocidade_media_kmh = 80.0
    duracao_horas = distancia_km / velocidade_media_kmh if velocidade_media_kmh else 0
    duracao_min = duracao_horas * 60

    feature = {
        "type": "Feature",
        "properties": {
            "summary": {
                "distance": distancia_km * 1000,
                "duration": duracao_min * 60,
            }
        },
        "geometry": {
            "type": "LineString",
            "coordinates": pontos,
        },
    }

    return {
        "type": "FeatureCollection",
        "features": [feature],
    }, distancia_km, duracao_min


def gerar_rota(pontos, evitar_poligonos=None, preference='shortest'):
    params = {
        "coordinates": pontos,
        "profile": "driving-car",
        "format": "geojson",
        "preference": preference
    }
    if evitar_poligonos:
        params["options"] = {"avoid_polygons": evitar_poligonos}

    try:
        resposta = client.directions(**params)

        distancia_km = None
        duracao_min = None
        try:
            summary = resposta['features'][0]['properties']['summary']
            distancia_km = summary['distance'] / 1000
            duracao_min = summary['duration'] / 60
        except Exception as e:
            print(f"⚠️ Erro ao extrair resumo da rota: {e}")

        return resposta, distancia_km, duracao_min
    except Exception as err:
        print(f"⚠️ Falha ao chamar OpenRouteService ({err}), usando fallback simples.")
        return _fallback_route(pontos)
