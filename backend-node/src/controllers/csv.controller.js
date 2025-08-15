// src/controllers/csv.controller.js
const { readCsv } = require('../services/csvService');

async function getRouteData(req, res) {
  try {
    const { routeName } = req.params;
    const fileName = `${routeName}.csv`;

    const data = await readCsv(fileName);
    res.json({ route: routeName, points: data });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao ler arquivo CSV', details: err.message });
  }
}

module.exports = { getRouteData };
