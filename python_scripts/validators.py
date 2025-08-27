from typing import Iterable, Tuple, Dict, Any

LonLat = Tuple[float, float]  # (lon, lat)
PolygonGeoJSON = Dict[str, Any]


def validar_coordenadas(pontos: Iterable[LonLat], nome_cenario: str) -> None:
    """Garante (lon, lat) e limites válidos."""
    for idx, p in enumerate(pontos, start=1):
        if not isinstance(p, (tuple, list)) or len(p) != 2:
            raise ValueError(f"{nome_cenario}: Ponto {idx} inválido: {p}")
        lon, lat = p
        if not (-180 <= float(lon) <= 180) or not (-90 <= float(lat) <= 90):
            raise ValueError(f"{nome_cenario}: Coordenadas fora do intervalo: {p}")


def validar_poligono(poly: PolygonGeoJSON, nome_cenario: str) -> None:
    if not poly:
        return
    if poly.get("type") != "Polygon":
        raise ValueError(f"{nome_cenario}: 'evitar' deve ser GeoJSON Polygon")
    coords = poly.get("coordinates")
    if not isinstance(coords, list) or not coords or not isinstance(coords[0], list):
        raise ValueError(f"{nome_cenario}: Polygon.coordinates inválido")
    # Checa cada par (lon, lat)
    for ring in coords:
        for idx, p in enumerate(ring, start=1):
            if not isinstance(p, (tuple, list)) or len(p) != 2:
                raise ValueError(f"{nome_cenario}: vértice {idx} inválido: {p}")
            lon, lat = p
            if not (-180 <= float(lon) <= 180) or not (-90 <= float(lat) <= 90):
                raise ValueError(f"{nome_cenario}: vértice fora do intervalo: {p}")
