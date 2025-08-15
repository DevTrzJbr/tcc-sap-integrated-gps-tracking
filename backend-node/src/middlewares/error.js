// src/middlewares/error.js
function notFoundHandler(req, res, _next) {
  res.status(404).json({ error: 'Rota não encontrada' });
}

function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Erro interno do servidor'
  });
}

module.exports = { notFoundHandler, errorHandler };
