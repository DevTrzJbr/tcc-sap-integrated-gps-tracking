// src/routes/veiculos.routes.js
const express = require('express');
const router = express.Router();
const VeiculosController = require('../controllers/veiculos.controller');
// Se quiser validar sessão/token do SAP futuramente:
// const authSap = require('../middlewares/authSap');

router.get('/', /* authSap, */ VeiculosController.listar);

module.exports = router;
