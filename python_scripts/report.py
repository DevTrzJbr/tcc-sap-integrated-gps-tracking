"""Simple script to summarise generated route CSV files."""

from __future__ import annotations

import argparse
import csv
import logging
import math
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s :: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("route_report")

Point = Dict[str, object]
Seconds = float
Meters = float
Kilometers = float


def _haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> Meters:
    radius = 6371000.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = phi2 - phi1
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * radius * math.asin(math.sqrt(a))


def _parse_points(csv_path: Path) -> List[Point]:
    points: List[Point] = []
    with csv_path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            try:
                ts = datetime.fromisoformat(row["Timestamp"])
            except ValueError:
                logger.warning("Ignorando linha sem timestamp válido em %s", csv_path)
                continue
            try:
                lat = float(row["Latitude"])
                lon = float(row["Longitude"])
            except (TypeError, ValueError):
                logger.warning("Ignorando linha sem coordenadas válidas em %s", csv_path)
                continue
            points.append(
                {
                    "idx": int(row["ID do Ponto"].replace("poly-", "0")) if row["ID do Ponto"] else len(points) + 1,
                    "lat": lat,
                    "lon": lon,
                    "ts": ts,
                    "tipo": row.get("Tipo", ""),
                    "nome": row.get("Nome") or "",
                }
            )
    return points


def _analyse(points: List[Point]) -> Dict[str, object]:
    if len(points) < 2:
        raise ValueError("CSV deve conter pelo menos dois pontos")

    distancia_m: Meters = 0.0
    tempo_parado: Seconds = 0.0
    tempo_em_movimento: Seconds = 0.0
    stops: Dict[str, Seconds] = defaultdict(float)

    for prev, curr in zip(points, points[1:]):
        distancia_m += _haversine_m(prev["lat"], prev["lon"], curr["lat"], curr["lon"])
        delta = (curr["ts"] - prev["ts"]).total_seconds()
        if delta > 0:
            tempo_em_movimento += delta

    inicio, fim = points[0], points[-1]
    duracao_total = (fim["ts"] - inicio["ts"]).total_seconds()

    for point, next_point in zip(points, points[1:]):
        if point["tipo"] == "flag" and point["nome"] and point["nome"].lower() not in {"origem", "destino"}:
            delta = (next_point["ts"] - point["ts"]).total_seconds()
            if delta > 0:
                tempo_parado += delta
                stops[point["nome"]] += delta
                tempo_em_movimento -= delta

    distancia_km: Kilometers = distancia_m / 1000
    velocidade_media = distancia_km / (duracao_total / 3600) if duracao_total > 0 else 0.0
    velocidade_movimento = distancia_km / (tempo_em_movimento / 3600) if tempo_em_movimento > 0 else 0.0

    return {
        "pontos": len(points),
        "duracao_s": duracao_total,
        "duracao_min": duracao_total / 60,
        "distancia_km": distancia_km,
        "velocidade_media": velocidade_media,
        "velocidade_movimento": velocidade_movimento,
        "tempo_parado_s": tempo_parado,
        "tempo_parado_min": tempo_parado / 60,
        "stops": {nome: segundos for nome, segundos in stops.items()},
    }


def _format_duration(seconds: Seconds) -> str:
    mins, secs = divmod(int(seconds), 60)
    hours, mins = divmod(mins, 60)
    return f"{hours:02d}:{mins:02d}:{secs:02d}"


def analyse_csv(csv_path: Path):
    points = _parse_points(csv_path)
    if not points:
        logger.warning("Nenhum ponto válido encontrado em %s", csv_path)
        return

    metrics = _analyse(points)
    logger.info("📄 %s", csv_path.name)
    logger.info("   Pontos capturados: %s", metrics["pontos"])
    logger.info("   Duração total: %s (%0.1f minutos)", _format_duration(metrics["duracao_s"]), metrics["duracao_min"])
    logger.info("   Distância total: %0.2f km", metrics["distancia_km"])
    logger.info("   Velocidade média: %0.2f km/h", metrics["velocidade_media"])
    logger.info("   Tempo parado total: %s (%0.1f minutos)", _format_duration(metrics["tempo_parado_s"]), metrics["tempo_parado_min"])
    logger.info("   Velocidade média em movimento: %0.2f km/h", metrics["velocidade_movimento"])
    if metrics["stops"]:
        for nome, segundos in metrics["stops"].items():
            logger.info("      • %s: %s (%0.1f minutos)", nome, _format_duration(segundos), segundos / 60)


def _iter_csvs(path: Path) -> Iterable[Path]:
    if path.is_file():
        yield path
    else:
        yield from sorted(path.glob("*.csv"))


def main():
    parser = argparse.ArgumentParser(description="Analisa arquivos CSV de rotas gerados pelos scripts Python.")
    parser.add_argument("path", nargs="?", default="temp", help="Arquivo CSV ou diretório contendo os arquivos (default: temp)")
    args = parser.parse_args()

    base = Path(args.path)
    if not base.exists():
        parser.error(f"Caminho não encontrado: {base}")

    for csv_path in _iter_csvs(base):
        if csv_path.is_file():
            analyse_csv(csv_path)


if __name__ == "__main__":
    main()
