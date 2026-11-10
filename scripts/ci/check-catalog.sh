#!/usr/bin/env bash

# Interrompe a execução caso ocorra algum erro.
set -euo pipefail

# Executa o scan para atualizar o catálogo.
npm run scan

# Verifica se o catálogo está atualizado.
if ! git diff --exit-code --stat src/data/project-analysis.json; then
  echo "::error file=src/data/project-analysis.json::Catálogo desatualizado. Rode 'npm run scan' e faça commit."
  exit 1
fi

echo "Catálogo atualizado."