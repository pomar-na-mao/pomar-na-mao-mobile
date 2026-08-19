## 1. Local Operation Invariants

- [x] 1.1 Replace the broad recoverable-operation lookup with an in-progress lookup limited to `draft` and `tracking`, preserving deterministic recovery of the most recently updated legacy record.
- [x] 1.2 Add a transactional guard to local operation creation so an existing `draft` or `tracking` operation prevents insertion of another in-progress cycle without deleting any local data.
- [x] 1.3 Extend SQLite service tests to prove completed unsynchronized operations are ignored by active-cycle recovery, remain independently queryable, and do not block a later operation while concurrent in-progress creation is rejected.

## 2. Spraying View-Model Flow

- [x] 2.1 Update provider initialization and new-operation navigation to resume an existing `draft` or `tracking` operation, or clear the aggregate and restore loaded-zone setup when only completed operations exist.
- [x] 2.2 Ensure finishing an operation releases the active-cycle state while retaining its aggregate data in the operation list, so the next setup creates a distinct local identity before synchronization.
- [x] 2.3 Keep review, synchronization, deletion, aggregate clearing, and GPS reconciliation scoped to the targeted operation ID when other completed or in-progress operations coexist.
- [x] 2.4 Add view-model tests for finish-then-start-offline, restart with completed pending operations, recovery of an in-progress operation, and synchronization of an older operation without disturbing a newer active cycle.

## 3. Spraying List Action

- [x] 3.1 Add a themed textual “Iniciar Nova Pulverização” CTA for non-empty lists, using the existing icon system, a minimum 44-by-44-point touch target, and an explicit accessibility label while retaining the contextual empty-state CTA.
- [x] 3.2 Update list-screen tests to verify the CTA is present with pending operations, delegates to new-operation navigation without an operation ID, remains separate from card actions, and preserves empty-state behavior.

## 4. Verification

- [x] 4.1 Run the focused spraying SQLite service, view-model, and list-screen test suites and fix any regressions.
- [x] 4.2 Run project type checking and linting, then manually verify that multiple completed offline operations remain listed and a new spraying can start without synchronizing them.

## 5. Zone Choice for Consecutive Operations

- [x] 5.1 Route the idle “Iniciar” action through the existing loaded-zone selector, preserving the restored zone as the default and opening setup only after a successful zone load.
- [x] 5.2 Keep ordinary zone loading and cancellation behavior independent from the start flow, and add provider/screen tests for choosing another loaded zone before the next operation.
- [x] 5.3 Run the focused spraying tests, type checking, linting, and strict OpenSpec validation for the extended flow.

## 6. Persistent List Footer Action

- [x] 6.1 Replace the header and empty-state CTAs with one themed footer action rendered below the scrollable list in both states, preserving accessibility and a 48-point touch target.
- [x] 6.2 Update list-screen tests to verify the footer action is always present for empty and non-empty lists and delegates without an operation ID.
- [x] 6.3 Run focused tests, type checking, linting, and strict OpenSpec validation for the persistent action.
