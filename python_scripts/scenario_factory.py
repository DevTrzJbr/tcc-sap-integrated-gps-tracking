"""Helpers to build and execute route scenarios."""

from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path
from typing import Callable, Dict, Iterable, List, Sequence

from python_scripts.geo_utils import buscar_coordenadas
from python_scripts.models import Scenario
from python_scripts.runner import run_all

logger = logging.getLogger(__name__)

Address = str
Coordinate = Sequence[float]
PolygonLookup = Dict[str, Dict[str, object]]
RouteFamily = Dict[str, object]


def collect_addresses(route_families: Iterable[RouteFamily]) -> List[Address]:
    addresses: List[Address] = []
    seen = set()
    for family in route_families:
        for key in ("origem", "destino"):
            addr = family[key]
            if addr not in seen:
                seen.add(addr)
                addresses.append(addr)
        for variant in family.get("variants", []):
            for stop in variant.get("stops", []):
                if stop not in seen:
                    seen.add(stop)
                    addresses.append(stop)
    return addresses


def make_geocoder(fallbacks: Dict[Address, Coordinate]) -> Callable[[Address], Coordinate]:
    @lru_cache(maxsize=256)
    def geocode(address: Address) -> Coordinate:
        normalized = address.strip()
        try:
            return buscar_coordenadas(normalized)
        except ValueError:
            if normalized in fallbacks:
                logger.warning("Geocodificação falhou para %s, aplicando fallback", normalized)
                return fallbacks[normalized]
            raise

    return geocode


def build_scenarios(
    route_families: Iterable[RouteFamily],
    geocode: Callable[[Address], Coordinate],
    polygons: PolygonLookup,
) -> List[Scenario]:
    coord_cache: Dict[Address, Coordinate] = {}
    scenarios: List[Scenario] = []

    for address in collect_addresses(route_families):
        coord_cache[address] = geocode(address)
        logger.info("📍 %s -> %s", address, coord_cache[address])

    for family in route_families:
        origem = coord_cache[family["origem"]]
        destino = coord_cache[family["destino"]]

        for variant in family.get("variants", []):
            nome = variant.get("name") or f"{family['prefix']}_{variant['suffix']}"
            pontos = [origem]
            pontos.extend(coord_cache[stop] for stop in variant.get("stops", []))
            pontos.append(destino)

            evitar = None
            polygon_key = variant.get("avoid")
            if polygon_key:
                evitar = polygons.get(polygon_key)

            meta = {
                "rota": family["slug"],
                "descricao": variant.get("descricao", ""),
                "stops": variant.get("stops", []),
            }

            scenarios.append(Scenario(nome=nome, pontos=pontos, evitar=evitar, meta=meta))
            logger.info("➕ Cenário preparado: %s | pontos=%d", nome, len(pontos))

    return scenarios


def generate_routes(
    out_dir: Path,
    route_families: Iterable[RouteFamily],
    fallbacks: Dict[Address, Coordinate],
    polygons: PolygonLookup,
):
    geocode = make_geocoder(fallbacks)
    scenarios = build_scenarios(route_families, geocode, polygons)
    return run_all(scenarios, out_dir)


__all__ = [
    "collect_addresses",
    "make_geocoder",
    "build_scenarios",
    "generate_routes",
]
