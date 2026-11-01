#!/usr/bin/env bash

# Faz o script parar caso aconteça algum erro
set -euo pipefail

# Atualiza o arquivo projects.json com base nos projetos cadastrados.
npm run scan

# Verifica se o arquivo projects.json foi alterado após a atualização,
# Se encontrar diferenças, significa que o catálogo estava desatualizado.
if ! git diff --exit-code --stat src/data/projects.json; then

  # Mostra uma mensagem avisando que o catálogo precisa ser atualizado.
  echo "::error file=src/data/projects.json::Catálogo desatualizado. Rode 'npm run scan' e faça commit."

  # Encerra o script indicando que houve um erro.
  exit 1
fi

# Se não houver diferenças, significa que o catálogo está atualizado.
echo "Catálogo atualizado."