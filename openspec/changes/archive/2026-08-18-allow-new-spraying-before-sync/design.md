## Context

A lista de `/spraying` só renderiza o CTA “Iniciar Nova Pulverização” no estado vazio. Assim que a primeira operação é finalizada, ela permanece na lista até a sincronização e o CTA desaparece, embora os dados locais já estejam consolidados e o rastreamento tenha sido encerrado.

O view-model também usa `getRecoverableOperation()` para obter qualquer operação cujo status não seja `synced`. Essa consulta mistura dois conceitos: uma operação em andamento, que deve ser retomada com exclusividade, e operações concluídas pendentes, que devem permanecer como histórico local sem controlar o novo ciclo. Como o rastreamento em segundo plano usa uma única tarefa e uma única chave de operação ativa, a solução deve continuar permitindo no máximo um ciclo `draft` ou `tracking`, mas pode manter qualquer quantidade de operações concluídas.

## Goals / Non-Goals

**Goals:**

- Permitir pulverizações consecutivas offline sem exigir sincronização entre elas.
- Separar operação em andamento de operações concluídas pendentes no serviço local e no view-model.
- Preservar integralmente cada operação concluída e permitir revisão, sincronização e exclusão por ID.
- Manter uma ação de nova pulverização visível e acessível quando a lista contém itens.
- Impedir criações concorrentes quando já existe uma operação `draft` ou `tracking`.

**Non-Goals:**

- Alterar o lifecycle, o payload de sincronização, RPCs ou estruturas SQLite existentes.
- Sincronizar automaticamente ao finalizar ou iniciar outra operação.
- Redesenhar cards, mapa, modal de configuração ou revisão.
- Permitir mais de um rastreamento GPS simultâneo.

## Decisions

### Consultar explicitamente a operação em andamento

O serviço local deve substituir ou restringir a semântica ampla de `getRecoverableOperation()` por uma consulta de operação em andamento, filtrada para `lifecycle_status IN ('draft', 'tracking')`. A inicialização do provider e `openMapView()` sem ID usarão essa consulta: se houver uma operação em andamento, ela será retomada; caso contrário, o aggregate será limpo e a zona carregada será restaurada para uma nova configuração.

Operações `finished`, `simulated`, `reviewed`, `syncing`, `sync_error` e `synced` continuarão disponíveis apenas pela lista e pelas ações por ID. Essa separação evita que uma pendência de sincronização seja confundida com o ciclo que controla o mapa e a captura GPS.

Alternativa considerada: manter `getRecoverableOperation()` amplo e ignorar seus resultados somente no componente da lista. Isso corrigiria o botão, mas manteria a restauração ambígua após reiniciar o app e deixaria a regra vulnerável a outros pontos de entrada.

### Garantir a exclusividade também na criação local

Além do redirecionamento no view-model, `createOperation()` deve verificar dentro da transação se já existe uma operação `draft` ou `tracking` e recusar uma nova inserção nesse caso. A defesa no serviço evita duplicidade por toque repetido, estado React atrasado ou chamada futura que não passe pelo mesmo CTA.

Alternativa considerada: desabilitar apenas o botão durante o carregamento. Isso reduz toques repetidos, mas não protege a invariável de domínio fora daquele componente.

### Manter um único CTA no rodapé da tela

A tela exibirá um único botão textual “Iniciar Nova Pulverização” em um rodapé persistente abaixo da `FlatList`, reutilizando `colors.tint`, `MaterialIcons` e o padrão visual existente. A lista ocupará o espaço restante e continuará rolável, enquanto o CTA permanecerá visível nos estados vazio e não vazio sem sobrepor cards. O alvo terá 48 pontos de altura, rótulo de acessibilidade e estado de toque explícito.

Ao pressionar o CTA, `openMapView()` sem ID abrirá um novo estado de configuração se não houver operação em andamento. Se houver `draft` ou `tracking`, a mesma ação retomará essa operação e nunca criará outra em paralelo.

Alternativas consideradas: usar `ListFooterComponent` faria o botão sair da tela em listas longas; um botão flutuante adicionaria sobreposição, tratamento extra de safe area e risco de ocultar ações dos cards. Um rodapé irmão da lista reserva seu próprio espaço e mantém o CTA visível sem cobrir conteúdo.

### Manter operações concluídas isoladas por identidade local

Finalizar uma operação atualizará apenas seu lifecycle e filhos, retornará à lista e deixará o aggregate fora do papel de ciclo ativo. Iniciar outra operação criará um novo `local_id`; sincronização, revisão e exclusão continuarão recebendo o ID do card selecionado e não limparão ou substituirão outras operações pendentes.

Alternativa considerada: mover operações concluídas para outra tabela ou fila. As tabelas atuais já suportam múltiplos IDs e estados, portanto uma nova persistência aumentaria complexidade sem benefício funcional.

### Confirmar a zona antes do setup de cada novo ciclo

Quando uma zona persistida for restaurada após a pulverização anterior, o CTA “Iniciar” não deve abrir o setup diretamente. Ele deve reutilizar o modal de zonas carregadas, mantendo a zona anterior pré-selecionada e permitindo escolher qualquer opção retornada por `listLoadedZones()`. Depois que `loadZone()` concluir com sucesso, o provider abrirá o setup automaticamente com a zona confirmada.

O provider controlará se o seletor foi aberto como etapa do início ou apenas para exibir plantas. Cancelar o modal limpa essa intenção; erros de carregamento mantêm o seletor aberto e não exibem o setup. Assim, o fluxo inicial “Exibir plantas” continua carregando o mapa sem iniciar imediatamente uma operação.

Alternativa considerada: adicionar um segundo botão “Trocar zona” ao lado de “Iniciar”. Isso alteraria a barra de ações e duplicaria uma decisão que pode ser incorporada ao fluxo existente sem mudança de layout.

## Risks / Trade-offs

- [Bancos locais existentes podem conter mais de uma operação `draft` ou `tracking`] → Recuperar deterministicamente a mais recente, não criar outra e cobrir o comportamento legado em teste; a implementação pode registrar ou apresentar erro para saneamento posterior sem apagar dados automaticamente.
- [A sincronização de uma operação antiga pode ocorrer enquanto outra está em rastreamento] → Manter todas as mutações e limpezas condicionadas ao ID alvo; nunca parar a tarefa GPS nem limpar o aggregate de uma operação diferente.
- [O rodapé persistente reduz o espaço vertical disponível para a lista] → Reservar o rodapé no fluxo normal, manter a lista com `flex: 1` e preservar seu conteúdo rolável sem sobreposição.
- [Renomear o método local pode afetar mocks e testes existentes] → Atualizar contrato, mocks e testes no mesmo change, sem alterar o schema SQLite.

## Migration Plan

1. Introduzir a consulta de operação em andamento e a guarda transacional de criação usando as colunas já existentes.
2. Atualizar inicialização e navegação do provider para usar a nova semântica.
3. Unificar o CTA em um rodapé persistente para listas vazias ou não vazias e atualizar os testes de componente.
4. Validar cenários com uma e várias operações concluídas offline, reinício do app e uma operação em rastreamento.

Rollback consiste em reverter o serviço, o view-model e o CTA. Não há migração de dados, mudança de schema ou alteração do contrato Supabase.

## Open Questions

None.
