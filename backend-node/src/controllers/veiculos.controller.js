// src/controllers/veiculos.controller.js
const sapService = require('../services/sap.service');

exports.listar = async (req, res, next) => {
  try {
    const dados = await sapService.listarVeiculos();
    res.json(dados);
  } catch (err) {
    next(err);
  }
};
