## 1. Offline Occurrence State

- [x] 1.1 Add or extend inspection helpers/service logic to derive the effective occurrence state for a loaded plant from its current occurrences plus pending local changes.
- [x] 1.2 Update `saveOccurrenceChange` so update, remove, and resolve actions validate against the effective offline occurrence state instead of only `nearestPlant.occurrences`.
- [x] 1.3 Ensure remove actions for occurrences added or updated earlier in the same inspection save a local change with the projected previous occurrence value.

## 2. Local Persistence

- [x] 2.1 Update `addInspectionChange` to project add, update, remove, and resolve changes into `local_inspection_loaded_plants.occurrences_json` inside the same transaction as the change row.
- [x] 2.2 Keep restored inspection plants consistent by reading the projected `occurrences_json` through the existing loaded plant mapping.
- [x] 2.3 Verify `plants_changed_count`, `is_changed`, nearest state, and distance state still update as before after local occurrence edits.

## 3. Synchronization

- [x] 3.1 Verify `buildSyncPayload` preserves chronological add-then-remove change rows with previous and new values.
- [x] 3.2 Confirm or adjust `sync_manual_inspection` payload/status semantics so remove actions update `plant_occurrences.status` remotely.
- [x] 3.3 After successful sync, ensure loaded plant occurrence state no longer exposes removed or resolved occurrences as open before creating a follow-up local inspection.

## 4. Tests And Validation

- [x] 4.1 Add view-model tests for add-then-remove during the same offline inspection and for validation when no local or loaded occurrence exists.
- [x] 4.2 Add SQLite service tests for occurrence JSON projection on add, update, remove, and resolve changes.
- [x] 4.3 Add sync tests covering add-then-remove payload order and local occurrence state after successful sync.
- [x] 4.4 Run `npm.cmd test`, `npx.cmd tsc --noEmit`, and focused lint for touched inspection files.
