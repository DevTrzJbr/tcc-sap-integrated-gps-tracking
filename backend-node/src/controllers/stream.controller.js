const { playCsvAsSSE } = require('../services/telemetry.service');

async function streamRun(req, res) {
    console.log('Chamou stream controller!')
  try {
    const { routeName } = req.params;
    if (!routeName || !routeName.trim()) {
      return res.status(400).json({ error: 'Nome da rota é obrigatório' });
    }

    // parâmetros opcionais
    const speed = Number(req.query.speed || 8);      // aceleração do tempo
    const minMs = Number(req.query.minMs || 300);    // atraso mínimo

    await playCsvAsSSE({ res, routeName, speed, minMs });
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Falha no stream', details: err.message });
    }
  }
}

module.exports = { streamRun };
