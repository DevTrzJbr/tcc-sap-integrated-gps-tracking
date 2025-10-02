const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analytics.controller');

router.get('/', AnalyticsController.compareMetrics);
router.get('/:routeName', AnalyticsController.getMetrics);

module.exports = router;
