## Why

O fluxo atual da rota `/annotation` agrupa várias anotações em uma operação local única, mas a sincronização envia apenas o `localAnnotationId` para a RPC `create_occurrence_annotation`. Isso faz a fronteira remota perder a identidade da operação local, abrir margem para criar uma `field_operation` remota por anotação e dificulta garantir que a sincronização continue coerente agora que cada anotação também precisa registrar seu evento em `plant_occurrence_events`.

## What Changes

- Refatorar a sincronização de `/annotation` para separar explicitamente a identidade da operação local da identidade da anotação local.
- Ajustar o contrato de sincronização com Supabase para reutilizar uma única `field_operation` remota por operação local, sem perder a idempotência por anotação.
- Garantir que cada anotação sincronizada continue gerando um evento `added` em `plant_occurrence_events`, com rollback transacional se o evento não puder ser persistido.
- Atualizar o mapeamento local de IDs remotos e o estado de sincronização para evitar sobrescrever `remote_field_operation_id` com IDs divergentes entre anotações da mesma operação.
- Cobrir a mudança com testes de payload, sincronização local e documentação atualizada em `database.md` caso a RPC precise de novos parâmetros ou novo SQL consolidado.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `annotation-sync`: a sincronização deve preservar a operação local agrupadora, enviar identidade estável para operação e anotação, e continuar persistindo `plant_occurrence_events` de forma atômica.
- `annotation-local-state`: o SQLite local deve reconciliar um único `remote_field_operation_id` compartilhado entre várias anotações da mesma operação sem inconsistências de status.
- `occurrence-event-history`: a escrita de eventos de anotação deve manter a idempotência por anotação local sem perder o reaproveitamento da mesma `field_operation` remota para a operação agrupadora.

## Impact

- Código afetado: `src/ui/annotation/view-models/use-annotation.tsx`, `src/data/services/annotation/annotation-supabase-service.ts`, `src/data/services/annotation/use-annotation-sqlite-service.ts`, `src/data/repositories/annotation/annotation-repository.ts`, modelos e testes da funcionalidade de anotação.
- API/contrato afetado: RPC `public.create_occurrence_annotation` e seu payload de sincronização.
- Documentação afetada: `database.md`, se a assinatura da RPC ou o comportamento documentado precisar ser ajustado para refletir a nova separação entre `localOperationId` e `localAnnotationId`.
