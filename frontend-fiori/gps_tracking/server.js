// server.js (CAP custom server)
const cds = require('@sap/cds');
const { createProxyMiddleware } = require('http-proxy-middleware');

cds.on('bootstrap', app => {
  const TARGET = process.env.TRACKING_API || 'http://localhost:3000'; // seu Express
  app.use(
    '/ext',
    createProxyMiddleware({
      target: TARGET,
      changeOrigin: true,
      pathRewrite: { '^/ext': '/api' }, // /ext/rota/foo -> http://localhost:3000/api/rota/foo
      ws: true
    })
  );
});

module.exports = cds.server;
