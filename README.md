# Clonagem Seletiva com Git Sparse Checkout

Este repositório utiliza o recurso de **sparse-checkout** do Git para permitir que você baixe apenas partes específicas do projeto — ideal para monorepos com múltiplos ambientes ou componentes.

## ✅ Pré-requisitos

- Git 2.25 ou superior
- Bash (Linux/macOS) ou Git Bash (Windows)

---

## 🔄 Clonando apenas parte do repositório (modo cone)

### Clonar apenas os arquivos da raiz do repositório:

```bash
mkdir projeto && cd projeto
git init
git remote add origin https://github.com/DevTrzJbr/tcc-sap-integrated-gps-tracking.git
git sparse-checkout init --cone
git sparse-checkout set .
git pull master master
```

## Usando o bootstrap.sh

Use o comando
```
bootstrap.sh [ python | frontend | backend | sap | docs | all | main ]
```
com alguma das opções para clonar apenas a stack de trabalho.

Exemplo

```bash
bootstrap.sh python
```
Para clonar apenas as partes do repositorio de python configurada no `bootstrap.sh`.

## Estrutura esperada da pasta

Ao executar o bootstrap com a opção `python`, sua pasta deve se parecer com a seguinte estrutura:
```bash
tcc-sap-integrated-gps-tracking/
│
├── README.md            # Descrição geral do projeto
├── bootstrap.sh         # Script parse-clone
|
└── python-scripts/      # Pasta python-scripts
    │                    
    ├── archive/
    │   ├── script01
    │   ├── script02
    │   └── script03
    |
    ├── README.md
    └── main.py
```

## Observações

- O `bootstrap.sh` também aceita a opção `all` para clonar todo o repositório.
- A opção `main` pode ser usada para uma configuração mínima com apenas os arquivos principais da raiz.

## Referências

[Documentação oficial do Git - sparse-checkout](https://git-scm.com/docs/git-sparse-checkout)
[Aritigo - Bring your monorepo down to size with sparse-checkout](https://github.blog/open-source/git/bring-your-monorepo-down-to-size-with-sparse-checkout/)