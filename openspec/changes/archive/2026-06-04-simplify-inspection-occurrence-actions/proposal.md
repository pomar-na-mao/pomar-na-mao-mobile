## Why

The nearest-plant occurrence modal currently exposes four actions whose database effects overlap and make field usage harder to reason about. The inspection workflow should keep only the actions that represent the two business decisions needed in the field: add an occurrence or remove an occurrence.

## What Changes

- Remove `update_occurrence` and `resolve_occurrence` from the nearest-plant action dropdown and supported inspection change flow.
- Keep only `add_occurrence` and `remove_occurrence` as valid occurrence actions in the inspection UI, local changes, sync payload, and helper logic.
- Treat removal as the single non-add action that closes an occurrence for inspection purposes.
- Update tests so inspection behavior, local projection, and sync payloads only cover add/remove actions.
- Update `database-and-features-organization.md`, especially section `20.2`, so the database/functionality summary no longer documents update/resolve inspection actions.
- **BREAKING**: Any existing code, tests, or documentation that expects `update_occurrence` or `resolve_occurrence` in the inspection flow must be changed to use add/remove semantics.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `inspection-occurrence-editing`: The nearest plant modal and local validation must support only adding and removing occurrences.
- `inspection-local-state`: Local inspection change persistence must store only add/remove occurrence change types for inspection edits.
- `inspection-sync`: Sync payloads and RPC-facing inspection change semantics must contain only add/remove occurrence actions.

## Impact

- Affects `src/domain/models/inspection/inspection.model.ts` and related tests/types.
- Affects `src/ui/inspection/components/nearest-plant-modal/index.tsx` dropdown options and tests.
- Affects `src/ui/inspection/view-models/use-inspection.tsx` status/new-value mapping and validation paths.
- Affects `src/domain/models/inspection/occurrence-projection.ts` and SQLite service tests that currently handle update/resolve.
- Affects sync-related tests and may require corresponding SQL/RPC documentation updates in `database-and-features-organization.md` section `20.2`.
