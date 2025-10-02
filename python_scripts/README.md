# Simulador de Rotas (Python)

Conjunto de scripts que monta cenários de deslocamento, consulta coordenadas no Nominatim e gera rotas com a API do OpenRouteService. O resultado é exportado em CSV, GeoJSON e HTML para alimentar o backend e o frontend.

Use `python -m python_scripts.main` para executar o pipeline padrão ou importe `python_scripts.generate_routes` em outros scripts para orquestrar cenários personalizados a partir de `python_scripts.data`.

Para inspecionar os arquivos CSV gerados, rode `python python_scripts/report.py` (ou aponte para um arquivo específico) e veja no log duração, distância total, tempo parado por parada e velocidade média.

As instruções de ambiente virtual, dependências e execução estão descritas em [`../docs/python-scripts-config.md`](../docs/python-scripts-config.md).
