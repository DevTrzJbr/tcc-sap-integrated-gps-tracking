// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error');

const app = express();

// Segurança e performance
// Segurança e performance
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],                 // todos scripts locais (sem CDN nem inline)
      "style-src": ["'self'", "'unsafe-inline'"], // Leaflet usa CSS inline para ícones
      "img-src": ["'self'", "data:", "https://*.tile.openstreetmap.org"], // tiles do OSM + data URIs
      "connect-src": ["'self'"],               // SSE no mesmo host (/api/stream/..)
      "object-src": ["'none'"],
      "worker-src": ["'self'"]
    }
  }
}));

app.use(compression());

// Logs e payloads
app.use(morgan('dev'));
app.use(express.json());

// CORS (libera UI5 local, ajuste conforme necessário)
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'null'],
  credentials: true
}));

// Rota padrão
app.get('/', (_req, res) => {
  res.redirect('/api/');
});

// Rota de saúde
app.get('/ping', (_req, res) => res.json({ status: 'ok' }));

// Rotas da API
app.use('/api', routes);

const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'public')));

// Middlewares de erro
app.use(notFoundHandler);
app.use(errorHandler);

// Sobe o servidor se este arquivo for executado diretamente
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
