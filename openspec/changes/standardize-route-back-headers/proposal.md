## Why

Os fluxos de campo hoje usam headers diferentes entre si: `inspection` e `annotation` dependem do header padrão do stack, enquanto `spraying` já usa um header interno com botão de voltar e composição visual própria. Essa inconsistência quebra o padrão de navegação entre rotas irmãs e dificulta evoluir o layout de forma uniforme.

## What Changes

- Padronizar o header com botão de voltar das rotas `/inspection`, `/annotation` e `/spraying` para seguir o mesmo padrão visual e estrutural já usado em `/spraying`.
- Remover a dependência do header padrão do stack nas rotas de trabalho de campo que ainda o usam, para que o layout do topo seja controlado pela própria tela.
- Extrair ou consolidar um componente compartilhado de header para evitar duplicação de estilos, comportamento de navegação e tratamento de safe area.
- Preservar ações específicas de cada tela sem alterar seus fluxos principais de mapa, filtros, sincronização ou captura de dados.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `inspection-screen-route`: a rota de inspeção passa a exibir um header interno padronizado com botão de voltar para a tela de trabalhos de campo.
- `annotation-screen-route`: a rota de anotação passa a exibir um header interno padronizado com botão de voltar para a tela de trabalhos de campo.
- `spraying-screen-route`: a rota de pulverização passa a definir o padrão compartilhado de header interno com botão de voltar para os estados de lista e mapa.

## Impact

- Afeta a configuração de navegação em `src/app/_layout.tsx` e os entrypoints de `inspection`, `annotation` e `spraying`.
- Afeta componentes de UI de topo nas telas em `src/ui/inspection`, `src/ui/annotation`, `src/ui/spraying` e possivelmente um novo componente compartilhado em `src/ui/shared/components`.
- Exige atualização ou criação de testes de interface para garantir navegação de retorno e consistência visual básica entre as rotas.
