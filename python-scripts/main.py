from .geo_utils import buscar_coordenadas
from .route_utils import gerar_rota
from .export_utils import salvar_csv, salvar_mapa


def validar_coordenadas(pontos, nome_cenario):
    """Valida se todas as coordenadas estão no formato (lon, lat)"""
    for idx, p in enumerate(pontos, start=1):
        if not isinstance(p, (tuple, list)) or len(p) != 2:
            raise ValueError(f"{nome_cenario}: Ponto {idx} inválido: {p}")
        lon, lat = p
        if not (-180 <= lon <= 180) or not (-90 <= lat <= 90):
            raise ValueError(f"{nome_cenario}: Coordenadas fora do intervalo: {p}")


# ========= PONTOS FIXOS =========
origem = buscar_coordenadas("Avenida Champagnat, 1466, Vila Velha, ES")
destino = buscar_coordenadas("Guarapari, Espírito Santo")

ponto_desvio1 = buscar_coordenadas("R. Manoel Alvarenga, 1995 - Guarapari, ES")
ponto_desvio2 = buscar_coordenadas("Av. Paris, Guarapari, ES")
parada1 = buscar_coordenadas("Praia do Morro, Guarapari, ES")
parada2 = buscar_coordenadas("Terminal de Itaparica, Vila Velha, ES")

# ========= DEBUG: mostrar coordenadas =========
print("\n📍 Coordenadas obtidas:")
print("Origem:", origem)
print("Destino:", destino)
print("Ponto Desvio 1:", ponto_desvio1)
print("Ponto Desvio 2:", ponto_desvio2)
print("Parada 1:", parada1)
print("Parada 2:", parada2)

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
    {"nome": "rota_normal", "pontos": [origem, destino], "evitar": None},
    {"nome": "rota_com_desvio_1", "pontos": [origem, ponto_desvio1, destino], "evitar": retangulo1},
    {"nome": "rota_com_paradas", "pontos": [origem, parada2, parada1, destino], "evitar": retangulo1}
]

# ========= PROCESSAR CENÁRIOS =========
for cenario in cenarios:
    print(f"\n🚀 Processando: {cenario['nome']}")

    try:
        # Valida formato das coordenadas antes de gerar a rota
        validar_coordenadas(cenario["pontos"], cenario["nome"])

        # Gera rota no formato (lon, lat) e converte para (lat, lon) para o mapa
        rota_geo = gerar_rota(cenario["pontos"], evitar_poligonos=cenario["evitar"])
        coords = [(p[1], p[0]) for p in rota_geo['features'][0]['geometry']['coordinates']]

        # Exportar CSV
        csv_file = f"temp/{cenario['nome']}.csv"
        salvar_csv(coords, csv_file, id_rota=cenario['nome'])

        # Montar pontos extras
        pontos_extra = {}
        for idx, p in enumerate(cenario["pontos"][1:-1], start=1):  # intermediários
            lon, lat = p  # já está (lon, lat)
            pontos_extra[f"Ponto Extra {idx}"] = (lat, lon)

        # Exportar mapa
        html_file = f"temp/{cenario['nome']}.html"
        salvar_mapa(
            coords,
            html_file,
            titulo=cenario["nome"],
            pontos_extra=pontos_extra,
            areas_proibidas=[cenario["evitar"]] if cenario["evitar"] else None
        )

        print(f"🗺️ Mapa salvo em {html_file}")

    except Exception as e:
        print(f"❌ Erro ao processar {cenario['nome']}: {e}")
