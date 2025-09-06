const express = require('express');
const router = express.Router();
const { streamRun } = require('../controllers/stream.controller');

// SSE: /stream/:routeName?speed=8&minMs=300
router.get('/:routeName', streamRun);

module.exports = router;
