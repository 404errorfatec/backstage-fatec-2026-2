# Design: Interface Publica Cidade Gentil

Data: 2026-03-30
Status: Aprovado em conversa, aguardando revisao do arquivo

## Objetivo

Elevar a interface publica do `Cidade Sem Buracos` para um padrao visual e de UX mais bonito, fofo e impecavel, sem alterar o fluxo funcional principal ja existente.

O redesign deve priorizar:

- sensacao imediata de rapidez
- aparencia acolhedora e humana
- acabamento premium sem perder simplicidade
- manutencao do fluxo atual de 3 etapas

## Decisoes Validadas

Durante o brainstorming, ficou aprovado que a interface deve seguir:

- direcao visual: `fofo civico`
- enfase principal: `rapidez`
- equilibrio visual: base `clean`, sem abrir mao de personalidade
- abordagem recomendada: `Clean com Charme Civico`
- linguagem visual final: `Cidade Gentil`

## Escopo

Este corte inclui:

- refinamento visual completo da interface publica em `public/index.html`, `public/styles.css` e ajustes pontuais em `public/app.js`
- revisao de hierarquia visual, espacos, tipografia, CTAs e cards
- melhoria da experiencia percebida nas 3 etapas do wizard
- nova atmosfera visual de fundo e hero
- melhoria de microcopy, feedbacks e microinteracoes
- reforco visual do estado de sucesso

Este corte nao inclui:

- mudancas de backend
- mudancas de API
- mudancas no schema do banco
- alteracoes no painel administrativo
- novas funcionalidades fora do fluxo atual de envio

## Contexto Atual

A interface publica atual ja resolveu os principais problemas estruturais do fluxo:

- formulario em 3 etapas
- foto primeiro
- localizacao por GPS com fallback manual
- resumo final e envio

O ganho buscado agora nao e arquitetural. O foco e elevar a percepcao de qualidade, reduzir friccao visual e fazer o formulario parecer ainda mais rapido, simpatico e confiavel.

## Direcao Recomendada

Adotar uma linguagem `Cidade Gentil`: uma interface clara, premium e muito facil de usar, com pequenos elementos afetivos e civicos que reforcam acolhimento sem infantilizar o produto.

### Principios da direcao

- o usuario deve sentir que consegue registrar um buraco em segundos
- a interface deve parecer leve, organizada e bem cuidada
- a personalidade visual deve aparecer em detalhes controlados, nao em excesso decorativo
- o fluxo precisa continuar obvio no mobile

## Hierarquia Da Tela

### 1. Hero curto e encantador

O topo da pagina deve ser mais curto do que o atual e mais orientado a conversao.

Componentes:

- promessa objetiva de rapidez
- subtitulo curto e humano
- selo curto de confianca institucional
- ilustracao urbana suave com clima de cidade cuidada

Objetivo:

- contextualizar rapidamente
- gerar simpatia
- empurrar o usuario para a acao principal sem ocupar espaco demais

### 2. Card principal dominante

O wizard deve assumir o protagonismo visual da pagina. A etapa ativa precisa ter peso visual superior aos outros elementos, com mais contraste, profundidade e respiracao.

Objetivo:

- concentrar foco
- reduzir percepcao de formulario longo
- criar sensacao de fluxo guiado e rapido

### 3. Progresso compacto e premium

O indicador de progresso continua com 3 etapas, mas passa a ter acabamento mais refinado:

- leitura instantanea
- estados concluido, atual e pendente mais claros
- menos aparencia de tres blocos equivalentes

### 4. Fundo com atmosfera

O fundo deve continuar claro, mas com mais identidade:

- gradientes suaves
- formas organicas discretas
- pequenas camadas visuais inspiradas em luz, cidade e natureza urbana

Objetivo:

- sair do visual apenas agradavel
- criar uma atmosfera memoravel sem poluicao

## Sistema Visual

### Paleta

Base conceitual:

- creme claro e tons quase marfim para o fundo
- verdes acolhedores e civicos para identidade principal
- verde mais profundo para contraste e titulos
- acentos quentes suaves, como dourado-palha ou amarelo-sol, para pontos de carinho visual

Regras:

