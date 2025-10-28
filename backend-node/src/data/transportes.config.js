// src/data/transportes.config.js
// Catálogo estático de transportes e suas rotas associadas.
// Ajuste esta lista conforme novos cenários e arquivos forem gerados pelos scripts Python.

const TRANSPORTES = [
  {
    id: 'campo-grande-aeroporto-vitoria',
    codigo: 'CG-VIX',
    nome: 'Campo Grande → Aeroporto de Vitória',
    descricao: 'Linha metropolitana ligando o Terminal Campo Grande (Cariacica) ao Aeroporto de Vitória.',
    origem: 'Terminal Campo Grande, Cariacica, ES',
    destino: 'Aeroporto de Vitória - Eurico de Aguiar Salles, Vitória, ES',
    rotas: [
      {
        id: 'rota_cgr_aero_vix_base',
        titulo: 'Base',
        descricao: 'Trajeto direto do Terminal Campo Grande ao aeroporto de Vitória.',
      },
      {
        id: 'rota_cgr_aero_vix_via-rodoviaria',
        titulo: 'Via Rodoviária',
        descricao: 'Inclui desvio rápido pela Rodoviária de Vitória.',
      },
      {
        id: 'rota_cgr_aero_vix_via-praca-namorados',
        titulo: 'Via Praça dos Namorados',
        descricao: 'Passa pela Praça dos Namorados e Shopping Vitória para embarques urbanos.',
      },
      {
        id: 'rota_cgr_aero_vix_via-parques-centro',
        titulo: 'Via Parques Centro',
        descricao: 'Desvio leve pelo Parque Moscoso e Praça dos Desejos no centro de Vitória.',
      },
      {
        id: 'rota_cgr_aero_vix_via-estacao-pedro-nolasco',
        titulo: 'Via Estação Pedro Nolasco',
        descricao: 'Embarque adicional na Estação Pedro Nolasco antes de seguir ao aeroporto.',
      },
      {
        id: 'rota_cgr_aero_vix_via-shopping-moxuara',
        titulo: 'Via Shopping Moxuara',
        descricao: 'Parada no Shopping Moxuara e integração com o eixo Vitória.',
      },
      {
        id: 'rota_cgr_aero_vix_via-terminal-carapina',
        titulo: 'Via Terminal Carapina',
        descricao: 'Extensão até o Terminal de Carapina para integração metropolitana.',
      },
    ],
  },
  {
    id: 'vitoria-para-serra',
    codigo: 'VIX-SERRA',
    nome: 'Vitória → Serra',
    descricao: 'Linha troncal ligando o centro de Vitória ao Terminal de Laranjeiras na Serra.',
    origem: 'Praça do Papa, Vitória, ES',
    destino: 'Terminal de Laranjeiras, Serra, ES',
    rotas: [
      {
        id: 'rota_vitoria_serra_base',
        titulo: 'Base',
        descricao: 'Trajeto direto do centro de Vitória ao Terminal de Laranjeiras.',
      },
      {
        id: 'rota_vitoria_serra_com-parques',
        titulo: 'Com Parques',
        descricao: 'Inclui paradas no Parque Pedra da Cebola e Parque da Cidade.',
      },
      {
        id: 'rota_vitoria_serra_via-camburi',
        titulo: 'Via Camburi',
        descricao: 'Passa pela Praia de Camburi e pelo Hospital Metropolitano.',
      },
    ],
  },
  {
    id: 'vila-velha-para-guarapari',
    codigo: 'VV-GUA',
    nome: 'Vila Velha → Guarapari',
    descricao: 'Linha de longa distância conectando Vila Velha a Guarapari.',
    origem: 'Avenida Champagnat, 1466, Vila Velha, ES',
    destino: 'Guarapari, Espírito Santo',
    rotas: [
      {
        id: 'rota_vv_guarapari_base',
        titulo: 'Base',
        descricao: 'Trajeto direto entre Vila Velha e Guarapari.',
      },
      {
        id: 'rota_vv_guarapari_via-av-paris',
        titulo: 'Via Av. Paris',
        descricao: 'Desvio pelo bairro Muquiçaba via Rua Manoel Alvarenga e Av. Paris.',
      },
      {
        id: 'rota_vv_guarapari_com-paradas-praias',
        titulo: 'Com Paradas nas Praias',
        descricao: 'Adiciona paradas no Terminal de Itaparica e na Praia do Morro.',
      },
    ],
  },
  {
    id: 'garoto-para-shopping-vitoria',
    codigo: 'GAR-SHOP',
    nome: 'Fábrica Garoto → Shopping Vitória',
    descricao: 'Trajeto pela Terceira Ponte com diferentes condições de tráfego.',
    origem: 'Fábrica Garoto, Vila Velha, ES',
    destino: 'Shopping Vitória, Vitória, ES',
    rotas: [
      {
        id: 'rota_garoto_shopping_manha-sem-trafego',
        titulo: 'Manhã sem Tráfego',
        descricao: 'Rota matinal com fluxo leve na Terceira Ponte.',
      },
      {
        id: 'rota_garoto_shopping_manha-com-parada',
        titulo: 'Manhã com Parada',
        descricao: 'Inclui parada no Shopping Praia da Costa e atraso leve na ponte.',
      },
      {
        id: 'rota_garoto_shopping_manha-com-sete-min',
        titulo: 'Manhã +7 min',
        descricao: 'Trânsito moderado resultando em atraso de 7 minutos.',
      },
      {
        id: 'rota_garoto_shopping_tarde-com-nove-min',
        titulo: 'Tarde +9 min',
        descricao: 'Horário de pico vespertino com atraso de 9 minutos.',
      },
      {
        id: 'rota_garoto_shopping_tarde-com-doze-min',
        titulo: 'Tarde +12 min',
        descricao: 'Trânsito intenso na ponte com atraso de 12 minutos.',
      },
      {
        id: 'rota_garoto_shopping_noite-com-cinco-min',
        titulo: 'Noite +5 min',
        descricao: 'Fluxo noturno com atraso leve de 5 minutos.',
      },
      {
        id: 'rota_garoto_shopping_noite-com-onze-min',
        titulo: 'Noite +11 min',
        descricao: 'Incidente na ponte gera atraso de 11 minutos.',
      },
    ],
  },
  {
    id: 'cenarios-demonstracao',
    codigo: 'DEMO',
    nome: 'Cenários Demonstrativos',
    descricao: 'Rotas auxiliares utilizadas nas apresentações e testes.',
    origem: 'Diversos pontos',
    destino: 'Diversos pontos',
    rotas: [
      {
        id: 'rota_normal',
        titulo: 'Rota Normal',
        descricao: 'Cenário base para validações rápidas.',
      },
      {
        id: 'rota_com_paradas',
        titulo: 'Rota com Paradas',
        descricao: 'Inclui flags de parada para testar métricas de parada.',
      },
      {
        id: 'rota_com_desvio_1',
        titulo: 'Rota com Desvio',
        descricao: 'Exemplo de rota com desvio estrutural no meio do trajeto.',
      },
    ],
  },
];

module.exports = { TRANSPORTES };
