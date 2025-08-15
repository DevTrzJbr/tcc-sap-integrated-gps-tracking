// src/middlewares/authSap.js
// Exemplo: validar ticket/cookie/authorization vindo do SAP (quando tiver)
module.exports = function authSap(req, res, next) {
  // Ex: const token = req.headers['authorization'];
  // Validar token/sessão contra SAP ou BTP
  return next();
};
