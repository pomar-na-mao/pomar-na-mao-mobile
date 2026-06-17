## Context

A rota `/annotation` salva anotações localmente em `local_plant_occurrences` e agrupa várias delas sob uma única `local_field_operations` ativa até o usuário finalizar a operação. Na sincronização, porém, o app envia apenas `localAnnotationId` para `create_occurrence_annotation`, embora o payload local já conheça `localOperationId`.

Esse desenho cria um desalinhamento entre o modelo local e o remoto:

- a identidade usada para idempotência da ocorrência e do evento é a mesma identidade usada para reconciliar `field_operations`;
- o backend pode criar uma `field_operation` remota por anotação, enquanto o app assume uma operação remota compartilhada;
- o `remote_field_operation_id` local pode ser sobrescrito com IDs divergentes ao sincronizar múltiplas anotações da mesma operação;
- a exigência de persistir `plant_occurrence_events` para cada anotação precisa continuar atômica e idempotente.

O `database.md` já descreve `plant_occurrence_events` e a RPC `create_occurrence_annotation`, então qualquer ajuste de assinatura ou de comportamento precisa ser refletido lá.

## Goals / Non-Goals

**Goals:**

- Preservar a semântica de uma única operação local agrupando várias anotações.
- Separar a identidade estável da operação local da identidade estável da anotação local no contrato de sincronização.
- Garantir que cada anotação sincronizada continue criando exatamente um evento `added` em `plant_occurrence_events`.
- Impedir que o app silenciosamente aceite IDs remotos de operação incompatíveis para anotações da mesma operação local.
- Manter `database.md` alinhado ao contrato real da RPC revisada.

**Non-Goals:**

- Migrar a rota `/annotation` para sincronização em lote.
- Alterar a UX da tela de anotação, escolha de ocorrência ou captura de GPS.
- Introduzir escrita direta do cliente em `plant_occurrence_events`.
- Redesenhar o algoritmo de planta mais próxima.

## Decisions

### 1. Enviar identidade de operação e identidade de anotação como campos distintos

A sincronização passará a enviar explicitamente:

- um identificador estável da operação local agrupadora, para reconciliar `field_operations`;
- um identificador estável da anotação local, para reconciliar `plant_occurrences` e `plant_occurrence_events`.

Rationale:

- o SQLite já modela essas duas identidades separadamente;
- a RPC atual mistura responsabilidades em `p_local_id`;
- separar as identidades remove a ambiguidade sem exigir mudança de UX.

Alternativas consideradas:

- Manter a RPC atual e aceitar uma operação remota por anotação. Rejeitada porque contradiz o modelo local e torna `remote_field_operation_id` inconsistente.
- Criar uma RPC separada para abrir/sincronizar a operação e outra para cada ocorrência. Rejeitada porque aumenta o acoplamento cliente-backend e introduz passos extras de orquestração para um ganho pequeno neste escopo.

### 2. Manter uma RPC por anotação, mas com reconciliação estável da operação remota

Cada anotação continuará sendo sincronizada individualmente, porém a RPC deverá:

- localizar ou criar a `field_operation` remota pelo identificador da operação local;
- localizar ou criar a ocorrência e o evento pelo identificador da anotação local;
- retornar sempre o mesmo `field_operation_id` para anotações pertencentes à mesma operação local.

Rationale:

- minimiza o refactor no app;
- preserva a granularidade atual de retry por anotação;
- mantém a atomicidade entre `field_operations`, `plant_occurrences` e `plant_occurrence_events`.

Alternativas consideradas:

- Sincronização em lote por operação. Rejeitada por exigir contrato novo, tratamento de falha parcial e maior esforço de teste.

### 3. Tratar divergência de `field_operation_id` como erro de contrato, não como dado para overwrite

Se uma anotação sincronizada para uma operação local já conhecida retornar um `field_operation_id` diferente do já salvo localmente, o app não deverá sobrescrever o valor existente silenciosamente.

Rationale:

- sobrescrever mascara corrupção de vínculo entre operação local e operação remota;
- a divergência indica erro de implementação no backend ou payload inconsistente.

Alternativas consideradas:

- Sobrescrever sempre com o último ID retornado. Rejeitada porque perde rastreabilidade e consolida estado incorreto.
- Ignorar a divergência e concluir a sincronização como sucesso. Rejeitada porque deixa o banco local inconsistente.

### 4. Manter a idempotência do evento baseada na anotação local

Mesmo com a separação da identidade da operação, a idempotência do evento continuará baseada em `device_id + local_change_id`, onde `local_change_id` representa a anotação local sincronizada.

Rationale:

- cada anotação gera um único evento `added`;
- retries da mesma anotação não devem duplicar histórico;
- a operação agrupadora pode conter vários eventos distintos.

Alternativas consideradas:

- Usar a identidade da operação como `local_change_id`. Rejeitada porque múltiplas anotações da mesma operação colidiriam no índice único de eventos.

## Risks / Trade-offs

- [RPC revisada quebra chamadas antigas] → Atualizar cliente, testes e `database.md` no mesmo change; manter compatibilidade apenas se o custo for baixo e não reintroduzir ambiguidade.
- [Dados locais já sincronizados com múltiplas operações remotas] → Limitar o escopo à correção do fluxo futuro; não tentar reconciliar histórico remoto automaticamente sem requisito explícito.
- [Divergência de IDs aumenta erros visíveis no app] → Preferir falha explícita a corrupção silenciosa e exibir mensagem clara para retry/investigação.
- [Mais parâmetros na RPC aumentam manutenção documental] → Tratar `database.md` como parte obrigatória da entrega se a assinatura mudar.

## Migration Plan

1. Ajustar os modelos e o serviço de sincronização da anotação para enviar a identidade da operação local separadamente.
2. Revisar a RPC `create_occurrence_annotation` para reconciliar `field_operations` por identidade de operação e manter a idempotência da ocorrência/evento por identidade da anotação.
3. Atualizar a reconciliação local de `remote_field_operation_id` para validar estabilidade entre múltiplas anotações da mesma operação.
4. Atualizar testes unitários e de migração/documentação.
5. Atualizar `database.md` com assinatura, payload, SQL e semântica revisados, se a RPC mudar.

Rollback:

- Reverter cliente e RPC para a assinatura anterior apenas se a mudança ainda não tiver sido consumida por builds distribuídos.
- Após rollout do contrato novo, rollback seguro exige restaurar também a documentação para evitar drift operacional.

## Open Questions

- O nome do novo parâmetro da RPC deve explicitar `operation_local_id` ou `field_operation_local_id` para refletir melhor o domínio compartilhado?
- A RPC deve continuar aceitando chamadas legadas sem identidade de operação separada durante um período de transição, ou a mudança pode ser feita de forma estrita?
