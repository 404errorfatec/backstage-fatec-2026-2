# Painel Interno da Prefeitura

Status: Aprovado em conversa, aguardando revisao do arquivo
Data: 2026-03-28

## Objetivo

Criar um painel web interno para a prefeitura visualizar os registros enviados pela populacao sem expor elementos administrativos na experiencia publica.

## Escopo 80/20

- manter app publico em `/`
- criar login interno em `/acesso`
- criar painel interno em `/painel`
- usar o mesmo backend Express
- usar o mesmo banco PostgreSQL
- usar as mesmas fotos salvas em `uploads`
- adotar login unico no inicio

## Fora de Escopo

- multiplos usuarios
- niveis de permissao
- alteracao de status pelo painel
- analytics
- exportacao
- acompanhamento publico por protocolo

## Arquitetura Recomendada

Uma unica aplicacao Node.js/Express serve duas experiencias:

- interface publica para o cidadao
- interface interna para a prefeitura

As duas compartilham:

- tabela `reports`
- diretiorio `uploads`
- servidor HTTP

## Rotas

- `GET /` interface publica
- `GET /acesso` tela de login interno
- `POST /api/session/login` autenticacao do painel
- `POST /api/session/logout` encerramento da sessao
- `GET /painel` interface interna protegida
- `GET /api/painel/reports` listagem protegida de registros

Observacao: nao usar `admin` ou `adm` em rotas, textos ou navegacao publica.

## Dados Exibidos no Painel

Cada registro deve apresentar:

- foto
- protocolo
- nome do cidadao
- localizacao GPS ou endereco manual
- data de envio
- status atual

## Experiencia do Painel

Formato inicial recomendado:

- painel web com tabela enxuta
- ordenacao por envio mais recente primeiro
- busca por protocolo ou nome
- filtro por status

Essa abordagem prioriza produtividade em desktop e baixo custo de implementacao.

## Seguranca Minima Inicial

- credenciais do painel em variaveis de ambiente
- autenticacao feita apenas no backend
- cookie de sessao com `httpOnly`
- protecao obrigatoria em `/painel` e `/api/painel/*`
- retorno `401` para acessos sem sessao valida
- nenhuma referencia visual ao painel na interface publica

## Estrutura Tecnica Sugerida

- `public/` continua exclusivo da experiencia publica
- nova pasta para a experiencia interna, servida por rota dedicada
- middleware de autenticacao para proteger rotas internas
- consulta SQL especifica para listagem de registros

## Resultado Esperado

A prefeitura acessa uma pagina protegida por login e visualiza rapidamente tudo o que foi enviado pela populacao, incluindo fotos e dados do banco, sem criar uma segunda aplicacao e sem expor a area interna na experiencia publica.
