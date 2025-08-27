import logging
from dataclasses import asdict
from pathlib import Path
from typing import Dict, List, Tuple

from .models import Scenario, RunOutput, GeoJSON, LonLat
from .validators import validar_coordenadas, validar_poligono
from .route_utils import gerar_rota
from .export_utils import salvar_csv, salvar_mapa, salvar_geo

_log = logging.getLogger("simulator")


def _to_latlon(seq_lonlat: List[LonLat]) -> List[Tuple[float, float]]:
    """Converte [(lon,lat)] -> [(lat,lon)] para consumo do mapa/export."""
    return [(lat, lon) for (lon, lat) in seq_lonlat]


def process_scenario(scenario: Scenario, base_out_dir: Path) -> RunOutput:
    """Gera rota, exporta CSV/HTML/GeoJSON e retorna metadados do run."""
    _log.info("Processando cenário: %s", scenario.nome)

    # 1) valida entradas
    validar_coordenadas(scenario.pontos, scenario.nome)
    validar_poligono(scenario.evitar, scenario.nome)

    # 2) gera rota GeoJSON (em (lon,lat) na geometria)
    rota_geo: GeoJSON = gerar_rota(scenario.pontos, evitar_poligonos=scenario.evitar)

    # 3) extrai coordenadas e converte p/ (lat,lon) para mapa/csv
    coords_lonlat = rota_geo["features"][0]["geometry"]["coordinates"]
    coords_latlon = _to_latlon(coords_lonlat)

    # 4) prepara diretórios/arquivos
    out_dir = base_out_dir / scenario.nome
    out_dir.mkdir(parents=True, exist_ok=True)

    csv_file = out_dir / f"{scenario.nome}.csv"
    html_file = out_dir / f"{scenario.nome}.html"
    geojson_file = out_dir / f"{scenario.nome}.json"

    # 5) monta pontos extras (intermediários)
    pontos_extra: Dict[str, Tuple[float, float]] = {}
    for idx, p in enumerate(scenario.pontos[1:-1], start=1):
        lon, lat = p
        pontos_extra[f"Ponto Extra {idx}"] = (lat, lon)  # (lat,lon) p/ mapa

    # 6) exporta
    salvar_csv(coords_latlon, str(csv_file), id_rota=scenario.nome)
    salvar_mapa(
        coords_latlon,
        str(html_file),
        titulo=scenario.nome,
        pontos_extra=pontos_extra or None,
        areas_proibidas=[scenario.evitar] if scenario.evitar else None,
    )
    salvar_geo(rota_geo, str(geojson_file), titulo=scenario.nome)

    _log.info("Concluído: %s (CSV=%s | HTML=%s | GEO=%s)",
              scenario.nome, csv_file, html_file, geojson_file)

    return RunOutput(
        scenario=scenario,
        out_dir=out_dir,
        csv_file=csv_file,
        html_file=html_file,
        geojson_file=geojson_file,
        inserted_points=len(coords_latlon),
    )


def run_all(cenarios: List[Scenario], base_out_dir: Path) -> List[RunOutput]:
    results: List[RunOutput] = []
    for c in cenarios:
        try:
            results.append(process_scenario(c, base_out_dir))
        except Exception as e:
            _log.exception("Erro ao processar '%s': %s", c.nome, e)
    _log.info("Resumo de execução: %s",
              [dict(nome=r.scenario.nome, pontos=r.inserted_points, out=str(r.out_dir)) for r in results])
    return results
