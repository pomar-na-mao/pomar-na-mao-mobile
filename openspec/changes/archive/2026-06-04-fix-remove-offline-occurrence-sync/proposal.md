## Why

During inspection, adding an occurrence can be finalized and synchronized, but trying to remove that same occurrence while offline is blocked by a local validation that only accepts occurrences already present in the loaded plant snapshot. This prevents the operator from recording the intended removal and also leaves the local plant status stale after synchronization.

## What Changes

- Allow a remove occurrence action to be saved locally when the selected occurrence was added or updated earlier in the same offline inspection, even when it is not present in the original loaded occurrence list.
- For remove, resolve, and update actions, derive the previous occurrence from local offline changes when the loaded plant snapshot does not contain an open occurrence.
- Ensure synchronization updates `plant_occurrences` status remotely according to the remove action and refreshes local loaded plant occurrence state from the sync result or local mutation after successful sync.
- Keep inspection work offline-first: do not block removal with network-dependent or server-only validation before sync.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `inspection-occurrence-editing`: Occurrence edit validation must account for offline local changes on the nearest plant, especially removal of an occurrence created during the same inspection.
- `inspection-local-state`: Local inspection state must reflect pending occurrence additions, updates, removals, and resolved states consistently while offline and after sync.
- `inspection-sync`: Successful sync must update local plant occurrence state so the synced inspection no longer shows stale occurrence status.

## Impact

- Affects `src/ui/inspection/view-models/use-inspection.tsx` validation and local state refresh behavior.
- Affects inspection SQLite service methods that save occurrence changes, build sync payloads, clear changed state, and refresh loaded plants.
- May affect repository/RPC payload mapping for `sync_manual_inspection` if remove actions need explicit status semantics for `plant_occurrences`.
- Requires focused unit coverage for offline add-then-remove, remove without original occurrence snapshot, sync payload content, and local state after successful sync.
