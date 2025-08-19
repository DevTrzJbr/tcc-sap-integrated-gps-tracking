// src/controllers/rota.controller.js
const { getRotaGeoJson } = require('../services/rota.service');

async function getRota(req, res, next) {
  try {
    const { routeName } = req.params;
    const geojson = await getRotaGeoJson(routeName);
    res.json(geojson);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRota,
};