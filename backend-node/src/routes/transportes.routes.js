// src/routes/transportes.routes.js
const express = require('express');

const router = express.Router();
const TransportesController = require('../controllers/transportes.controller');

router.get('/', TransportesController.listar);
router.get('/:transporteId', TransportesController.detalhe);

module.exports = router;
