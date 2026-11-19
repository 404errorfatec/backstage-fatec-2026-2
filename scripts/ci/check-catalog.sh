#!/usr/bin/env bash
# Regera a análise dos projetos e falha se src/data/project-analysis.json
# mudou, ou seja, se alguém esqueceu de rodar "npm run scan" antes do commit.
set -euo pipefail

npm run scan

if ! git diff --exit-code --stat src/data/project-analysis.json; then
  echo "::error file=src/data/project-analysis.json::Análise desatualizada. Rode 'npm run scan' e faça commit."
  exit 1
fi

echo "Análise atualizada."
