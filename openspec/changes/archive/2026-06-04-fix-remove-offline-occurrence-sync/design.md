## Context

The inspection flow is offline-first. Plants and their current occurrences are loaded into SQLite, field edits are saved as `local_inspection_changes`, and `sync_manual_inspection` later applies those changes to Supabase.

The current nearest plant edit path only searches `nearestPlant.occurrences` for an open occurrence before allowing update, remove, or resolve actions. That snapshot represents the occurrences loaded before the offline inspection started. It does not include an occurrence added earlier in the same inspection unless local loaded plant occurrence JSON is also updated to project pending changes. As a result, an add-then-remove sequence is blocked locally even though it is a valid offline edit intent.

After sync succeeds, the app marks the inspection and changes as synced and clears changed flags, but it does not update local loaded plant occurrence JSON to match the statuses now persisted in `plant_occurrences`. The next local inspection can therefore be started from stale plant occurrence state.

## Goals / Non-Goals

**Goals:**

- Let operators remove an occurrence that exists either in the original loaded plant snapshot or in pending local changes for the same plant and occurrence type.
- Keep all occurrence edit validation local and offline-capable.
- Persist a projected occurrence state in `local_inspection_loaded_plants.occurrences_json` whenever a local occurrence change is saved.
- Make the post-sync local plant occurrence state match the successfully applied add, update, remove, and resolve changes before a new inspection is created from the same plants.
- Preserve the existing `sync_manual_inspection` contract unless implementation proves it lacks enough status semantics for remove.

**Non-Goals:**

- Redesigning the inspection UI or nearest-plant selection.
- Adding network validation before saving local occurrence changes.
- Creating a full conflict-resolution system for concurrent server-side edits while the device is offline.
- Changing table schemas unless the current payload/status fields are insufficient during implementation.

## Decisions

1. Treat loaded occurrences plus pending local changes as the source of truth for local validation.

   The edit path should derive an effective occurrence for the nearest plant by applying that plant's local changes in order to the loaded occurrence list. Update, remove, and resolve actions can use this effective state as `previousValue`. Alternative considered: query Supabase before remove. That conflicts with offline inspection and would fail in the exact field scenario this workflow supports.

2. Project occurrence JSON immediately after every local change.

   `addInspectionChange` should update `local_inspection_loaded_plants.occurrences_json` in the same transaction as the change row and changed flag. Add/update actions keep or create an open occurrence with latest severity/notes; remove and resolve actions mark the matching occurrence as no longer open using the status expected by sync semantics. Alternative considered: keep only change rows and compute projection in the view-model. Centralizing projection in the SQLite service keeps restored inspections, sync payload building, and UI refreshes consistent.

3. Keep sync payload chronological and explicit.

   `buildSyncPayload` should continue sending each local change row in `changed_at` order, including `previousValue` and `newValue`. Remove actions must carry enough data for the RPC to update `plant_occurrences.status` rather than requiring an existing remote occurrence in the client snapshot. Alternative considered: collapse add-then-remove into no-op before sync. That would discard an intentional field operation history and could diverge from RPC audit behavior.

4. Refresh local plant occurrence state after successful sync before creating the follow-up inspection.

   After `sync_manual_inspection` succeeds, synced local loaded plants should no longer show removed/resolved occurrences as open. If the RPC result does not return full refreshed plant occurrence data, the app should use the same local projection that was already saved during editing. Alternative considered: reload inspection plants from Supabase after every sync. That would require network availability beyond the RPC success and can be scoped separately if stronger server reconciliation is needed later.

## Risks / Trade-offs

- RPC status naming mismatch -> Verify the `sync_manual_inspection` behavior for `remove_occurrence` and align projected local statuses with accepted remote statuses.
- Local projection hides concurrent server changes -> Accept for this offline-first bug; future server reconciliation can reload plants after sync when needed.
- Add-then-remove creates both local change rows -> Keep chronological audit semantics and let the RPC decide final remote status.
- Existing tests may mock only changed flags -> Update focused SQLite/view-model tests so occurrence JSON projection and post-sync state are covered.
