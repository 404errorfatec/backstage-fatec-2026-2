# Design: UI/UX Mobile-First do Cidade Sem Buracos

Data: 2026-03-27
Status: Aprovado em conversa, aguardando revisao do arquivo

## Objetivo

Definir a interface e a experiencia de usuario inicial do sistema web "Cidade Sem Buracos", com prioridade total para uso em celulares, para que qualquer pessoa consiga registrar um buraco de forma rapida, simples e confiavel.

O foco da primeira versao e reduzir atrito:

- sem cadastro ou login
- entrada direta no formulario
- envio com poucos passos
- foto como ponto principal do fluxo
- localizacao automatica por GPS com fallback manual
- feedback imediato apos o envio

## Escopo da Primeira Versao

O sistema deve permitir:

- tirar foto do buraco ou enviar imagem da galeria
- capturar localizacao atual via GPS do celular
- preencher endereco manualmente quando o GPS falhar ou for recusado
- informar o nome da pessoa no momento do envio
- enviar a solicitacao para registro
- exibir confirmacao clara de sucesso

Fica fora do escopo inicial:

- criacao de conta
- autenticacao
- acompanhamento detalhado de status pelo usuario
- painel administrativo
- historico de solicitacoes do usuario

Observacao:
O produto deve deixar espaco visual e estrutural para evoluir futuramente para acompanhamento de status.

## Principios de UX

- Mobile-first de verdade: a experiencia principal e desenhada para uma mao, tela vertical e interacoes curtas.
- Minimo de passos: o fluxo ideal deve fechar em 2 a 3 interacoes principais.
- Clareza acima de tudo: cada bloco da tela deve ter uma funcao clara e uma unica hierarquia visual dominante.
- Thumb-friendly: botoes grandes, espacamento confortavel e CTA principal fixado em zona facil de alcance.
- Feedback imediato: estados de carregamento, sucesso e erro devem ser visiveis sem ambiguidade.
- Confianca civica: a interface deve transmitir utilidade publica, organizacao e credibilidade.
- Performance percebida: transicoes leves, sem excesso de animacao, com sensacao de fluidez continua.

## Abordagens Consideradas

### Opcao 1: Tela unica

Tudo acontece em uma unica tela: foto, localizacao, endereco manual opcional, nome e envio.

Vantagens:

- menor atrito
- mais rapida para uso recorrente ou urgente
- mais alinhada com o objetivo de uso no celular

Riscos:

- exige boa hierarquia visual para nao parecer carregada

### Opcao 2: Fluxo em 2 etapas

Etapa 1 para foto; etapa 2 para localizacao, nome e envio.

Vantagens:

- mais sensacao de progresso
- tela mais limpa por etapa

Riscos:

- adiciona friccao
- aumenta chance de abandono

### Opcao 3: Home curta + formulario em seguida

Uma tela inicial de apresentacao antes do registro.

Vantagens:

- reforca contexto do produto

Riscos:

- cria um passo sem ganho operacional relevante

### Escolha recomendada

Adotar a Opcao 1: tela unica.

Justificativa:
O problema do usuario e objetivo e urgente: registrar um buraco rapidamente. A tela unica atende melhor a necessidade de velocidade, reduz a carga cognitiva e permite que o principal valor do produto apareca imediatamente.

## Estrutura de Telas

### 1. Tela principal de registro

Tela de entrada do produto. Abre direto no formulario.

Componentes:

- cabecalho leve com marca
- subtitulo curto explicando o objetivo
- bloco principal de foto
- bloco de localizacao
- link para endereco manual
- campo de nome
- botao primario de envio

### 2. Estado de sucesso

Nao precisa abrir uma nova pagina. O ideal e substituir o conteudo principal por um estado de confirmacao.

Componentes:

- check visual com animacao curta
- mensagem principal de confirmacao
- texto complementar reforcando impacto civico
- botao para novo registro
- nota discreta sobre futuro acompanhamento de status

### 3. Estados de excecao

Estados auxiliares dentro da mesma experiencia:

- permissao de GPS negada
- falha ao obter localizacao
- foto ausente
- erro de envio
- endereco manual incompleto

## Fluxo do Usuario

### Fluxo ideal

1. Usuario abre o sistema e ja encontra o formulario.
2. Usuario toca em "Tirar foto" e registra a imagem.
3. O sistema tenta preencher a localizacao automaticamente.
4. Usuario informa o nome.
5. Usuario toca em "Enviar solicitacao".
6. O sistema mostra confirmacao imediata de sucesso.

### Fluxo alternativo com endereco manual

1. Usuario abre o sistema.
2. Usuario tira ou envia a foto.
3. O GPS falha ou o usuario prefere preencher manualmente.
4. Usuario toca em "Inserir endereco manualmente".
5. Usuario preenche endereco e nome.
6. Usuario envia a solicitacao.
7. O sistema mostra confirmacao de sucesso.

## Wireframe Textual

```text
[Topo]
Cidade Sem Buracos
Registre um buraco em poucos segundos

[Card principal]
Foto do buraco
Tire uma foto para identificar o problema
[Botao grande: Tirar foto]
[Acao secundaria: Enviar da galeria]
[Preview da imagem, quando existir]

[Card de localizacao]
Sua localizacao
Buscando sua localizacao...
ou
Localizacao detectada
[Acao secundaria: Inserir endereco manualmente]

[Endereco manual, quando ativado]
Rua / Avenida
Numero
Bairro
Cidade

[Campo]
Seu nome

[Rodape com CTA fixo]
[Botao primario: Enviar solicitacao]

[Estado de sucesso]
[Check animado]
Obrigado por contribuir! Sua solicitacao foi enviada para a prefeitura.
Seu registro ajuda a melhorar a cidade.
[Botao: Registrar outro buraco]
Em breve voce podera acompanhar o status da solicitacao.
```

