// src/routes/landing.routes.js
const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
    res.json({
        status: 'Servidor Online',
        message: 'Bem-vindo à API de Rotas e Veículos',
        version: '1.0.0',
        endpoints: {
            healthCheck: { method: 'GET', url: '/ping', description: 'Verifica se o servidor está online' },
            rotaCsv: { method: 'GET', url: '/api/rota/:nomeDaRota', description: 'Retorna pontos de uma rota CSV' },
            veiculos: { method: 'GET', url: '/api/veiculos', description: 'Lista veículos cadastrados' }
        },
        example: {
            rotaCsv: '/api/rota/rota_normal',
            veiculos: '/api/veiculos'
        }
    });
});

module.exports = router;
