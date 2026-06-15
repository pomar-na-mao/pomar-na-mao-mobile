## 1. Feature Foundation

- [x] 1.1 Add spraying domain models for operation lifecycle, setup, inputs, track points, routes, candidate/confirmed plants, summaries, and sync payload/result.
- [x] 1.2 Add spraying module boundaries under `src/ui/spraying`, `src/data/repositories/spraying`, `src/data/services/spraying`, and background-task/helpers locations consistent with the current architecture.
- [x] 1.3 Add unit fixtures and test database mocks for spraying aggregates and lifecycle states.

## 2. SQLite Persistence

- [x] 2.1 Add idempotent SQLite initialization for `local_spraying_operations`, including lifecycle, 3.5/4.0 meter band, remote mapping, and sync error fields.
- [x] 2.2 Add idempotent SQLite initialization and indexes for `local_spraying_track_points` and `local_spraying_routes`.
- [x] 2.3 Add idempotent SQLite initialization and indexes for `local_spraying_inputs`, `local_spraying_candidate_plants`, and `local_spraying_confirmed_plants`.
- [x] 2.4 Implement SQLite service transactions for creating/updating operations, replacing setup inputs, appending accepted points, finishing, and loading an interrupted active operation.
- [x] 2.5 Implement SQLite service transactions for route consolidation, simulation candidate upsert, persisted manual overrides, review confirmation, and summary counts.
- [x] 2.6 Implement repository mappings between SQLite rows and spraying domain models.
- [x] 2.7 Add SQLite/repository tests for schema use, lifecycle persistence, aggregate reload, override preservation, and rollback on transaction failure.

## 3. Route Geometry and Simulation

- [x] 3.1 Implement GPS point validation, stale/accuracy filtering, and near-duplicate suppression as pure testable helpers.
- [x] 3.2 Implement chronological GeoJSON `LineString` consolidation and route distance calculation using `[longitude, latitude]`.
- [x] 3.3 Implement shortest geodesic plant-to-route-segment distance with nearest track/segment context.
- [x] 3.4 Implement bounding-box prefiltering and inclusive configurable lateral-band classification defaulting to 3.5-4.0 meters.
- [x] 3.5 Add boundary, sparse-route, coordinate-order, invalid-point, and performance-oriented simulation unit tests.

## 4. Background GPS Tracking

- [x] 4.1 Define the module-scope Expo TaskManager spraying task and a durable active-operation lookup that works without mounted React UI.
- [x] 4.2 Implement foreground/background permission checks and start/stop/reconcile services using `expo-location`.
- [x] 4.3 Persist every accepted background point directly to SQLite with operation identity, timestamp, accuracy, speed, device ID, and pending sync state.
- [x] 4.4 Update Expo native configuration for Android foreground/background location service permissions and iOS location background mode.
- [x] 4.5 Implement startup/screen recovery for an operation marked `tracking`, including mismatch handling when the native task is not active.
- [x] 4.6 Add tests for permission denial, task start/stop, background persistence, rejected points, and interrupted-operation reconciliation.

## 5. Spraying UI and Lifecycle

- [x] 5.1 Add `src/app/spraying.tsx`, register it in the root stack, and add a spraying card to field-work navigation while keeping `/add-plant` retired.
- [x] 5.2 Build the spraying provider/view-model to load local state and enforce valid lifecycle transitions and action availability.
- [x] 5.3 Build the map-first spraying screen with current location, zone plants, live persisted route, operation summary, and lifecycle actions.
- [x] 5.4 Build the setup modal for zone, operator, machine/tractor, notes, treatment band, and one-or-more applied inputs with validation.
- [x] 5.5 Build the simulation/review UI that distinguishes untreated, automatic candidate, confirmed, removed, and manually added plants.
- [x] 5.6 Persist review actions immediately and make repeated simulation preserve explicit manual overrides.
- [x] 5.7 Add route, setup validation, lifecycle, map state, simulation review, reload, and navigation tests.
- [x] 5.8 Separate zone plant loading from operation setup, enable start only after zone loading, and begin GPS capture immediately after setup confirmation.
- [x] 5.9 Match the inspection filter action bar and add confirmed deletion of the complete active local spraying aggregate.
- [x] 5.10 Render spraying plants with the same shared circular map marker style used by inspection.
- [x] 5.11 Add a DEV-only spraying route simulator that records persisted points from P1 to P2.

## 6. Supabase Contract and Migration

- [x] 6.1 Review the current Supabase changelog and official function/RLS documentation relevant to RPC, grants, and exposed schemas before database implementation.
- [x] 6.2 Use Supabase MCP to inspect deployed spraying tables, constraints, RLS policies, grants, `recalculate_operation_affected_plants`, and any existing `sync_reviewed_spraying_operation`.
- [x] 6.3 Define and test the final JSON request/response contract for an idempotent reviewed spraying sync, including stable local/device identity and remote child mappings/counts.
- [x] 6.4 Implement or revise `sync_reviewed_spraying_operation` so operation, ordered points, route, inputs, and exactly the confirmed plant set are validated and committed atomically.
- [x] 6.5 Add the minimum uniqueness constraints/indexes required to prevent duplicate operations, points, routes, inputs, and plant history during retries.
- [x] 6.6 Review and implement RPC execution grants, RLS-compatible access, locked `search_path`, caller/input validation, and removal of unintended public execution.
- [x] 6.7 Run Supabase advisors, generate the project migration using the installed CLI workflow, and verify migration history.
- [x] 6.8 Execute database integration tests for valid sync, invalid-child rollback, duplicate retry, manual add/remove preservation, and unauthorized execution.

## 7. Mobile Synchronization

- [x] 7.1 Implement spraying Supabase service payload mapping and call the verified reviewed spraying RPC.
- [x] 7.2 Implement repository synchronization gating so only `reviewed` or retryable `sync_error` operations can be submitted.
- [x] 7.3 Store all returned remote identifiers and synchronized statuses in one SQLite transaction after RPC success.
- [x] 7.4 Preserve the complete reviewed aggregate and record retryable error details after network or RPC failure.
- [x] 7.5 Refresh the relevant local field operation, route, input, and plant history caches after successful synchronization where the current sync architecture supports them.
- [x] 7.6 Add tests for RPC name/shape, chronological points, exact confirmed set, success mapping, unknown network outcome, retry idempotency, and failure preservation.

## 8. Specifications and Documentation

- [x] 8.1 Update `database.md` item 20.4 with the implemented local schema, 3.5-4.0 meter band algorithm, reviewed payload/response, idempotency, and synchronization order.
- [x] 8.2 Document every changed Supabase function, constraint/index, policy, grant, and permission with its migration and implementation details.
- [x] 8.3 Resolve the missing `database-and-features-organization.md` target required by `openspec/config.yaml` by creating/updating the canonical document or correcting the rule consistently, then record the spraying implementation there.
- [x] 8.4 Update any feature inventory or architecture documentation that still describes `/spraying` as retired.

## 9. Verification

- [x] 9.1 Run TypeScript validation and fix errors introduced by spraying modules and route typing.
- [x] 9.2 Run focused Jest suites for SQLite, geometry, background tracking, view-model, components, navigation, and synchronization.
- [x] 9.3 Run ESLint and Prettier checks on all changed files.
- [ ] 9.4 Verify `/spraying` on Android and iOS development builds using physical devices: setup, foreground tracking, screen-closed tracking, finish, simulation, manual review, sync success, and retry after failure.
- [ ] 9.5 Verify recovery after app restart or task interruption and confirm that no local route/review data is lost.
