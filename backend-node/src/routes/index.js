// src/routes/index.js
const express = require('express');
const router = express.Router();

const veiculosRoutes = require('./veiculos.routes');

router.use('/veiculos', veiculosRoutes);

const csvRoutes = require('./csv.routes');

router.use('/rota', csvRoutes);



module.exports = router;
