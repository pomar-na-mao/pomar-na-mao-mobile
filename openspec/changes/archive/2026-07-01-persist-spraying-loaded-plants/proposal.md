## Why

After the user loads plants for a zone on the spraying screen, closing and
reopening the app clears the loaded plants from the map even though the plant
rows are already cached locally. This forces the user to reload the zone and
breaks the expected local continuity of the spraying workflow.

## What Changes

- Persist the identity of the currently loaded spraying zone locally.
- On spraying screen startup, restore the selected zone and its cached plants
  from local storage/SQLite when no active operation is being recovered.
- Keep loaded plants visible across app restarts, screen unmounts, and app
  reopen flows.
- Clear the persisted loaded-zone state only when the user explicitly deletes
  the local spraying state or replaces it by loading another zone.
- Preserve existing operation, tracking, simulation, review, and sync behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `spraying-screen-route`: Loaded zone plants must survive app restart and only
  be cleared by explicit user deletion or replacement.
- `spraying-local-review`: Local spraying plant cache behavior must support
  restoring the previously loaded zone for offline map display and simulation.

## Impact

- Affected state: spraying selected zone and selected zone plants.
- Affected local persistence: existing local plant cache plus a small persisted
  selected-zone identity.
- Affected UI: spraying screen startup, loaded-zone summary, delete behavior.
- Affected tests: spraying view-model/provider and screen tests.
- No Supabase, remote database, RPC, or API contract changes.