## Layout e Hierarquia Visual

### Direcao visual

O produto deve ser clean, leve e moderno, sem parecer generico ou frio. A interface precisa parecer institucional o bastante para transmitir confianca, mas amigavel o suficiente para convidar a participacao.

### Hierarquia da tela

Ordem visual recomendada:

1. Foto
2. Localizacao
3. Nome
4. Envio

Motivo:
A foto e o elemento mais concreto para o usuario e tambem o insumo mais util para validacao da ocorrencia. Ela deve ser a acao mais destacada da interface.

### Layout mobile

- container central com largura confortavel para celulares
- cards empilhados com espacamento generoso
- CTA principal fixo na parte inferior em dispositivos moveis
- preview da foto com cantos arredondados
- icones simples e amigaveis

### Layout web responsivo

Em desktop, o mesmo fluxo deve funcionar sem mudar a logica:

- conteudo centralizado
- largura maxima controlada
- cards maiores com mais respiro
- botao de envio ainda destacado no rodape do conteudo

## Direcao de UI

### Paleta sugerida

- azul como cor principal de confianca e servico publico
- verde como cor de sucesso e confirmacao
- neutros claros para fundo e superfices

Exemplo conceitual:

- azul principal para CTA e destaques
- azul escuro para titulo e informacao institucional
- verde para sucesso
- cinza claro para fundo geral
- branco para cards

### Componentes

- botoes com altura entre 52px e 56px
- bordas arredondadas medias
- tipografia legivel e sem excesso de peso visual
- icones consistentes para camera, localizacao e sucesso
- emojis apenas como apoio pontual, nunca como base da navegacao

### Motion e performance

- transicoes entre 180ms e 240ms
- animacoes simples de fade, slide curto ou scale
- animacao de sucesso com check e expansao sutil
- evitar motion excessivo para preservar fluidez e clareza

Objetivo:
Passar sensacao de app leve e bem acabado, com resposta visual imediata e sem ruido.

## Microcopy

### Cabecalho

- Cidade Sem Buracos
- Registre um buraco em poucos segundos

### Foto

- Foto do buraco
- Tire uma foto para identificar o problema
- Tirar foto
- Enviar da galeria
- Foto adicionada com sucesso

### Localizacao

- Sua localizacao
- Buscando sua localizacao...
- Localizacao detectada
- Nao foi possivel acessar o GPS
- Inserir endereco manualmente
- Use sua localizacao atual ou preencha o endereco

### Nome

- Seu nome
- Digite seu nome

### Envio

- Enviar solicitacao
- Enviando...

### Sucesso

- Obrigado por contribuir! Sua solicitacao foi enviada para a prefeitura.
- Seu registro ajuda a melhorar a cidade.
- Registrar outro buraco
- Em breve voce podera acompanhar o status da solicitacao.

### Erros

- Adicione uma foto para continuar
- Informe sua localizacao ou endereco
- Preencha seu nome
- Nao foi possivel enviar agora. Tente novamente em instantes.

## Regras de Interacao

- O botao principal deve ficar desabilitado ate existirem foto, localizacao ou endereco, e nome.
- O sistema deve tentar obter GPS automaticamente assim que a tela abrir, com feedback visivel de carregamento.
- O preenchimento manual de endereco deve ser secundario e discreto, aparecendo como apoio.
- O estado de sucesso deve substituir rapidamente o formulario apos resposta bem-sucedida.
- A experiencia deve tolerar variacoes de rede sem travar a interface.

## Estrutura Recomendada de Dados

Mesmo sem login, o registro precisa ser organizado para persistencia e futuras evolucoes.

Campos recomendados:

- `id`
- `reporter_name`
- `photo_url` ou referencia do arquivo
- `latitude`
- `longitude`
- `manual_street`
- `manual_number`
- `manual_district`
- `manual_city`
- `location_source` com valores como `gps` ou `manual`
- `status` com valor inicial `submitted`
- `created_at`
- `updated_at`

Campos futuros opcionais:

- `protocol_code`
- `status_updated_at`
- `city_response`

## Tratamento de Erros

### GPS indisponivel

Comportamento:
mostrar mensagem curta, nao bloquear a experiencia e destacar a entrada manual de endereco.

### Sem foto

Comportamento:
impedir envio e mostrar validacao objetiva.

### Falha de rede ou backend

Comportamento:
preservar os dados preenchidos na tela, mostrar erro curto e permitir nova tentativa.

## Testes de UX Recomendados

- validar uso com uma mao em celulares pequenos
- verificar se o fluxo ideal fecha em menos de 20 segundos
- medir clareza dos estados de GPS
- garantir que a confirmacao de sucesso seja percebida sem duvida
- testar contraste, tamanho de toque e legibilidade

## Resultado Esperado

Ao final da implementacao, o produto deve permitir que uma pessoa:

- abra o sistema
- tire a foto do buraco
- confirme ou ajuste a localizacao
- informe o nome
- envie a solicitacao

Tudo isso com o minimo de friccao, forte clareza visual e sensacao de produto confiavel e bem resolvido.
