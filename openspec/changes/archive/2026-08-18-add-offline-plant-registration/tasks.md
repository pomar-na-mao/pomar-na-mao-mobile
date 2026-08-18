## 1. Local Schema and Domain Foundations

- [x] 1.1 Add plant-registration domain types and validation schema for form values, local rows, list cards, sync payloads, results, and sync statuses.
- [x] 1.2 Extend `local_plants` initialization with migration-safe `remote_plant_id`, `synced_at`, and `record_origin` columns plus indexes for registration origin and synchronization queries.
- [x] 1.3 Update existing remote plant-cache/initial-sync writes to mark downloaded rows as `remote_cache` and preserve pending `local_registration` rows.
- [x] 1.4 Add a shared persistent device-id helper that reuses or generates one installation UUID and does not depend on the process session id.
- [x] 1.5 Add migration and helper tests proving upgrades preserve existing rows, local/remote identities stay distinct, and the device id survives app restarts.

## 2. SQLite Registration Lifecycle

- [x] 2.1 Implement a plant-registration SQLite service to create rows with generated `local_id`, save timestamps, required IDs/coordinates, default flags, null optional fields, and `pending_create` status.
- [x] 2.2 Implement SQLite queries to list only `local_registration` rows with variety/zone labels and to exclude ordinary remote-cache rows.
- [x] 2.3 Implement local-only deletion with confirmation-facing result semantics and no Supabase call.
- [x] 2.4 Implement atomic state transitions for `pending_create`/`error` to `syncing`, success reconciliation to `synced`, failure persistence to `error`, and startup recovery of stale `syncing` rows.
- [x] 2.5 Add a plant-registration repository/hook boundary over the SQLite and later Supabase services.
- [x] 2.6 Add unit tests for offline create, generated identities/defaults, timestamps, filtered listing, restart recovery, local-only deletion, and sync state transitions.

## 3. Navigation and Field-work Readiness

- [x] 3.1 Extend `FieldWorkCardId` and readiness resolution so plant registration depends on non-empty varieties and zones but not loaded plant snapshots.
- [x] 3.2 Reuse preloaded or persisted variety/zone snapshots on the plant-registration route without repeating route-mount Supabase requests.
- [x] 3.3 Add the themed plant-registration card to `src/app/field-works.tsx`, register `/plant-registration` in the router stack/types, and add its route/provider entrypoint.
- [x] 3.4 Update field-work tests for online, offline-cache, loading, unavailable, navigation, and independence from loaded plant snapshots.

## 4. Map Form and Registration List UI

- [x] 4.1 Implement the plant-registration provider/view-model for list loading, modal lifecycle, foreground location acquisition/retry, form validation, local save, deletion, and per-row synchronization state.
- [x] 4.2 Build the route screen with standardized back header, clear empty state, plant list, and a minimum-44px Add Plant action using the existing light/dark Terra Precision theme.
- [x] 4.3 Build the full-screen map-first modal with current-position marker, location loading/permission/error states, disabled labeled latitude/longitude controls, labeled variety and zone selectors, and the themed planting-date input.
- [x] 4.4 Ensure modal content is keyboard-safe and scrollable on narrow screens, uses at least 16px input text, displays field-level accessible errors, and disables Save during invalid or in-flight states.
- [x] 4.5 Build plant cards with variety, zone, planting date, coordinates, text/icon sync badge, concise sync error, and loading treatment without color-only communication.
- [x] 4.6 Add `ReanimatedSwipeable` actions with `renderLeftActions` for rightward local Delete and `renderRightActions` for leftward Synchronize, plus equivalent labeled non-gesture controls and themed delete confirmation.
- [x] 4.7 Add UI/view-model tests for empty/list states, GPS success/denial/retry, disabled coordinates, required validation, local Save, swipe directions, non-swipe alternatives, local-only delete, sync disablement, and accessible labels/touch targets.

## 5. Supabase Idempotent Plant Sync

- [x] 5.1 Inspect the deployed `plants`, `varieties`, and `zones` definitions, duplicate `(device_id, local_id)` data, current mobile role, RLS policies, grants, and existing functions before writing database SQL.
- [x] 5.2 Create a versioned Supabase migration with the non-null `(device_id, local_id)` unique identity and the complete validated `public.sync_new_plant(jsonb)` RPC using a fixed search path and retry-safe insert/reconciliation.
- [x] 5.3 Configure and test least-privilege execute/table permissions and RLS behavior for the actual authorized mobile roles, including explicit rejection of unauthorized callers.
- [x] 5.4 Implement the Supabase service payload mapping for coordinates, variety/zone IDs, planting date, stable identities, database-generated remote timestamps, fixed boolean flags, synced metadata, and nullable/default fields.
- [x] 5.5 Reconcile complete RPC results into SQLite, coalesce duplicate client attempts, and preserve retryable local error state for network, validation, reference, or incomplete-response failures.
- [x] 5.6 Add service and database contract tests for first insert, retry after commit, concurrent duplicate prevention, invalid/missing fields, unknown references, exact field mapping, returned identity, permission boundaries, and failure preservation.
- [x] 5.7 Generate remote creation/update timestamps at database synchronization time, omit local timestamps from the RPC payload, reconcile returned timestamps into SQLite, add an incremental migration, update documentation, and verify the deployed RPC.

## 6. Database Documentation

- [x] 6.1 Recheck `database.md` item 5 and update its `public.plants` identity/default explanation if needed to match the final migration and sync mapping.
- [x] 6.2 Update `database.md` item 18 with the full current `sync_new_plant` SQL contract, JSON payload, return shape, validation, idempotency, security mode, and grants.
- [x] 6.3 Update `database.md` item 20 with the plant-registration offline-first flow, evolved `local_plants` schema, local/remote identity mapping, statuses, delete scope, and retry behavior.
- [x] 6.4 Update `database.md` item 22 with the plant-registration tables, collected fields, local defaults, and synchronized fields.
- [x] 6.5 Update `database.md` item 24 so the teardown drops the plant-sync RPC before dependent database objects.
- [x] 6.6 Update `database.md` item 25 with the complete current uniqueness index, RPC, RLS/policy, explicit Data API grants, and execute permissions reflected by the migration.
- [x] 6.7 Compare the migration and all six requested documentation sections line by line so function signatures, index predicates, roles, payload fields, return fields, and SQL remain identical.

## 7. Verification

- [x] 7.1 Run focused Jest suites for domain validation, SQLite migration/service, readiness/navigation, view-model, modal/list UI, and Supabase mapping; fix all regressions.
- [x] 7.2 Run TypeScript, ESLint, and Prettier checks on the complete change and fix introduced errors.
- [x] 7.3 Verify the Supabase migration in a safe environment, run database advisors, and test authorized/unauthorized RPC calls plus duplicate retry behavior.
- [ ] 7.4 Manually verify on a device/emulator: online and offline entry, empty state, GPS permission paths, map/form save, process restart, both swipe directions, non-gesture actions, local-only delete, sync success/error/retry, and light/dark layouts at a narrow viewport.
