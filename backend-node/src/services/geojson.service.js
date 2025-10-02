// src/services/geojson.service.js
const fs = require('fs').promises;
const path = require('path');

async function getRotaGeoJson(rotaId) {
  // Exemplo: projeto/temp/rota_normal.csv
  const filePath = path.join(__dirname, '../../..', 'temp', `${rotaId}.json`);

  try {
      const data = await fs.readFile(filePath, 'utf-8'); // lê o conteúdo como string
      const json = JSON.parse(data); // converte em objeto JS
      return json;
  } catch (err) {
    console.error(`Erro ao ler o arquivo ${filePath}:`, err);
    throw err; // propaga o erro para quem chamou a função
  }

  return filePath;
}

module.exports = {
  getRotaGeoJson,
};
