# Backstage FATEC

O Backstage FATEC é uma vitrine digital para apresentar projetos acadêmicos desenvolvidos pelos estudantes. A aplicação organiza os projetos em cartões com descrição, tecnologias utilizadas, professor responsável e link para o repositório. A busca permite localizar projetos pelo título ou pelo nome do professor.

Os dados exibidos ficam em `src/data/projects.json`. O projeto também conta com um script que analisa as pastas em `mock-projects/`, identifica informações dos manifestos e verifica a presença de README, `.gitignore` e testes. O resultado é gravado no arquivo JSON usado pelo catálogo.

## Tecnologias

- React
- Vite
- Tailwind CSS
- Node.js

## Como executar

É necessário ter Node.js 20.19 ou superior instalado.

```bash
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
```

Para atualizar os dados do catálogo a partir das pastas de exemplo:

```bash
npm run scan
```

## Participantes

- Luciano Souza Peixoto
- Ryan Oliveira Moscardini
- Miguel de Paula Arantes
- Cauê Vinicius
- Felipe de Oliveira Souza
