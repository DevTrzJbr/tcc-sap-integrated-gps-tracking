# Configuração do CAP + Fiori

Este guia cobre a execução do projeto CAP que expõe o serviço `TransporteService` e entrega a aplicação SAP Fiori/UI5 `gps_tracking`.

## Pré-requisitos

- Node.js 18+ (ou versão exigida pelo CAP)
- @sap/cds-dk instalado globalmente (opcional): `npm install -g @sap/cds-dk`
- Backend Node rodando ou acessível para proxiar `/ext`

## Instalação

```bash
cd frontend-fiori/gps_tracking
npm install
```

## Executando em desenvolvimento

```bash
cds watch
```

O comando levanta o CAP na porta 4004 e abre a aplicação em `http://localhost:4004/gps_tracking/webapp/index.html?sap-ui-xx-viewCache=false`.

O arquivo `server.js` adiciona um proxy para o backend Node:

```js
app.use(
  "/ext",
  createProxyMiddleware({
    target: process.env.TRACKING_API || "http://localhost:3000",
    pathRewrite: { "^/ext": "/api" },
  })
);
```

Certifique-se de que `TRACKING_API` aponte para o backend correto (padrão: `http://localhost:3000`).

## Estrutura relevante

```
frontend-fiori/gps_tracking/
├── db/schema.cds            # Modelo de dados Transporte
├── srv/transporte-srv.cds   # Serviço OData
├── app/gps_tracking/webapp  # Aplicação UI5
└── server.js                # Proxy para o backend Node
```

### Aplicação UI5

- **Home**: lista transportes e permite criar registros via OData.
- **Detail**: consome `/ext/rota/:routeName` para o traçado e `/ext/stream/:routeName` para o replay em tempo real no Leaflet.
- **Page2**: tela demonstrativa com SplitApp e helper de mapa.

### Deploy

Os scripts `npm run build` e `npm run deploy` utilizam `mbt` e Cloud Foundry; ajuste o `mta.yaml` conforme o ambiente SAP BTP antes de publicar.
