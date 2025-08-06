from .geo_utils import buscar_coordenadas
from .route_utils import gerar_rota
from .export_utils import salvar_csv, salvar_mapa

# ========= PONTOS FIXOS =========
origem = buscar_coordenadas("Avenida Champagnat, 1466, Vila Velha, ES")
destino = buscar_coordenadas("Guarapari, Espírito Santo")

ponto_desvio1 = buscar_coordenadas("R. Manoel Alvarenga, 1995 - Guarapari, ES")
ponto_desvio2 = buscar_coordenadas("Av. Paris, Guarapari, ES")
parada1 = buscar_coordenadas("Praia do Morro, Guarapari, ES")
parada2 = buscar_coordenadas("Terminal de Itaparica, Vila Velha, ES")

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
    {"nome": "rota_com_paradas", "pontos": [origem, parada2, parada1, destino], "evitar": retangulo2}
]

# ========= PROCESSAR CENÁRIOS =========
for cenario in cenarios:
    print(f"\n🚀 Processando: {cenario['nome']}")

    try:
        rota_geo = gerar_rota(cenario["pontos"], evitar_poligonos=cenario["evitar"])
        coords = [(p[1], p[0]) for p in rota_geo['features'][0]['geometry']['coordinates']]

        csv_file = f"temp/{cenario['nome']}.csv"
        salvar_csv(coords, csv_file, id_rota=cenario['nome'])
        print(f"📄 Coordenadas salvas em {csv_file}")

        html_file = f"temp/{cenario['nome']}.html"
        salvar_mapa(coords, html_file, titulo=cenario["nome"])
        print(f"🗺️ Mapa salvo em {html_file}")

    except Exception as e:
        print(f"❌ Erro ao processar {cenario['nome']}: {e}")

