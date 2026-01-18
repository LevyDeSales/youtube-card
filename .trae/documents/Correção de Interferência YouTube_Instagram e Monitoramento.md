# Plano de Correção e Desacoplamento YouTube/Instagram

Este plano visa corrigir a interferência entre os módulos, centralizar a lógica duplicada e adicionar monitoramento.

## 1. Centralização de Lógica (Refatoração)

Criar um arquivo de utilitários compartilhado para evitar duplicação de código e inconsistências na detecção de URLs.

- **Criar `src/lib/utils/helpers.js`**:
  - Mover a regex do YouTube e a função `findVideoId` para este arquivo.
  - Implementar função `detectService(url)` que retorna `'youtube'` ou `'instagram'`.
  - Garantir que tanto `+page.svelte` quanto `Configuration.svelte` usem essa fonte única de verdade.

## 2. Correção de Conflitos de Estado (Configuration.svelte)

O problema principal é a mudança agressiva de `config.style`. Vamos refatorar para que a mudança de estilo seja "inteligente" e respeite o contexto.

- **Alterar `getVideoData` em `Configuration.svelte`**:
  - Usar a nova função centralizada para detectar o serviço.
  - **Lógica de Correção**:
    - Se for **Instagram**: Forçar `config.style = 'instagram'` (pois é o único estilo suportado).
    - Se for **YouTube**: Apenas alterar para `computer` (padrão) se o estilo atual for `instagram`. Se o usuário já estiver usando outros estilos do YouTube (`mobile`, `likes`, `subscribe`), manter a escolha dele.
  - Isso impede que o modo Instagram "quebre" as preferências do modo YouTube e vice-versa.

## 3. Isolamento e Independência (Page.svelte)

Garantir que a inicialização e o tratamento de dados sejam robustos.

- **Atualizar `src/routes/+page.svelte`**:
  - Importar helpers.
  - Adicionar validação para garantir que os dados recebidos da API correspondem ao serviço esperado antes de renderizar.

## 4. Monitoramento e Logs

Implementar um sistema simples de log para rastrear transições de estado e erros.

- **Criar `src/lib/utils/logger.js`**:
  - Implementar funções de log (`info`, `warn`, `error`) que adicionam timestamp e contexto.
- **Integrar Logs**:
  - Registrar trocas de serviço (Ex: "Switching from YouTube to Instagram").
  - Registrar conflitos (Ex: "URL detectada como Instagram mas estilo atual é YouTube").
  - Adicionar logs no backend (`src/routes/_api/info/+server.js`) para monitorar falhas na API.

## Resumo das Alterações de Arquivos

1.  `src/lib/utils/helpers.js` (Novo)
2.  `src/lib/utils/logger.js` (Novo)
3.  `src/routes/+page.svelte` (Modificado)
4.  `src/lib/components/Configuration.svelte` (Modificado)
5.  `src/routes/_api/info/+server.js` (Modificado)
