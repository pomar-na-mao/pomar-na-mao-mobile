## 1. Types And UI

- [x] 1.1 Narrow `InspectionChangeType` to `add_occurrence | remove_occurrence`.
- [x] 1.2 Remove update and resolve options from the nearest-plant modal action dropdown.
- [x] 1.3 Adjust view-model status mapping so add maps to `open` and remove maps to the occurrence-closing status.

## 2. Local State And Sync

- [x] 2.1 Update occurrence projection logic to handle only add and remove inspection changes.
- [x] 2.2 Update SQLite service expectations/tests so local projection and `occurrences_json` persistence cover only add/remove.
- [x] 2.3 Update sync payload and Supabase service tests so add/remove are the only inspection actions produced by the current app flow.

## 3. Tests

- [x] 3.1 Update nearest-plant modal tests to assert only add/remove actions are available.
- [x] 3.2 Update inspection provider tests to remove update/resolve paths and cover add/remove validation.
- [x] 3.3 Run focused inspection tests after code updates and fix regressions.

## 4. Documentation And Validation

- [x] 4.1 Update `database-and-features-organization.md` section `20.2` so local change types, payload examples, RPC logic, and expected Supabase results document only add/remove occurrence actions.
- [x] 4.2 Search `database-and-features-organization.md` for stale `update_occurrence` and `resolve_occurrence` references in inspection item `20.2` and remove or rewrite them.
- [x] 4.3 Run `npm.cmd test`, `npx.cmd tsc --noEmit`, and focused lint for touched inspection files.
