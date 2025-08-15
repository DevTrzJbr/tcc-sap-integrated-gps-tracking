// src/services/csv.service.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

function readCsv(fileName) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '../../..', 'temp', fileName);

    // Verifica se o arquivo existe antes de abrir
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`Arquivo CSV não encontrado: ${fileName}`));
    }

    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ',' }))
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

module.exports = { readCsv };
