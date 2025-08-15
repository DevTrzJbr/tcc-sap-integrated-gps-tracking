// src/services/sap.service.js
const axios = require('axios');
const path = require('path');
const { SAP_BASE_URL, SAP_USER, SAP_PASS, SAP_ODATA_PATH, USE_MOCK } = require('../config');

const veiculosMock = require('./mocks/veiculos.json');

async function listarVeiculos() {
  if (USE_MOCK) {
    // Simulação local enquanto o SAP não está disponível
    return veiculosMock;
  }

  // Exemplo de chamada OData simples (ajuste URL/entidade conforme seu SAP)
  const url = `${SAP_BASE_URL}${SAP_ODATA_PATH}/VeiculosSet?$format=json`;

  const resp = await axios.get(url, {
    auth: SAP_USER && SAP_PASS ? { username: SAP_USER, password: SAP_PASS } : undefined,
    headers: { Accept: 'application/json' },
    // Se precisar enviar cookies/ticket do SAP via cabeçalhos, faça aqui
  });

  // Adapte o parse conforme a estrutura retornada pelo seu OData
  return resp.data?.d?.results ?? resp.data;
}

module.exports = { listarVeiculos };
