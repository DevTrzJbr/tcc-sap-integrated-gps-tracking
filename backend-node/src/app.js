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
app.use(helmet());
app.use(compression());

// Logs e payloads
app.use(morgan('dev'));
app.use(express.json());

// CORS (libera UI5 local, ajuste conforme necessário)
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true
}));

// Rota de saúde
app.get('/ping', (_req, res) => res.json({ status: 'ok' }));

// Rotas da API
app.use('/api', routes);

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
