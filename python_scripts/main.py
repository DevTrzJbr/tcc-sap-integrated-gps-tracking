import logging
from pathlib import Path

from python_scripts.data import FALLBACK_COORDS, POLYGONS, ROUTE_FAMILIES
from python_scripts.scenario_factory import generate_routes


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s :: %(message)s",
    datefmt="%H:%M:%S",
)


def main(out_dir: Path = Path("temp")):
    logging.info(
        "Iniciando geração de cenários de rota (%d famílias)", len(ROUTE_FAMILIES)
    )
    generate_routes(out_dir=out_dir, route_families=ROUTE_FAMILIES, fallbacks=FALLBACK_COORDS, polygons=POLYGONS)


if __name__ == "__main__":
    main()
