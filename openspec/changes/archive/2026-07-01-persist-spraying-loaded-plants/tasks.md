## 1. Loaded Zone Persistence

- [x] 1.1 Add a spraying-local helper that persists, reads, and clears the last loaded zone identity.
- [x] 1.2 Persist the selected zone identity whenever `loadZone` successfully loads cached or remote plants.
- [x] 1.3 Restore the persisted loaded zone and cached SQLite plants during spraying provider startup when no recoverable aggregate exists.
- [x] 1.4 Ignore or clear a persisted loaded zone when its cached plant list is empty.

## 2. Delete and Replacement Behavior

- [x] 2.1 Allow the spraying screen delete action when either an active aggregate exists or idle loaded plants exist.
- [x] 2.2 Clear the persisted loaded zone and in-memory selected plants when the user confirms deletion.
- [x] 2.3 Preserve active aggregate recovery precedence over restored idle loaded-zone state.
- [x] 2.4 Ensure loading a different zone replaces the persisted loaded-zone identity.

## 3. Tests and Verification

- [x] 3.1 Add unit tests for the loaded-zone persistence helper.
- [x] 3.2 Extend spraying provider/view-model tests for restart restoration, empty-cache handling, replacement, and deletion.
- [x] 3.3 Extend spraying screen tests so the delete action is available for idle loaded plants and keeps existing aggregate deletion behavior.
- [x] 3.4 Run focused spraying tests for provider, screen, and persistence helper.
- [x] 3.5 Run TypeScript validation and lint for touched files.
