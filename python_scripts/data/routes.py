"""Definitions of route families and their scenario variants."""

from typing import Dict, List

RouteVariant = Dict[str, object]
RouteFamily = Dict[str, object]

ROUTE_FAMILIES: List[RouteFamily] = [
    {
        "slug": "vila_velha_para_guarapari",
        "prefix": "rota_vv_guarapari",
        "origem": "Avenida Champagnat, 1466, Vila Velha, ES",
        "destino": "Guarapari, Espírito Santo",
        "variants": [
            {
                "suffix": "base",
                "descricao": "Trajeto direto entre Vila Velha e Guarapari.",
                "stops": [],
            },
            {
                "suffix": "via-av-paris",
                "descricao": "Inclui desvio pelo bairro Muquiçaba via Rua Manoel Alvarenga e Av. Paris.",
                "stops": [
                    "R. Manoel Alvarenga, 1995 - Guarapari, ES",
                    "Av. Paris, Guarapari, ES",
                ],
                "avoid": "vv_zona_portuaria",
            },
            {
                "suffix": "com-paradas-praias",
                "descricao": "Adiciona paradas no Terminal de Itaparica e na Praia do Morro.",
                "stops": [
                    "Terminal de Itaparica, Vila Velha, ES",
                    "Praia do Morro, Guarapari, ES",
                ],
                "avoid": "vv_zona_portuaria",
            },
            {
                "suffix": "via-rodoviaria",
                "descricao": "Passa pela rodoviária de Guarapari antes de seguir ao centro turístico.",
                "stops": [
                    "Rodoviária de Guarapari - Avenida Jones dos Santos Neves, Guarapari, ES",
                    "Praça Muquiçaba, Guarapari, ES",
                ],
                "avoid": "vv_centro_historico",
            },
        ],
    },
    {
        "slug": "vitoria_para_serra",
        "prefix": "rota_vitoria_serra",
        "origem": "Praça do Papa, Vitória, ES",
        "destino": "Terminal de Laranjeiras, Serra, ES",
        "variants": [
            {
                "suffix": "base",
                "descricao": "Trajeto direto do centro de Vitória ao Terminal de Laranjeiras.",
                "stops": [],
            },
            {
                "suffix": "via-shoppings",
                "descricao": "Desvio pelos shoppings Vitória e Mestre Álvaro.",
                "stops": [
                    "Shopping Vitória, Vitória, ES",
                    "Shopping Mestre Álvaro, Serra, ES",
                ],
                "avoid": "vit_serra_porto",
            },
            {
                "suffix": "com-parques",
                "descricao": "Inclui paradas no Parque Pedra da Cebola e no Parque da Cidade.",
                "stops": [
                    "Parque Pedra da Cebola, Vitória, ES",
                    "Parque da Cidade, Serra, ES",
                ],
                "avoid": "vit_serra_industrial",
            },
            {
                "suffix": "via-camburi",
                "descricao": "Passa pela Praia de Camburi e pelo Hospital Metropolitano.",
                "stops": [
                    "Praia de Camburi, Vitória, ES",
                    "Hospital Metropolitano, Serra, ES",
                ],
                "avoid": "vit_serra_industrial",
            },
        ],
    },
    {
        "slug": "cariacica_para_aeroporto_vitoria",
        "prefix": "rota_cgr_aero_vix",
        "origem": "Terminal Campo Grande, Cariacica, ES",
        "destino": "Aeroporto de Vitória - Eurico de Aguiar Salles, Vitória, ES",
        "variants": [
            {
                "suffix": "base",
                "descricao": "Trajeto direto do Terminal Campo Grande ao aeroporto de Vitória.",
                "stops": [],
            },
            {
                "suffix": "via-rodoviaria",
                "descricao": "Desvio pela Rodoviária de Vitória para embarque urbano.",
                "stops": [
                    "Rodoviária de Vitória, Vitória, ES",
                ],
                "avoid": "cgr_aero_ilha",
            },
            {
                "suffix": "via-ufes-hospital",
                "descricao": "Inclui paradas na UFES e no Hospital Infantil Nossa Senhora da Glória.",
                "stops": [
                    "Universidade Federal do Espírito Santo, Vitória, ES",
                    "Hospital Estadual Infantil Nossa Senhora da Glória, Vitória, ES",
                ],
                "avoid": "cgr_aero_ilha",
            },
            {
                "suffix": "via-praca-namorados",
                "descricao": "Passa pela Praça dos Namorados e pelo Shopping Vitória para passageiros.",
                "stops": [
                    "Praça dos Namorados, Vitória, ES",
                    "Shopping Vitória, Vitória, ES",
                ],
                "avoid": "cgr_aero_ilha",
            },
            {
                "suffix": "via-shopping-moxuara",
                "descricao": "Breve parada no Shopping Moxuara antes de seguir pelo eixo Vitória.",
                "stops": [
                    "Shopping Moxuara, Cariacica, ES",
                    "Shopping Vitória, Vitória, ES",
                ],
                "avoid": "cgr_aero_ilha",
            },
            {
                "suffix": "via-parques-centro",
                "descricao": "Desvio leve pelo Parque Moscoso e Praça dos Desejos para embarque urbano.",
                "stops": [
                    "Parque Moscoso, Vitória, ES",
                    "Praça dos Desejos, Vitória, ES",
                ],
                "avoid": "cgr_aero_ilha",
            },
            {
                "suffix": "via-estacao-pedro-nolasco",
                "descricao": "Inclui embarque na Estação Pedro Nolasco antes de alcançar Vitória.",
                "stops": [
                    "Estação Pedro Nolasco, Vitória, ES",
                ],
                "avoid": "cgr_aero_ilha",
            },
            {
                "suffix": "via-hospital-policial",
                "descricao": "Atende passageiros na região hospitalar da Reta da Penha.",
                "stops": [
                    "Hospital da Polícia Militar do Espírito Santo, Vitória, ES",
                    "Hospital Estadual Infantil Nossa Senhora da Glória, Vitória, ES",
                ],
                "avoid": "cgr_aero_ilha",
            },
            {
                "suffix": "via-terminal-carapina",
                "descricao": "Extensão rápida até o Terminal de Carapina para integração metropolitana.",
                "stops": [
                    "Terminal de Carapina, Serra, ES",
                ],
                "avoid": "cgr_aero_ilha",
            },
        ],
    },
    {
        "slug": "garoto_para_shopping_vitoria",
        "prefix": "rota_garoto_shopping",
        "origem": "Praça Meyerfreund, Glória, Vila Velha - ES",
        "destino": "Av. Américo Buaiz, 200 - Enseada do Suá, Vitória - ES, 29050-902",
        "variants": [
            {
                "suffix": "manha-sem-trafego",
                "descricao": "Trânsito leve na Terceira Ponte, sem atraso adicional.",
                "stops": [],
                "delay_minutes": 0
            },
            {
                "suffix": "manha-com-parada",
                "descricao": "Parada Shopping Praia da Costa (+10 min) e +5 minutos adicionais na Terceira Ponte (total +15).",
                "stops": [
                    "R. Inácio Higino, Praia da Costa, Vila Velha - ES, 29101-315"
                ],
                "delay_minutes": 5
            },
            {
                "suffix": "manha-com-sete-min",
                "descricao": "Fluxo moderado gera +7 minutos de atraso na Terceira Ponte.",
                "stops": [],
                "delay_minutes": 7
            },
            {
                "suffix": "tarde-com-nove-min",
                "descricao": "Horário de pico da tarde adiciona +9 minutos na ponte.",
                "stops": [],
                "delay_minutes": 9
            },
            {
                "suffix": "tarde-com-doze-min",
                "descricao": "Trânsito intenso resulta em +12 minutos de atraso.",
                "stops": [],
                "delay_minutes": 12
            },
            {
                "suffix": "noite-com-cinco-min",
                "descricao": "Fluxo noturno com atraso adicional de +5 minutos.",
                "stops": [],
                "delay_minutes": 5
            },
            {
                "suffix": "noite-com-onze-min",
                "descricao": "Ocorrência noturna causa +11 minutos na Terceira Ponte.",
                "stops": [],
                "delay_minutes": 11
            }
        ],
    },

]
