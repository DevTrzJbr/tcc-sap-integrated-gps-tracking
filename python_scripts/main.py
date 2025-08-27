import logging
from pathlib import Path
from functools import lru_cache

from python_scripts.models import Scenario
from python_scripts.runner import run_all
from python_scripts.geo_utils import buscar_coordenadas  # já existente

# ————— logging básico (console)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s - %(message)s"
)

# Cache simples para evitar geocodificar o mesmo endereço toda hora
@lru_cache(maxsize=64)
def geocode(q: str):
    return buscar_coordenadas(q)  # (lon,lat)

def main():
    # ========= PONTOS FIXOS =========
    origem   = geocode("Avenida Champagnat, 1466, Vila Velha, ES")
    destino  = geocode("Guarapari, Espírito Santo")

    ponto_desvio1 = geocode("R. Manoel Alvarenga, 1995 - Guarapari, ES")
    ponto_desvio2 = geocode("Av. Paris, Guarapari, ES")
    parada1       = geocode("Praia do Morro, Guarapari, ES")
    parada2       = geocode("Terminal de Itaparica, Vila Velha, ES")

    logging.info("📍 Coordenadas obtidas | origem=%s destino=%s", origem, destino)

    # ========= ÁREAS PROIBIDAS =========
    retangulo1 = {
        "type": "Polygon",
        "coordinates": [[
            [-40.44, -20.62],
            [-40.45, -20.61],
            [-40.46, -20.63],
            [-40.43, -20.64],
            [-40.44, -20.62]
        ]]
    }

    retangulo2 = {
        "type": "Polygon",
        "coordinates": [[
            [-40.47, -20.59],
            [-40.48, -20.60],
            [-40.49, -20.58],
            [-40.46, -20.57],
            [-40.47, -20.59]
        ]]
    }

    # ========= CENÁRIOS =========
    cenarios = [
        Scenario(nome="rota_normal",         pontos=[origem, destino]),
        Scenario(nome="rota_com_desvio_1",   pontos=[origem, ponto_desvio1, destino], evitar=retangulo1),
        Scenario(nome="rota_com_paradas",    pontos=[origem, parada2, parada1, destino], evitar=retangulo1),
        # Ex.: Scenario(nome="rota_com_desvio_2", pontos=[origem, ponto_desvio2, destino], evitar=retangulo2),
    ]

    # ========= EXECUÇÃO =========
    out_dir = Path("temp")
    run_all(cenarios, out_dir)

if __name__ == "__main__":
    main()
