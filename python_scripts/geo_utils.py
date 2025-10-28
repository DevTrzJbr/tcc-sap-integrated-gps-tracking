from geopy.geocoders import Nominatim
from geopy.exc import GeocoderServiceError

from .config import USER_AGENT

geolocator = Nominatim(user_agent=USER_AGENT, timeout=3)

def buscar_coordenadas(endereco):
    try:
        geo = geolocator.geocode(endereco)
    except GeocoderServiceError as err:
        raise ValueError(f"Falha ao geocodificar {endereco}: {err}") from err

    if not geo:
        raise ValueError(f"❌ Endereço não encontrado: {endereco}")
    return (geo.longitude, geo.latitude)
