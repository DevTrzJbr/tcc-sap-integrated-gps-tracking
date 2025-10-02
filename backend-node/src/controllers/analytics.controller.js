const analyticsService = require('../services/analytics.service');

async function getMetrics(req, res, next) {
  try {
    const { routeName } = req.params;
    const result = await analyticsService.getRouteMetrics(routeName);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function compareMetrics(req, res, next) {
  try {
    const routesParam = req.query.routes || req.query.route;
    const routeNames = Array.isArray(routesParam)
      ? routesParam
      : typeof routesParam === 'string'
        ? routesParam.split(',').map((r) => r.trim())
        : [];

    const results = await analyticsService.compareRoutes(routeNames);
    res.json({ routes: results });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMetrics,
  compareMetrics,
};
