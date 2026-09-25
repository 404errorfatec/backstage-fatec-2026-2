# Design: Redesign da Interface Publica do Cidade Sem Buracos

Data: 2026-03-28
Status: Aprovado em conversa, aguardando revisao do arquivo

## Objetivo

Redesenhar a interface publica do Cidade Sem Buracos para priorizar usabilidade mobile, com foco especial em duas etapas:

- capturar ou escolher a foto com o minimo de atrito
- confirmar a localizacao com GPS primeiro, mas sem bloquear o fluxo quando houver falha

O redesign deve manter o backend e o contrato atual do envio, concentrando as mudancas em HTML, CSS e JavaScript da interface do cidadao.

## Escopo

Este corte inclui:

- reorganizacao do formulario atual em fluxo guiado de 3 etapas na mesma pagina
- destaque visual e funcional para foto e localizacao
- fallback hibrido para localizacao manual na mesma tela da etapa de GPS
- revisao do visual para uma direcao mais bonita, amigavel e mobile-first
- nova hierarquia de feedback, validacao por etapa e estado de sucesso

Este corte nao inclui:

- painel administrativo
- consulta publica por protocolo
- mudancas no schema do banco
- novos endpoints alem dos ja existentes
- autenticacao, notificacoes ou historico de solicitacoes

## Contexto Atual

Hoje o projeto ja possui:

- upload de foto
- tentativa de geolocalizacao no frontend
- fallback manual de endereco
- campo de nome
- envio para `POST /api/reports`
- resposta com protocolo e status inicial

O problema nao esta no backend inicial. O principal gargalo neste momento e a experiencia do formulario, que ainda se comporta como uma pagina de blocos em vez de um fluxo guiado para celular.

## Direcao Recomendada

Adotar um fluxo guiado em 3 etapas dentro da mesma pagina:

1. `Foto`
2. `Localizacao`
3. `Identificacao e envio`

Somente uma etapa fica em destaque por vez, mas todas pertencem ao mesmo formulario e ao mesmo submit final.

### Justificativa

- reduz carga cognitiva no mobile
- melhora foco do usuario na acao mais importante de cada momento
- permite um visual mais forte sem parecer um formulario longo
- preserva o contrato atual de envio, evitando expandir o escopo tecnico

## Arquitetura da Interface

### Estrutura geral

A pagina continua sendo uma unica rota publica, mas a interface passa a ter:

- cabecalho curto com identidade visual
- indicador de progresso com 3 etapas
- area principal de conteudo com uma etapa ativa por vez
- rodape fixo com CTA contextual
- estado de sucesso substituindo o formulario apos envio concluido

### Etapas

#### Etapa 1: Foto

Objetivo:
Levar o usuario a capturar ou selecionar a imagem o mais cedo possivel.

Componentes:

- titulo curto orientado a acao
- preview grande da imagem
- botao primario para abrir camera
- botao secundario para escolher da galeria
- dica curta sobre qualidade da foto

Comportamento:

- se houver suporte a camera, o CTA principal deve priorizar `capture="environment"`
- se o usuario selecionar imagem da galeria, o fluxo continua normalmente
- apos carregar uma imagem valida, a interface habilita o CTA `Continuar` da etapa 1
- a foto nao deve avancar automaticamente de etapa; o usuario precisa tocar em `Continuar`
- ao tocar em `Continuar`, a interface muda para a etapa 2 e atualiza o indicador de progresso

#### Etapa 2: Localizacao

Objetivo:
Resolver a localizacao sem travar o usuario na dependencia exclusiva do GPS.

Componentes:

- estado visivel da busca por GPS
- resumo curto da localizacao quando detectada
- campos manuais curtos sempre visiveis na mesma tela
- acao para confirmar uso da localizacao detectada, quando disponivel

Comportamento:

- ao entrar na etapa, o frontend tenta geolocalizacao automaticamente
- enquanto o GPS busca, os campos manuais ja ficam disponiveis
- se o GPS funcionar, o usuario pode aceitar a localizacao detectada
- se o GPS falhar, a etapa continua utilizavel sem abrir secao escondida
- o envio final aceita tanto GPS quanto endereco manual, sem alterar a API existente

### Modelo de interacao da etapa 2

A etapa 2 deve ter um unico modelo de interacao, sem variacoes:

