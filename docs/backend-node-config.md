# Configuração do Backend Node.js

Este documento reúne os passos para instalar e executar o servidor Express responsável por expor as APIs de rota, telemetria e mock SAP.

## Pré-requisitos

- Node.js 18+ (recomendado o LTS mais recente)
- npm ou yarn

## Instalação

```bash
cd backend-node
npm install
```

## Variáveis de ambiente

Crie um arquivo `.env` na pasta `backend-node/` (ou exporte as variáveis) com os parâmetros abaixo:

```env
PORT=3000

# --- SAP ---
SAP_BASE_URL=https://sap-gateway.exemplo.com
SAP_ODATA_PATH=/sap/opu/odata/sap/ZMEU_SRV
SAP_USER=
SAP_PASS=

# Utiliza mocks locais enquanto o SAP real não estiver disponível
USE_MOCK=true

# Diretório onde ficam os CSV/GeoJSON gerados pelos scripts Python
CSV_DIR=../temp
```

Se `CSV_DIR` não for informado, o serviço usa automaticamente `../temp` em relação ao projeto backend.

## Scripts disponíveis

- `npm run dev` – inicia o servidor com Nodemon (desenvolvimento).
- `npm start` – inicia o servidor com Node (produção).

## Endpoints principais

- `GET /api/veiculos` – lista veículos vindos do SAP ou do mock local.
- `GET /api/rota/:routeName` – entrega o GeoJSON de uma rota (ex.: `rota_normal`).
- `GET /api/rota_csv/:routeName` – devolve os pontos em CSV no formato JSON.
- `GET /api/stream/:routeName` – stream SSE para replay em tempo real; aceita `speed` e `minMs` como query params.
- `GET /api/analytics/:routeName` – retorna métricas resumidas de uma rota (duração, distância, velocidade).
- `GET /api/analytics?routes=rota1,rota2` – gera comparativo rápido entre múltiplas rotas.
- `GET /api/transportes` – lista transportes mapeados e as rotas/arquivos disponíveis para cada um.
- `GET /api/transportes/:transporteId` – detalhes de um transporte específico.
- `GET /replay` – página simples de teste para o stream.

Os arquivos consumidos por essas rotas devem estar em `temp/` (criados pelos scripts Python).

## Estrutura de pastas (resumo)

```
backend-node/
├── src/
│   ├── data/            # Catálogos estáticos (ex.: transportes e rotas)
│   ├── routes/          # Rotas REST e SSE
│   ├── controllers/     # Orquestra leitura de CSV e respostas
│   ├── services/        # Telemetria, SAP, CSV, GeoJSON
│   ├── config/          # Leitura de variáveis de ambiente
│   ├── middlewares/     # Tratamento de erros
│   ├── app.js           # App Express
│   └── public/          # Conteúdo estático (replay.html)
└── package.json
```

Com o backend ativo (porta 3000 por padrão), o projeto CAP consegue consumir as rotas através do proxy `/ext`.
