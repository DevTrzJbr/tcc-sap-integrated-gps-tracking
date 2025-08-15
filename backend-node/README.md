Segue um exemplo de README para a parte do servidor Node com Express:

---

# Servidor Backend - Node.js + Express

Este diretório contém a implementação do **servidor backend** do projeto, desenvolvido em **Node.js** utilizando o framework **Express**.

## Objetivo

O backend é responsável por fornecer APIs que serão consumidas pelo frontend (ex.: SAPUI5/Fiori) e por outros serviços integrados ao SAP.
Ele centraliza as regras de negócio, manipulação de dados e integração com sistemas externos.

---

## Tecnologias Utilizadas

* **Node.js** - Ambiente de execução JavaScript no servidor.
* **Express** - Framework minimalista para criação de APIs REST.
* **Nodemon** (desenvolvimento) - Reinicialização automática durante alterações no código.
* **dotenv** - Gerenciamento de variáveis de ambiente.

---

## Estrutura de Pastas

```
backend/
│
├── src/
│   ├── routes/          # Definição das rotas da API
│   ├── controllers/     # Lógica de processamento das requisições
│   ├── services/        # Serviços auxiliares (ex.: integração com SAP)
│   ├── config/          # Configurações (ex.: conexão com banco, variáveis de ambiente)
│   ├── app.js           # Configuração do servidor Express
│   └── server.js        # Ponto de entrada do servidor
│
├── .env                 # Variáveis de ambiente
├── package.json
└── README.md
```

---

## Instalação

1. Acesse a pasta do backend:

   ```bash
   cd backend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente no arquivo `.env`:

   ```env
   PORT=3000

    # --- SAP ---
    SAP_BASE_URL=https://sap-gateway.seudominio.com
    SAP_ODATA_PATH=/sap/opu/odata/sap/ZMEU_SRV
    SAP_USER=
    SAP_PASS=

    # Enquanto não tiver SAP, mantenha mock ligado
    USE_MOCK=true
   ```

---

## Executando o Servidor

Modo desenvolvimento (com **nodemon**):

```bash
npm run dev
```

Modo produção:

```bash
npm start
```

---

## Endpoints de Teste

Após iniciar o servidor, acesse no navegador ou via **Postman**:

```
GET http://localhost:3000/api/veiculos
```

Resposta esperada:

```json
[
    {
        "id": 1,
        "placa": "ABC-1234",
        "status": "ativo"
    },
    {
        "id": 2,
        "placa": "XYZ-5678",
        "status": "inativo"
    }
]
```