- bloco superior com estado do GPS: `buscando`, `detectado` ou `indisponivel`
- bloco manual logo abaixo, sempre visivel
- indicador textual de origem ativa: `Usando local detectado` ou `Usando endereco manual`
- CTA principal da etapa com rotulo fixo: `Continuar`

Regras de transicao:

- ao entrar na etapa, nenhuma origem fica ativa ate existir uma origem valida confirmada
- quando o GPS for detectado, aparece a acao secundaria `Usar local detectado`
- ao tocar em `Usar local detectado`, a origem ativa vira `gps`
- ao editar qualquer campo manual, a origem ativa nao muda sozinha
- ao preencher os quatro campos manuais validos, aparece a acao secundaria `Usar endereco manual`
- ao tocar em `Usar endereco manual`, a origem ativa vira `manual`
- o CTA `Continuar` so pode ser usado quando existir uma origem ativa valida
- se o usuario trocar de ideia, ele pode tocar na outra acao secundaria disponivel para mudar a origem ativa
- a origem ativa deve ficar visivel na interface ate o fim da etapa

#### Etapa 3: Identificacao e envio

Objetivo:
Finalizar o registro com o minimo de friccao.

Componentes:

- campo de nome
- resumo do que sera enviado
- CTA final de envio
- feedback contextual de validacao

Comportamento:

- a etapa exibe o nome como unico campo principal
- a foto e a localizacao aparecem resumidas para revisao rapida
- a validacao deve bloquear o envio apenas por campos realmente obrigatorios

## Direcao Visual

### Tema

A interface deve assumir uma direcao visual mais calorosa e amigavel, usando verde abacate como base.

Paleta conceitual:

- verde abacate escuro para contraste e titulos
- verde abacate medio para destaques e componentes ativos
- verdes claros e fundos creme para atmosfera leve
- neutros quentes para superficies e textos secundarios

### Linguagem visual

- cards arredondados e mais organicos
- fundo claro com profundidade suave, sem aspecto generico
- botoes grandes, expressivos e faceis de tocar
- emojis usados como apoio visual pontual
- tipografia clara e legivel, sem excesso decorativo

### Uso de emojis

Emojis sao permitidos como apoio em:

- titulo de etapa
- estados de sucesso
- dicas curtas

Emojis nao devem:

- substituir labels de formulario
- ser o unico indicador de estado
- comprometer legibilidade ou acessibilidade

## Componentes e Estados

### Indicador de progresso

Deve mostrar as 3 etapas em formato simples e legivel.

Requisitos:

- destacar etapa atual
- sinalizar etapas concluidas
- funcionar bem em largura mobile

### CTA principal

O botao principal deve mudar conforme a etapa:

- etapa 1: `Continuar`, depois que a foto for carregada
- etapa 2: `Continuar`, depois que uma origem valida estiver ativa
- etapa 3: enviar solicitacao

Observacao:

- na etapa 1, os botoes de camera e galeria sao acoes de captura, nao o CTA principal de progressao
- na etapa 2, as acoes `Usar local detectado` e `Usar endereco manual` definem a origem; o CTA principal apenas avanca para a etapa seguinte

### Feedback

O sistema deve ter:

- mensagens curtas por etapa
- loading visivel no envio
- feedback de erro proximo da acao afetada
- confirmacao final mais objetiva

### Estado de sucesso

Apos o envio:

- substituir o formulario por card de sucesso
- mostrar protocolo retornado pelo backend
- resumir o que foi registrado
- oferecer CTA para registrar outro buraco

## Fluxo de Dados

O frontend continua enviando o mesmo conjunto de campos ao backend:

- `reporterName`
- `photo`
- `latitude`
- `longitude`
- `manualStreet`
- `manualNumber`
- `manualDistrict`
- `manualCity`
- `locationSource`

### Regras de mapeamento

- se o usuario confirmar GPS, `locationSource` deve ser `gps`
- se o usuario depender de endereco manual, `locationSource` deve ser `manual`
- os campos manuais podem coexistir visivelmente na interface, mas o envio deve respeitar a origem efetiva escolhida

### Regra de precedencia da origem

A interface deve exigir uma escolha explicita da origem efetiva quando houver GPS valido.

Comportamento esperado:

