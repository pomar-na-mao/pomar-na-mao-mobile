## Why

Depois que uma pulverização é finalizada, ela permanece armazenada localmente até a sincronização e passa a ocupar a lista de operações. Nesse estado, a tela deixa de oferecer a ação para iniciar outra pulverização, obrigando o usuário a sincronizar antes de continuar o trabalho de campo e quebrando o fluxo offline.

## What Changes

- Manter uma ação acessível para iniciar uma nova pulverização mesmo quando a lista contém operações finalizadas, simuladas, revisadas ou com erro de sincronização.
- Exibir essa ação como um único CTA persistente no rodapé da tela, abaixo da lista rolável e sem sobrepor os cards, tanto no estado vazio quanto com operações carregadas.
- Tratar somente uma operação em andamento (`draft` ou `tracking`) como ciclo ativo exclusivo; operações concluídas e ainda não sincronizadas permanecem independentes na lista e não bloqueiam um novo ciclo.
- Ao iniciar uma nova pulverização, abrir o mapa em estado limpo para configuração, preservando as operações anteriores e seus dados locais para revisão, sincronização ou exclusão posterior.
- Antes de abrir a configuração de uma nova operação, permitir confirmar a última zona restaurada ou escolher qualquer outra zona previamente carregada.
- Impedir o início de uma segunda pulverização apenas quando já existir outra operação em andamento, retomando essa operação em vez de criar uma concorrente.
- Cobrir o fluxo offline e a convivência de múltiplas operações pendentes com testes de view-model, persistência local e interface da lista.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `spraying-screen-route`: a lista de pulverizações passa a oferecer o início de uma nova operação mesmo com operações concluídas ainda não sincronizadas, respeitando a exclusividade de uma operação em andamento.
- `spraying-local-review`: a recuperação local passa a distinguir a operação atualmente rastreada das operações concluídas pendentes, preservando múltiplos ciclos locais independentes antes da sincronização.

## Impact

- Afeta o estado e a navegação entre lista e mapa em `src/ui/spraying/view-models/use-spraying.tsx`.
- Afeta o CTA de nova pulverização e seus testes em `src/ui/spraying/components/spraying-list-screen`.
- Afeta as consultas de recuperação de operação em `src/data/services/spraying/spraying-sqlite-service.ts` e testes associados.
- Não altera tabelas, migrations, RPCs, políticas ou contratos do Supabase; todas as operações continuam usando as estruturas SQLite e o fluxo de sincronização existentes.
