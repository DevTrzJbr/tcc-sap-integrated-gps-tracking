from geopy.geocoders import Nominatim

from .config import USER_AGENT

geolocator = Nominatim(user_agent=USER_AGENT, timeout=3)

def buscar_coordenadas(endereco):
    geo = geolocator.geocode(endereco)
    if not geo:
        raise ValueError(f"❌ Endereço não encontrado: {endereco}")
    return (geo.longitude, geo.latitude)
