const express = require('express');
const router = express.Router();

const landingPages = require('./landing.routes');
router.use('/', landingPages);

const veiculosRoutes = require('./veiculos.routes');
router.use('/veiculos', veiculosRoutes);

const csvRoutes = require('./csv.routes');
router.use('/rota_csv', csvRoutes);

const rotaRoutes = require('./rota.routes');
router.use('/rota', rotaRoutes);

const streamRoutes = require('./stream.routes');
router.use('/stream', streamRoutes);

module.exports = router;
