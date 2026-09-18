# Backstage FATEC

Mini "Backstage" próprio: um script Node que analisa um repositório do GitHub
(ou uma pasta local) e dá uma nota de 0 a 100 com base em boas práticas de
engenharia de software, e um catálogo em React/Vite para visualizar os
resultados — seguindo a estrutura definida no roadmap do projeto.

## Como funciona

1. `scripts/scan.mjs` recebe uma URL do GitHub (ou uma pasta local) e:
   - lista todos os arquivos do repositório;
   - lê `package.json` (ou `requirements.txt`, etc.) para identificar a stack;
   - lê o `.gitignore` para ver se ele cobre `.env`, `*.key`, `*.pem`;
   - procura arquivos sensíveis versionados por engano (`.env`, chaves, etc.);
   - verifica README, LICENSE, testes e pipeline de CI;
   - grava o resultado em `src/data/projects.json`.
2. `src/App.jsx` lê esse JSON e mostra um catálogo com nota, conceito (A–F),
   stack detectada e o checklist de critérios.

## Critérios de pontuação (100 pts no total)

| Critério | Peso |
|---|---|
| README presente | 15 |
| LICENSE presente | 5 |
| `.gitignore` presente | 10 |
| `.gitignore` cobre `.env` / `*.key` / `*.pem` | 10 |
| Nenhum arquivo sensível versionado (`.env`, `*.pem`, `*.key`, `credentials.*`) | 15 |
| Possui testes automatizados | 15 |
| Possui manifesto de dependências (`package.json`, `requirements.txt`, ...) | 10 |
| Possui pipeline de CI (`.github/workflows`) | 10 |
| Atividade recente (push nos últimos 180 dias) | 10 |

Conceito: **A** ≥ 90, **B** ≥ 75, **C** ≥ 60, **D** ≥ 40, **F** abaixo disso.
Os pesos e critérios ficam centralizados em `scripts/lib/scoring.mjs` — é só
ajustar o objeto `WEIGHTS` e as funções auxiliares para mudar a régua.

## Rodando

```bash
npm install

# analisar um repositório real do GitHub
npm run scan https://github.com/owner/repo

# analisar uma pasta local (sem gastar limite de API), ex: os mocks inclusos
npm run scan -- --local mock-projects/app-gestao-estoque
npm run scan -- --local mock-projects/plataforma-efluentes

# ver o catálogo
npm run dev
```

> A API do GitHub sem autenticação libera 60 requisições/hora por IP. Para
> escanear mais repositórios, gere um [personal access token](https://github.com/settings/tokens)
> (sem nenhuma permissão especial, só leitura pública) e rode com
> `GITHUB_TOKEN=seu_token npm run scan https://github.com/owner/repo`.

## Estrutura

```
backstage-fatec/
├── mock-projects/          # pastas de exemplo para testar sem hit na API
│   ├── app-gestao-estoque/     # exemplo "bem cuidado"
│   └── plataforma-efluentes/   # exemplo com .env versionado, sem testes
├── scripts/
│   ├── scan.mjs             # CLI: busca no GitHub ou lê pasta local, pontua, salva
│   └── lib/scoring.mjs      # regras e pesos da pontuação
├── src/
│   ├── data/projects.json   # resultado dos scans (gerado pelo scan.mjs)
│   ├── App.jsx / App.css    # catálogo (cards com nota, stack, checklist)
│   └── main.jsx / index.css
├── package.json
└── vite.config.js
```

## Membros do grupo

- Cauê Vinícius Silva
- Ryan Moscardini
- Miguel de Paula Arantes
- Luciano Peixoto
- Felipe Oliveira
