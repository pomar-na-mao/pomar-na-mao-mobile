## Why

The inspection feature now owns offline-first state, nearest-plant detection, local persistence, Supabase synchronization, and several user-facing components. Unit tests are needed to protect this workflow before additional refactors or dashboard-oriented changes increase the risk of regressions.

## What Changes

- Add focused unit tests for all inspection feature files under `src/ui/inspection`, `src/data/repositories/inspection`, `src/data/services/inspection`, and `src/domain/models/inspection`.
- Cover pure helpers, repository normalization, Supabase service calls, SQLite service behavior, provider/view-model flows, and React Native components.
- Add mocks or test seams only where needed to isolate Expo Location, SQLite, Supabase, global stores, native map components, and device constants.
- Keep production behavior unchanged; tests should validate the current MVVM inspection flow instead of redesigning it.
- Document any intentionally skipped file or behavior if a file cannot be tested directly without a larger architectural change.

## Capabilities

### New Capabilities

- `inspection-feature-unit-tests`: Defines the required unit test coverage for inspection feature helpers, services, repository, view-model/provider, and UI components.

### Modified Capabilities

- None.

## Impact

- Affected test files:
  - New `*.test.ts` and `*.test.tsx` files near inspection feature code or under `src/test`.
  - Shared test mocks/utilities may be added under `src/test` when reuse is justified.
- Affected source files:
  - Inspection source files should only change if a narrow export or dependency seam is required for testability.
- No database schema, Supabase schema, route behavior, or production UI behavior should change.
