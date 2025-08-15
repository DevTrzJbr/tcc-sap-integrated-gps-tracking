// src/routes/index.js
const express = require('express');
const router = express.Router();

const veiculosRoutes = require('./veiculos.routes');

router.use('/veiculos', veiculosRoutes);

module.exports = router;
