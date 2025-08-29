from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

LonLat = Tuple[float, float]  # (lon, lat)

GeoJSON = Dict[str, Any]
PolygonGeoJSON = Dict[str, Any]


@dataclass
class Scenario:
    nome: str
    pontos: List[LonLat]                       # [(lon, lat), ...]
    evitar: Optional[PolygonGeoJSON] = None    # Polygon GeoJSON
    meta: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RunOutput:
    scenario: Scenario
    out_dir: Path
    csv_file: Path
    html_file: Path
    geojson_file: Path
    inserted_points: int = 0
    distancia_km: float = 0.0
    duracao_min: float = 0.0
