#!/bin/bash

ROLE=$1

# Verifica se o argumento foi passado
if [ -z "$ROLE" ]; then
  echo "Uso: ./bootstrap.sh [python|frontend|backend|sap|docs|all]"
  exit 1
fi

# Inicia o modo sparse-checkout (se ainda não iniciado)
git sparse-checkout init --cone

# Define as pastas que devem ser incluídas conforme o perfil informado
case "$ROLE" in
  python)
    git sparse-checkout set python-scripts
    ;;
  frontend)
    git sparse-checkout set frontend-fiori
    ;;
  backend)
    git sparse-checkout set backend-node
    ;;
  sap)
    git sparse-checkout set sap-artefacts
    ;;
  docs)
    git sparse-checkout set docs
    ;;
  all)
    git sparse-checkout set backend-node frontend-fiori python_scripts sap-artefacts docs
    ;;
  main)
    git sparse-checkout set master
    ;;
  *)
    echo "Perfil inválido: $ROLE"
    echo "Opções válidas: python | frontend | backend | sap | docs | all | main"
    exit 1
    ;;
esac

echo "Ambiente '$ROLE' configurado com sucesso!"
