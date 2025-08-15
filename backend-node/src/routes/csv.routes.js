// src/routes/csv.routes.js
const express = require('express');
const router = express.Router();
const CsvController = require('../controllers/csv.controller');
// Se quiser validar sessão/token do SAP futuramente:
// const authSap = require('../middlewares/authSap');

router.get('/:routeName', /* authSap, */ CsvController.getRouteData);

module.exports = router;
