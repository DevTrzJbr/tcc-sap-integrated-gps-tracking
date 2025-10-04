// src/controllers/transportes.controller.js
const transportesService = require('../services/transportes.service');

function listar(req, res, next) {
  try {
    const data = transportesService.listarTransportes();
    res.json({ transportes: data });
  } catch (err) {
    next(err);
  }
}

function detalhe(req, res, next) {
  try {
    const { transporteId } = req.params;
    const data = transportesService.obterTransportePorId(transporteId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listar,
  detalhe,
};
