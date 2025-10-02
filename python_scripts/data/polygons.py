"""GeoJSON polygons representing areas to avoid in certain scenarios."""

from typing import Dict, List, Tuple

LonLat = Tuple[float, float]
Polygon = Dict[str, object]


def _make_polygon(nome: str, coords: List[LonLat]) -> Polygon:
    ring = list(coords)
    if ring[0] != ring[-1]:
        ring.append(ring[0])
    return {"type": "Polygon", "coordinates": [ring], "nome": nome}


POLYGONS: Dict[str, Polygon] = {
    "vv_zona_portuaria": _make_polygon(
        "Área Portuária de Vila Velha",
        [
            (-40.44, -20.62),
            (-40.45, -20.61),
            (-40.46, -20.63),
            (-40.43, -20.64),
        ],
    ),
    "vv_centro_historico": _make_polygon(
        "Centro Histórico de Guarapari",
        [
            (-40.50, -20.66),
            (-40.51, -20.64),
            (-40.53, -20.67),
            (-40.48, -20.68),
        ],
    ),
    "vit_serra_porto": _make_polygon(
        "Complexo Portuário Vitória/Serra",
        [
            (-40.32, -20.32),
            (-40.30, -20.29),
            (-40.28, -20.32),
            (-40.30, -20.35),
        ],
    ),
    "vit_serra_industrial": _make_polygon(
        "Zona Industrial da Serra",
        [
            (-40.29, -20.28),
            (-40.26, -20.28),
            (-40.25, -20.32),
            (-40.29, -20.33),
        ],
    ),
    "cgr_aero_ilha": _make_polygon(
        "Ilha Logística Vitória",
        [
            (-40.34, -20.30),
            (-40.32, -20.28),
            (-40.30, -20.31),
            (-40.33, -20.33),
        ],
    ),
}

__all__ = ["POLYGONS"]
