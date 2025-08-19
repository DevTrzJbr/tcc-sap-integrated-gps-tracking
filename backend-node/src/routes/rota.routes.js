// src/routes/rota.routes.js
const express = require('express');
const router = express.Router();
const RotaController = require('../controllers/rota.controller');
// Se quiser validar sessão/token do SAP futuramente:
// const authSap = require('../middlewares/authSap');

router.get('/:routeName', /* authSap, */ RotaController.getRota);

module.exports = router;
