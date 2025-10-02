// src/services/csv.service.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// 1) diretório base configurável (ENV) com fallback
const BASE_CSV_DIR = process.env.CSV_DIR
  ? path.resolve(process.env.CSV_DIR)
  : path.resolve(__dirname, '..', '..', '..', 'temp');

// 2) evita traversal e normaliza o nome (só letras, números, _ e -)
function safeName(name) {
  return String(name || '').trim().replace(/[^a-z0-9_\-]/gi, '_');
}

function readCsv(fileNameOrRoute) {
  return new Promise((resolve, reject) => {
    // aceita “rota” (sem .csv) ou “arquivo.csv”
    const base = fileNameOrRoute.endsWith('.csv')
      ? fileNameOrRoute.slice(0, -4)
      : fileNameOrRoute;
    const filePath = path.join(BASE_CSV_DIR, `${safeName(base)}.csv`);

    // log útil pra depurar caminho final
    console.log('[CSV] lendo:', filePath);

    if (!fs.existsSync(filePath)) {
      const err = new Error(`Arquivo CSV não encontrado: ${path.basename(filePath)}`);
      err.code = 'ENOENT';
      err.filePath = filePath;
      return reject(err);
    }

    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ',', mapHeaders: ({ header }) => header.trim() }))
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

module.exports = { readCsv, BASE_CSV_DIR, safeName };
