# TCC SAP Integrated GPS Tracking

Este monorepo reúne os componentes do projeto de TCC para simular, expor e visualizar rotas de transporte integradas ao ecossistema SAP. Ele está organizado em três pilares principais:

- **python_scripts** – gera cenários de deslocamento usando OpenRouteService e exporta CSV/GeoJSON/HTML para alimentar as demais camadas.
- **backend-node** – publica APIs REST e um stream SSE com base nos arquivos gerados, além de integrar (ou simular) dados do SAP.
- **frontend-fiori** – aplicação SAP Fiori/UI5 entregue por um projeto CAP que lista transportes, permite criar registros e acompanha a rota planejada e o replay em tempo real.

Para detalhes sobre clonagem seletiva do repositório e outras instruções de configuração, consulte o guia em [`docs/config-repo-sparse-checkout.md`](docs/config-repo-sparse-checkout.md).

Outros guias específicos estão disponíveis na pasta [`docs`](docs/).
