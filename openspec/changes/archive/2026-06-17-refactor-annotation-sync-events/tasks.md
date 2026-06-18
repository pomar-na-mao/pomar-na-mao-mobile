## 1. Contrato de sincronização da anotação

- [x] 1.1 Atualizar `SyncAnnotationPayload`, fixtures e testes para carregar uma identidade estável de operação separada da identidade estável da anotação.
- [x] 1.2 Ajustar `annotation-supabase-service` e a chamada da rota `/annotation` para enviar a identidade da operação local explicitamente para a RPC.
- [x] 1.3 Revisar `annotation-repository` e o contrato de retorno para manter o `field_operation_id` remoto estável entre anotações da mesma operação local.

## 2. Reconciliação local e tratamento de inconsistências

- [x] 2.1 Atualizar `use-annotation-sqlite-service` para reconciliar um único `remote_field_operation_id` por `local_field_operation`.
- [x] 2.2 Impedir overwrite silencioso quando uma anotação retornar `field_operation_id` remoto divergente do já salvo para a operação local.
- [x] 2.3 Garantir que status, contadores e mensagens de erro continuem coerentes quando uma anotação falhar ou quando houver inconsistência de vínculo remoto.

## 3. RPC, documentação e testes

- [x] 3.1 Revisar `public.create_occurrence_annotation` para reconciliar `field_operations` pela identidade da operação local e manter `plant_occurrence_events` idempotente pela identidade da anotação local.
- [x] 3.2 Atualizar `database.md` com a assinatura, payload, SQL consolidado e semântica revisada da RPC se o contrato remoto for alterado na implementação.
- [x] 3.3 Cobrir a mudança com testes unitários da sincronização de anotação e testes/documentação que validem a gravação transacional em `plant_occurrence_events`.
