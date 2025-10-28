# Configuração dos Scripts Python

Os scripts em `python_scripts/` geram cenários de rotas, consultam coordenadas via Nominatim e usam a API do OpenRouteService para exportar arquivos CSV, GeoJSON e HTML.

## Pré-requisitos

- Python 3.10+
- Chave da API OpenRouteService configurada em `python_scripts/config.py`

## Instalação do ambiente virtual

```bash
cd python_scripts
python -m venv venv
```

Ative o ambiente virtual:

- **macOS/Linux**: `source venv/bin/activate`
- **Windows (PowerShell)**: `venv\Scripts\Activate`
  - Se necessário, libere a execução de scripts: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

## Dependências

```bash
pip install -r requirements.txt
```

Principais pacotes: `openrouteservice`, `geopy`, `folium`, `shapely`.

## Execução

```bash
./python_scripts/venv/bin/python -m python_scripts.main
```

O script principal:

1. Monta cenários definidos nas estruturas de dados de `python_scripts.data` (pontos fixos, desvios e áreas a evitar).
2. Calcula as rotas (`route_utils.py`).
3. Salva os resultados em `temp/` (CSV, GeoJSON e mapa HTML) para serem consumidos pelo backend e frontend.

### Ajustes úteis

- Ajuste as coleções em `python_scripts/data/` para alterar pontos, desvios e áreas proibidas.
- Ajuste `python_scripts/config.py` para informar outra chave de API ou user-agent.
- Funções auxiliares em `runner.py`, `export_utils.py` e `validators.py` podem ser reutilizadas em novos cenários.
- Caso queira orquestrar as rotas a partir de outro script, importe `python_scripts.generate_routes` ou construa cenários com `python_scripts.scenario_factory.build_scenarios`.
- Utilize `python python_scripts/report.py` para analisar os CSVs gerados (duração, distância, velocidade média e tempo parado por parada).

Mantenha a pasta `temp/` acessível para o backend (`CSV_DIR`) e para o CAP (proxy `/ext`).
