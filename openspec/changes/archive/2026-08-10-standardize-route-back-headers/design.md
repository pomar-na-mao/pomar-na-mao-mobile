## Context

As rotas de trabalho de campo compartilham o mesmo contexto de navegação a partir de `/field-works`, mas hoje não compartilham a mesma composição de header. `src/app/_layout.tsx` deixa `inspection` e `annotation` com o header padrão do Expo Router e esconde o header de `spraying`, enquanto a própria UI de pulverização já renderiza headers internos com botão de voltar em seus estados de lista e mapa.

A mudança é pequena em escopo funcional, mas transversal em UI e navegação: ela exige alinhar stack options, safe area e composição de topo em três rotas sem quebrar overlays de mapa, painéis absolutos nem ações específicas de cada fluxo.

## Goals / Non-Goals

**Goals:**

- Garantir que `/inspection`, `/annotation` e `/spraying` usem o mesmo padrão de header com botão de voltar.
- Centralizar estilos e comportamento de navegação do header para reduzir duplicação.
- Manter o conteúdo principal de cada tela responsável apenas pelo seu fluxo de negócio.
- Preservar o comportamento atual de retorno de cada rota sem alterar o destino esperado pelo usuário.

**Non-Goals:**

- Redesenhar os cards, painéis ou barras de ação das telas de campo.
- Alterar regras de negócio de inspeção, anotação ou pulverização.
- Introduzir uma nova estrutura de navegação ou rotas intermediárias.

## Decisions

### Extrair um header compartilhado orientado ao padrão de `/spraying`

O header existente em `/spraying` servirá como referência visual para o componente compartilhado. Esse componente deve encapsular botão de voltar, título, subtítulo opcional e slot opcional de ação à direita, cobrindo o cabeçalho da lista de pulverizações e os novos cabeçalhos de inspeção e anotação.

Alternativa considerada: copiar os estilos de `/spraying` para cada tela. Isso atenderia o objetivo imediato, mas cristalizaria divergências futuras e aumentaria custo de manutenção.

### Desabilitar o header do stack nas rotas de campo padronizadas

`inspection` e `annotation` devem seguir o mesmo modelo de `spraying`: header nativo oculto e header renderizado pela própria tela. Isso mantém espaçamento, bordas, tipografia e comportamento de navegação sob controle da UI do app, além de evitar diferenças entre plataformas.

Alternativa considerada: adaptar `/spraying` para usar o header do stack. Isso limitaria a composição já usada nas telas com mapa e exigiria encaixar ações e subtítulos em APIs menos flexíveis.

### Tratar o header como parte fixa do layout da tela, não como overlay do mapa

Nas rotas com mapa, o header padronizado deve ocupar a parte superior do layout e o conteúdo visual principal deve se ajustar abaixo dele. Os painéis absolutos já existentes precisam recalcular seu offset superior com base nessa nova estrutura para não competir visualmente com o header.

Alternativa considerada: sobrepor o header ao mapa como mais um painel absoluto. Isso aumenta o risco de colisão com os painéis de resumo e com a área segura do dispositivo.

## Risks / Trade-offs

- [O novo header pode deslocar overlays existentes nas telas com mapa] → Ajustar `SafeAreaView`, espaçamento superior e offsets dos painéis no mesmo change.
- [Um componente compartilhado pode não acomodar diferenças reais entre telas] → Manter subtítulo e ação à direita como props opcionais em vez de fixar uma estrutura rígida.
- [A navegação de retorno pode divergir entre lista e mapa de pulverização] → Preservar o comportamento especial já existente em `spraying` e padronizar apenas a camada visual e o gatilho de voltar.

## Migration Plan

1. Ocultar o header do stack nas rotas de campo que ainda usam o padrão nativo.
2. Extrair o componente compartilhado de header a partir do visual já usado em `/spraying`.
3. Integrar o componente nas telas de `inspection`, `annotation` e nos estados relevantes de `spraying`.
4. Atualizar testes de navegação e renderização básica dos headers.

Rollback consiste em restaurar as opções atuais de `Stack.Screen` e os headers locais anteriores. Não há migração de dados nem impacto em persistência.

## Open Questions

- O subtítulo de `inspection` e `annotation` deve refletir estado resumido da operação, como já ocorre em `spraying`, ou basta padronizar título e botão de voltar nesta primeira etapa?
