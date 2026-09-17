# Cidade Sem Buracos

Sistema web mobile-first para registrar buracos na via publica com foto e localizacao, com painel interno para a prefeitura operar os chamados.

## O que o projeto faz

- Interface publica em `/` para o cidadao registrar um buraco
- Captura de foto pela camera do celular
- Localizacao por GPS ou endereco manual
- Envio do chamado com geracao de protocolo
- Painel interno com login em `/acesso`
- Painel operacional em `/painel` com:
  - resumo analitico
  - busca por protocolo ou nome
  - filtro por status
  - abertura da foto em tamanho maior
  - alteracao de status
  - exclusao logica

## Stack

- Node.js (o projeto fixa `18.19.1`, veja a nota em [Instalacao](#instalacao))
- Express 5
- SQLite via `better-sqlite3`
- Multer para upload de imagem
- Frontend estatico em HTML, CSS e JavaScript, sem framework

O projeto usa:

- `.nvmrc` para fixar a versao do Node
- `.npmrc` com `engine-strict=true` e `save-exact=true`

## Estrutura

```
server.js           servidor HTTP, rotas da API, sessao do painel e upload
sql/schema.sql      schema do banco (SQLite)
public/             interface publica do cidadao
  index.html
  styles.css
  app.js            wizard de 3 etapas, camera, GPS e envio
painel/             login e painel interno
  acesso.html
  acesso.js
  index.html
  painel.css
  painel.js
uploads/            imagens enviadas (ignoradas pelo git)
data/               arquivo SQLite (ignorado pelo git, criado ao subir)
```

## Requisitos

- Node.js instalado
- Nenhum banco externo: o SQLite e um arquivo local criado automaticamente

## Configuracao

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Conteudo do `.env`:

```env
PORT=4173
DATABASE_PATH=./data/cidade_sem_buracos.sqlite3
PAINEL_USERNAME=prefeitura
PAINEL_PASSWORD=troque-esta-senha
```

Variaveis:

- `PORT`: porta HTTP do servidor
- `DATABASE_PATH`: caminho do arquivo SQLite (criado se nao existir)
- `PAINEL_USERNAME`: usuario unico do painel
- `PAINEL_PASSWORD`: senha do painel

## Instalacao

```bash
npm install
```

Se o seu Node for diferente do `18.19.1` fixado no `package.json`, o `.npmrc`
tem `engine-strict=true` e o install falha com `EBADENGINE`. Duas saidas:

```bash
# opcao 1: ignorar a trava so neste install
npm install --engine-strict=false

# opcao 2: usar a versao fixada no .nvmrc
nvm use
npm install
```

## Banco de dados

Nao ha passo manual de migracao. Ao iniciar, o servidor:

- cria a pasta do `DATABASE_PATH` se ela nao existir
- executa `sql/schema.sql` (com `CREATE TABLE IF NOT EXISTS`)
- garante as colunas operacionais `status_updated_at` e `deleted_at`
- converte status antigos `submitted` para `na_fila`

Tabela principal: `reports`

Campos principais:

- `protocol_code`
- `reporter_name`
- `photo_path`
- `latitude` / `longitude`
- `manual_street`, `manual_number`, `manual_district`, `manual_city`
- `location_source` (`gps` ou `manual`)
- `status`
- `deleted_at`

Status operacionais:

- `na_fila`
- `atendido`
- `descartado`

Para zerar a base, pare o servidor e apague a pasta `data/`.

## Como rodar

Modo desenvolvimento (reinicia ao salvar):

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

Ao subir, o servidor mostra a porta em uso:

```text
Cidade Sem Buracos em http://localhost:4173 (SQLite conectado)
```

## Como usar localmente

Com o servidor rodando:

- app publico: `http://localhost:4173/`
- login do painel: `http://localhost:4173/acesso`
- painel interno: `http://localhost:4173/painel`

As credenciais do painel sao as definidas no `.env`.

## Como acessar no celular na mesma rede

1. Conecte o computador e o celular na mesma rede Wi-Fi.
2. Descubra o IP local da maquina:

```bash
hostname -I
```

3. Abra no celular:

```text
http://SEU_IP_LOCAL:4173/
```

Exemplo:

```text
http://192.168.1.157:4173/
```

## Fluxo do cidadao

1. Abrir a camera e fotografar o buraco
2. Confirmar a localizacao por GPS ou preencher o endereco manual
3. Informar o nome
4. Enviar a solicitacao
5. Receber o protocolo

Observacoes:

- a interface publica trabalha com a camera, sem opcao de galeria
- o envio exige foto e uma origem de localizacao valida
- o formulario e um wizard de 3 etapas; cada etapa so libera a seguinte quando esta valida

## Fluxo do painel

1. Acessar `/acesso` e entrar com usuario e senha do `.env`
2. Abrir `/painel`
3. Buscar ou filtrar chamados
4. Abrir a foto
5. Trocar o status
6. Excluir logicamente um chamado da listagem principal

Detalhes importantes:

- as fotos em `/uploads` ficam protegidas por sessao do painel
- a sessao fica em memoria no processo Node, entao reiniciar o servidor derruba as sessoes ativas
- no celular a tabela de chamados vira lista de cartoes; no desktop continua tabela

## API principal

Rotas publicas:

- `GET /api/health`: status do servidor e do banco
- `POST /api/reports`: cria um chamado com upload de foto (multipart)

Rotas de sessao:

- `POST /api/session/login`
- `POST /api/session/logout`
- `GET /api/session`

Rotas autenticadas do painel:

- `GET /api/painel/reports`
- `GET /api/painel/summary`
- `PATCH /api/painel/reports/:id/status`
- `DELETE /api/painel/reports/:id`

## Geolocalizacao em celulares

Android:

- costuma funcionar em `http://IP_LOCAL:4173` na mesma rede

iPhone / Safari:

- geolocalizacao em `http://IP_LOCAL:4173` nao e confiavel
- para teste real de GPS no iPhone, use HTTPS (Cloudflare Tunnel, ngrok ou deploy)

Resumo pratico:

- para testar o fluxo geral na rede local, HTTP por IP atende
- para validar GPS no iPhone, use um endereco HTTPS

## Testes e validacao

Checagem de sintaxe:

```bash
npm test
```

Hoje esse comando valida `server.js`, `public/app.js`, `painel/acesso.js` e
`painel/painel.js`. Nao ha suite de testes automatizados.

## Problemas comuns

### `npm install` falha com EBADENGINE

Sua versao do Node e diferente da fixada e o `.npmrc` usa `engine-strict=true`.
Veja [Instalacao](#instalacao).

### A porta ja esta em uso

Outro processo esta ocupando a `PORT`. Descubra e finalize:

```bash
pgrep -fa "node server.js"
```

Ou troque a `PORT` no `.env`.

### A foto nao envia

Verifique a permissao de camera no navegador, se a foto foi realmente
capturada e se o arquivo e uma imagem valida (o limite e 8 MB).

### O GPS nao aparece

Verifique a permissao de localizacao no navegador, se o aparelho esta com
localizacao ativa e se voce nao esta em iPhone via HTTP por IP local.

### O painel nao abre

Verifique se `PAINEL_USERNAME` e `PAINEL_PASSWORD` estao definidos no `.env`,
se voce passou primeiro por `/acesso` e se a sessao nao expirou (12 horas).

## Seguranca e limitacoes atuais

- o painel usa um unico usuario e senha definidos no `.env`
- a sessao fica somente em memoria
- nao ha multiplos perfis de usuario
- nao ha historico de acoes por chamado
- nao ha paginacao no painel (limite de 200 registros por consulta)

Para uso fora de teste:

- troque a senha do painel por uma credencial forte
- suba o sistema em HTTPS
- avalie trocar o SQLite por um banco com acesso concorrente se houver mais de um processo servindo a aplicacao
