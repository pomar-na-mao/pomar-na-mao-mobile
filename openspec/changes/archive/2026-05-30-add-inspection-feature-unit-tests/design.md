## Context

The project already has a Jest, `jest-expo`, React Native Testing Library, and MSW setup. The inspection feature now spans MVVM layers:

- UI components and provider/view-model under `src/ui/inspection`.
- Pure helper logic for device id, list formatting, nearest plant selection, and simulation routes.
- Data access through `src/data/repositories/inspection` and `src/data/services/inspection`.
- Type contracts in `src/domain/models/inspection`.

The goal is not to add broad snapshot tests. The test suite should protect behavior that matters in the field: loading filter data, starting an offline inspection, identifying the nearest plant, saving local changes, finishing and syncing an inspection, and rendering the expected controls and states.

## Goals / Non-Goals

**Goals:**

- Add unit tests for every direct inspection feature source file.
- Validate pure helpers with deterministic inputs.
- Validate repository transformations and Supabase service calls without real network access.
- Validate SQLite service SQL behavior with mocked database methods or a reusable SQLite test harness.
- Validate `InspectionProvider` behavior through a test consumer component and mocked dependencies.
- Validate UI components with React Native Testing Library by asserting rendered output and user-visible behavior.
- Keep mocks reusable where several inspection tests need the same Supabase, SQLite, Expo Location, store, or map behavior.

**Non-Goals:**

- Do not add E2E tests or require a simulator/device.
- Do not connect to a real Supabase project.
- Do not change database schema or Supabase RPC contracts.
- Do not rewrite inspection architecture for testability beyond narrow exports or dependency seams.
- Do not require 100% branch coverage if a branch is native-only or already covered through a higher-level provider test.

## Decisions

1. Prefer colocated tests for feature behavior.

   Tests should live near the inspected file when that keeps intent clear, for example `nearest-plant.test.ts` beside `nearest-plant.ts` or component tests beside component directories. Shared mocks and render helpers should remain under `src/test` when reuse prevents duplication.

2. Test MVVM layers at their natural boundary.

   Helpers should be tested as pure functions. Repository tests should mock `inspectionSupabaseService` and assert normalized domain output. Supabase service tests should mock the `supabase` client chain and assert table/RPC names and parameters. SQLite service tests should mock `useSQLiteContext` and assert SQL calls, transactions, returned rows, payload construction, and state transitions.

3. Test `InspectionProvider` through public context behavior.

   A small test consumer should call `useInspection()` and expose buttons/text for assertions. This avoids coupling tests to internal refs and state setters while still covering filter application, location updates, occurrence saving, finishing, syncing, modal state, and alert/loading side effects.

4. Keep component tests behavior-focused.

   Component tests should assert visible labels, disabled/empty/loading-like states, button callbacks, modal opening/closing, list rendering, and important map/simulation props through existing Jest mocks. Avoid large snapshots because the inspection UI is likely to evolve.

5. Use MSW only for fetch-level behavior.

   The current Supabase service uses the Supabase client API directly. For these files, module mocks are more precise than MSW. MSW remains available for future service tests that call `fetch` directly.

## Risks / Trade-offs

- [Risk] Some files are type-only or barrel exports and have no runtime behavior. -> Mitigation: cover them through import/type smoke tests or document them as no-runtime files in the task checklist.
- [Risk] Provider tests can become brittle if they assert internal state too closely. -> Mitigation: assert context outputs and user-visible effects only.
- [Risk] SQLite SQL assertions can be noisy. -> Mitigation: assert important statements and parameters, not every whitespace detail.
- [Risk] Components depending on maps or native modules can fail in Jest. -> Mitigation: reuse the existing `jest.setup.ts` mocks and add only targeted mocks when a component requires one.
- [Risk] Full feature coverage may reveal testability gaps in private helper functions. -> Mitigation: prefer testing through exported behavior; export internal helpers only when they are stable enough to be treated as unit-level behavior.
