// testCsv.js
const { readCsv } = require('../services/csvService');

(async () => {
  try {
    const data = await readCsv('rota_normal.csv');
    console.log('Dados lidos do CSV:');
    console.table(data);
  } catch (err) {
    console.error('Erro ao ler CSV:', err.message);
  }
})();
