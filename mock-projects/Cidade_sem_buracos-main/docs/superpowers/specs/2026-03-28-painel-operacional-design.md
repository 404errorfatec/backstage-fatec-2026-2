# Evolucao Operacional do Painel Interno

Status: Aprovado em conversa, aguardando revisao do arquivo
Data: 2026-03-28

## Objetivo

Evoluir o painel interno da prefeitura para suportar operacao basica dos chamados recebidos, incluindo leitura analitica, mudanca de status, visualizacao ampliada da foto e exclusao logica.

## Escopo 80/20

- manter painel protegido por login unico
- adicionar indicadores analiticos no topo
- permitir abrir a foto enviada em tamanho maior
- permitir atualizar o status do protocolo
- permitir exclusao logica de chamados
- ocultar chamados excluidos da listagem padrao

## Status Operacionais

Os chamados passam a usar estes estados:

- `na_fila`
- `atendido`
- `descartado`

## Evolucao de Dados

Na tabela `reports`, o painel passa a depender destes campos:

- `status` com valores restritos aos estados operacionais
- `status_updated_at` para registrar quando o status foi alterado
- `deleted_at` para exclusao logica

## Comportamento do Painel

### Resumo analitico

Cards no topo com:

- total ativo
- total na fila
- total atendido
- total descartado

### Tabela operacional

Cada registro deve apresentar:

- miniatura da foto clicavel
- protocolo
- nome do cidadao
- localizacao
- data de envio
- status atual
- acoes

### Acoes por registro

- abrir foto em visualizacao ampliada
- alterar status com seletor rapido
- excluir chamado com confirmacao

## Exclusao

A exclusao deve ser logica:

- preencher `deleted_at`
- manter o registro no banco
- ocultar o registro da listagem padrao

## API Recomendada

- `GET /api/painel/summary`
- `GET /api/painel/reports`
- `PATCH /api/painel/reports/:id/status`
- `DELETE /api/painel/reports/:id`

Todas as rotas acima devem permanecer protegidas por autenticacao.

## Seguranca Minima

- manter autenticacao apenas no backend
- manter cookie `httpOnly`
- validar status permitidos no servidor
- exigir confirmacao antes da exclusao
- nao expor registros com `deleted_at` preenchido na listagem padrao

## Resultado Esperado

O painel deixa de ser apenas consultivo e passa a permitir triagem basica dos chamados pela prefeitura, sem perder historico essencial e sem introduzir complexidade excessiva.
