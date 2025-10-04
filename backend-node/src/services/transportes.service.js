// src/services/transportes.service.js
const fs = require('fs');
const path = require('path');

const { TRANSPORTES } = require('../data/transportes.config');
const HttpError = require('../utils/httpError');
const { BASE_CSV_DIR, safeName } = require('./csv.service');

const BASE_FILES_DIR = process.env.CSV_DIR
  ? path.resolve(process.env.CSV_DIR)
  : path.resolve(BASE_CSV_DIR);

function resolveFile(fileName) {
  const sanitized = safeName(fileName.replace(/\.(csv|json)$/i, ''));
  const csvPath = path.join(BASE_FILES_DIR, `${sanitized}.csv`);
  const jsonPath = path.join(BASE_FILES_DIR, `${sanitized}.json`);

  return {
    csv: fs.existsSync(csvPath) ? csvPath : null,
    geojson: fs.existsSync(jsonPath) ? jsonPath : null,
  };
}

function buildRoutePayload(routeDef) {
  const files = resolveFile(routeDef.id);
  const available = Boolean(files.csv || files.geojson);

  return {
    id: routeDef.id,
    titulo: routeDef.titulo,
    descricao: routeDef.descricao,
    disponivel: available,
    arquivos: {
      csv: files.csv ? path.basename(files.csv) : null,
      geojson: files.geojson ? path.basename(files.geojson) : null,
    },
    endpoints: {
      csv: `/api/rota_csv/${encodeURIComponent(routeDef.id)}`,
      geojson: `/api/rota/${encodeURIComponent(routeDef.id)}`,
      stream: `/api/stream/${encodeURIComponent(routeDef.id)}`,
      analytics: `/api/analytics/${encodeURIComponent(routeDef.id)}`,
    },
  };
}

function buildTransportePayload(transporteDef) {
  return {
    id: transporteDef.id,
    codigo: transporteDef.codigo,
    nome: transporteDef.nome,
    descricao: transporteDef.descricao,
    origem: transporteDef.origem,
    destino: transporteDef.destino,
    rotas: transporteDef.rotas.map(buildRoutePayload),
  };
}

function listarTransportes() {
  return TRANSPORTES.map(buildTransportePayload);
}

function obterTransportePorId(transporteId) {
  const found = TRANSPORTES.find((item) => item.id === transporteId);
  if (!found) {
    throw new HttpError(404, `Transporte '${transporteId}' não foi configurado`);
  }
  return buildTransportePayload(found);
}

module.exports = {
  listarTransportes,
  obterTransportePorId,
};
