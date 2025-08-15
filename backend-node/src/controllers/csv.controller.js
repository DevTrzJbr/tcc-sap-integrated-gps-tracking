// src/controllers/csv.controller.js
const { readCsv } = require('../services/csv.service');

async function getRouteData(req, res) {
  try {
    const { routeName } = req.params;

    // Valida parâmetro
    if (!routeName || routeName.trim() === '') {
      return res.status(400).json({ error: 'Nome da rota é obrigatório' });
    }

    const fileName = `${routeName}.csv`;
    const data = await readCsv(fileName);

    res.json({ route: routeName, points: data });
  } catch (err) {
    if (err.message.includes('não encontrado')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Erro ao ler arquivo CSV', details: err.message });
  }
}

module.exports = { getRouteData };
