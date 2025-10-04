// src/routes/landing.routes.js
const express = require('express');
const path = require('path');
const router = express.Router();

const { getRouteData } = require('../controllers/csv.controller');
const { streamRun } = require('../controllers/stream.controller');

router.get('/', (_req, res) => {
    res.json({
        status: 'Servidor Online',
        message: 'Bem-vindo à API de Rotas e Veículos',
        version: '1.0.0',
        endpoints: {
            healthCheck: { method: 'GET', url: '/ping', description: 'Verifica se o servidor está online' },
            rota: { method: 'GET', url: '/api/rota/:routeName', description: 'Retorna pontos de uma rota CSV' },
            stream: { method: 'GET', url: '/api/stream/:routeName', description: 'Reproduz rota em SSE a partir de CSV' },
            veiculos: { method: 'GET', url: '/api/veiculos', description: 'Lista veículos cadastrados' },
            transportes: { method: 'GET', url: '/api/transportes', description: 'Catálogo de transportes e rotas disponíveis' },
            analytics: { method: 'GET', url: '/api/analytics?routes=rota1,rota2', description: 'Resumo de distância/tempo por rota (comparativo)' },
            replay: { method: 'GET', url: '/replay', description: 'Abre página de teste para stream no navegador' }
        },
        example: {
            rota: '/api/rota/rota_normal',
            stream: '/api/stream/rota_normal',
            veiculos: '/api/veiculos',
            transportes: '/api/transportes',
            analytics: '/api/analytics?routes=rota_cgr_aero_vix_base,rota_cgr_aero_vix_via-praca-namorados',
            replay: '/replay'
        }
    });
});

module.exports = router;