- se houver GPS valido e o usuario tocar em usar local detectado, a origem efetiva passa a ser `gps`
- se o usuario editar e concluir o endereco manual, a origem efetiva passa a ser `manual`
- se ambos existirem visualmente, vence a ultima origem explicitamente confirmada pelo usuario
- se nenhum dos dois estiver valido, a etapa nao pode ser concluida

### Matriz de envio da localizacao

Caso 1: GPS valido e confirmado

- `locationSource = gps`
- enviar `latitude` e `longitude`
- campos manuais podem permanecer preenchidos na interface, mas nao devem ser considerados como origem efetiva do envio

Caso 2: endereco manual valido e escolhido

- `locationSource = manual`
- enviar `manualStreet`, `manualNumber`, `manualDistrict` e `manualCity`
- `latitude` e `longitude` devem permanecer nulos se o usuario nao confirmou GPS como origem efetiva

Caso 3: GPS disponivel e endereco manual tambem preenchido

- a interface deve deixar claro qual origem esta ativa
- o payload final deve seguir exclusivamente a ultima origem confirmada pelo usuario

Caso 4: nenhum valido

- impedir avancar ou enviar
- mostrar mensagem curta orientando a detectar a localizacao ou preencher o endereco

## Validacao e Tratamento de Erros

### Validacao por etapa

Etapa 1:

- impedir avancar sem foto

Etapa 2:

- permitir seguir se houver GPS valido ou endereco manual completo

Etapa 3:

- impedir envio sem nome

### Regra de endereco manual completo

Para o endereco manual ser considerado valido:

- `manualStreet` deve existir apos `trim()`
- `manualNumber` deve existir apos `trim()`
- `manualDistrict` deve existir apos `trim()`
- `manualCity` deve existir apos `trim()`

Regras adicionais:

- valores com apenas espacos contam como vazios
- `manualNumber` permanece como texto livre curto, para aceitar formatos reais como `123`, `123A`, `S/N` ou `Casa 2`
- a validacao deste corte verifica presenca e nao faz normalizacao avancada de endereco

### Erros esperados

- imagem ausente
- permissao de GPS negada
- geolocalizacao indisponivel
- endereco manual incompleto
- erro de rede ou falha no backend

### Regras de UX para erro

- nao despejar todos os erros de uma vez no topo
- mostrar texto curto e acionavel
- manter os dados ja preenchidos
- nunca esconder a alternativa manual quando GPS falhar

## Acessibilidade

O redesign precisa preservar clareza e uso real em celular.

Requisitos minimos:

- contraste suficiente entre texto e fundo
- labels visiveis nos campos
- estados de foco perceptiveis
- mensagens de feedback legiveis
- suporte a navegacao por teclado no desktop
- `aria-live` para feedback de envio e sucesso

## Implementacao Esperada

Arquivos afetados, em principio:

- `public/index.html`
- `public/styles.css`
- `public/app.js`

O servidor e o schema nao devem precisar de mudancas neste corte, salvo ajuste pequeno de integracao descoberto durante a implementacao.

## Testes

### Teste manual essencial

1. abrir o app no celular
2. tirar foto pela camera
3. selecionar foto da galeria
4. permitir GPS e confirmar localizacao
5. negar GPS e concluir com endereco manual
6. tentar avancar sem foto
7. tentar enviar sem nome
8. simular falha de envio e verificar manutencao dos dados
9. concluir envio com sucesso e validar protocolo na tela final

### Criterios de aceite

- o usuario entende imediatamente que deve comecar pela foto
- a captura de imagem exige menos decisao do que no layout atual
- a localizacao nao bloqueia o fluxo quando o GPS falha
- o formulario parece mais leve e bonito em celular
- o envio continua funcionando com o backend atual

## Riscos e Limites

- se o fluxo em etapas ficar excessivamente animado, pode parecer mais lento do que a tela atual
- se os estados de localizacao nao ficarem claros, o usuario pode ficar em duvida sobre qual origem sera enviada
- o uso de emojis deve ser moderado para nao infantilizar o servico

## Resultado Esperado

Ao final deste incremento, o Cidade Sem Buracos deve parecer mais proximo de um app mobile de utilidade publica:

- mais rapido para comecar
- mais claro para concluir
- mais resiliente quando GPS falhar
- mais bonito e memoravel sem perder credibilidade
