# Backend Node.js

API Express responsável por servir rotas e telemetria geradas pelos scripts Python, além de centralizar integrações com o SAP (mock ou reais). Ela expõe endpoints REST, um stream SSE para replay de viagens e trata arquivos CSV/GeoJSON a partir da pasta `temp/`.

O passo a passo completo de instalação, variáveis de ambiente e execução está documentado em [`../docs/backend-node-config.md`](../docs/backend-node-config.md).

Endpoints de apoio incluem:

- `GET /api/analytics/:routeName` – métricas agregadas (duração, distâncias, velocidades) para uma rota específica.
- `GET /api/analytics?routes=rota_a,rota_b` – resumo comparativo sob demanda para múltiplas rotas.
