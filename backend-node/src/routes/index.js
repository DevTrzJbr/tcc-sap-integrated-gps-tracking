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

const analyticsRoutes = require('./analytics.routes');
router.use('/analytics', analyticsRoutes);

// Página simples de teste do stream (replay)
router.get('/replay', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'replay.html'));
});

module.exports = router;