- a paleta deve transmitir frescor e leveza
- saturacao controlada
- contraste suficiente para leitura e acessibilidade

### Tipografia

A tipografia deve manter excelente legibilidade, mas com aparencia mais editorial e refinada.

Direcao:

- titulos com mais presenca visual
- subtitulos e microcopy curtos, humanos e claros
- labels e feedbacks com hierarquia mais evidente

### Superficies

Os cards devem parecer mais premium:

- cantos macios
- bordas delicadas
- sombras mais sofisticadas
- uso controlado de translucidez e brilho

## Componentes

### Hero

O hero deve comunicar velocidade e acolhimento.

Mudancas previstas:

- titulo principal mais orientado a acao
- subtitulo curto e menos genrico
- selo de apoio como prova de simplicidade e confianca
- ilustracao urbana leve com maior capricho visual

### Etapa 1: Foto

Esta etapa deve ser a mais convidativa e a mais facil de entender.

Mudancas previstas:

- area de preview maior e mais bonita
- estado vazio com composicao mais simpatica
- CTA principal dominante e muito facil de tocar
- feedback visual claro quando a foto for carregada

Objetivo:

- aumentar a sensacao de progresso rapido
- diminuir a hesitacao inicial

### Etapa 2: Localizacao

Esta etapa deve parecer muito menos burocratica.

Mudancas previstas:

- bloco de GPS mais claro e mais confiavel
- bloco manual mais leve visualmente
- destaque elegante para a origem ativa
- textos de ajuda mais humanos e menos mecanicos

Objetivo:

- reduzir esforco mental
- tornar a decisao GPS/manual obvia

### Etapa 3: Revisao e envio

Mudancas previstas:

- resumo em cards pequenos e agradaveis
- campo de nome com acabamento visual superior
- CTA final mais forte e direto
- mensagem de revisao curta e tranquilizadora

Objetivo:

- reforcar seguranca no envio
- manter a energia de conclusao

### Estado de sucesso

O estado de sucesso deve recompensar o usuario de maneira mais calorosa.

Mudancas previstas:

- composicao mais celebratoria, mas limpa
- protocolo com destaque real
- checklist com melhor hierarquia
- CTA para novo registro mantendo o mesmo tom visual

## Microcopy

A microcopy deve ser:

- curta
- humana
- tranquilizadora
- orientada a acao

Exemplos de intencao:

- reduzir frases tecnicas
- evitar tom burocratico
- reforcar que o processo e simples e rapido

## Microinteracoes

O redesign deve incluir polimento de movimento e resposta:

- transicoes suaves entre etapas
- estados de foco, hover e toque mais refinados
- feedback visual mais claro para sucesso e erro
- pequenas animacoes de entrada que nao prejudiquem desempenho

## Acessibilidade E Responsividade

O redesign deve preservar e reforcar:

- contraste adequado
- foco visivel em elementos interativos
- componentes confortaveis para toque
- boa leitura em telas pequenas
- hierarquia clara sem dependencia exclusiva de cor ou emoji

## Implementacao Recomendada

Arquivos-alvo:

- `public/index.html`
- `public/styles.css`
- `public/app.js`

Estrategia:

1. ajustar a estrutura visual do hero e dos agrupamentos principais sem quebrar ids e hooks ja usados no JavaScript
2. substituir a linguagem visual atual por uma composicao mais premium e acolhedora
3. revisar microcopy e estados visuais
4. polir transicoes e feedbacks

## Testes E Validacao

Validar:

- fluxo completo das 3 etapas no mobile
- estados com e sem GPS
- foto carregada e preview
- bloqueios corretos de CTA por etapa
- estado final de sucesso
- consistencia visual em desktop estreito e mobile

## Riscos

- excesso de elementos decorativos pode prejudicar a sensacao de rapidez
- fofura em excesso pode diminuir a confianca institucional
- refinamento visual sem boa hierarquia pode virar apenas maquiagem

## Mitigacoes

- manter CTA e etapa ativa sempre como foco dominante
- usar ilustracao e detalhes afetivos com moderacao
- validar sempre a leitura da tela em mobile antes de considerar o trabalho finalizado
