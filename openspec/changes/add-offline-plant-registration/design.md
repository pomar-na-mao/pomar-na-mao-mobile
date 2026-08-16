## Context

The field-work screen already preloads and persists `varieties` and `zones`, while the app has established patterns for GPS capture, map rendering, themed date input, SQLite services, Supabase services, and `ReanimatedSwipeable`. `local_plants` also exists, but it currently acts primarily as a cache of remote plants and lacks an explicit distinction between downloaded records and plants created on this device.

The remote contract in `database.md` item 5 defines `public.plants`: coordinates are required, `variety_id` and `zone_id` are foreign keys, `planting_date` is `timestamptz`, identity/sync metadata is available, and `location` is generated from longitude and latitude. The feature spans navigation, UI, local persistence, location permissions, and a retry-safe remote write. The mobile app can operate without a current authenticated user in some flows, so implementation must inspect the deployed role, grants, and RLS before choosing the final function permissions.

The UI follows the existing Terra Precision theme. The `ui-ux-pro-max` guidance adds explicit requirements for 44x44 minimum touch targets, readable 16px form text, visible labels and focus/error state, non-color-only status communication, reduced-motion compatibility, and a non-swipe alternative for every card action.

## Goals / Non-Goals

**Goals:**

- Register a plant entirely offline from the device's current coordinates.
- Keep SQLite as the source of truth until the individual plant synchronizes successfully.
- Reuse cached varieties and zones so registration remains available offline after preload.
- Make synchronization idempotent across timeouts, retries, and app restarts.
- Preserve a stable local identity while storing the remote Supabase plant id separately.
- Provide an accessible map/form and list experience with unambiguous pending, syncing, synced, and error states.
- Keep `database.md` items 5, 18, 20, 22, 24, and 25 consistent with the implemented database contract.

**Non-Goals:**

- Editing an existing plant after local save.
- Deleting a synchronized plant from Supabase; the delete gesture removes only the local registration card.
- Bulk plant registration or automatic background synchronization.
- Downloading all remote plants into the registration list.
- Inferring zone from polygon geometry or variety from other plant attributes.
- Changing the generated `plants.location` expression or the referenced `varieties` and `zones` schemas.

## Decisions

1. Add a dedicated `/plant-registration` route and feature module.

   The field-work card navigates to a route containing only locally registered plant cards. The route uses a provider/view-model and focused components under `src/ui/plant-registration`, with domain models and SQLite/Supabase services under the existing layer conventions. A mode inside inspection was considered, but registration has a different lifecycle and must not depend on loaded plant snapshots.

2. Extend `local_plants` while preserving local and remote identity separately.

   Add migration-safe columns such as `remote_plant_id`, `synced_at`, and `record_origin`, with `record_origin = 'local_registration'` for this flow and `'remote_cache'` for downloaded plants. A locally created row keeps `id` and `local_id` equal to its generated local UUID for its entire lifetime; synchronization writes the returned Supabase UUID into `remote_plant_id` instead of rewriting the SQLite primary key. The registration list filters by `record_origin = 'local_registration'`, so it starts empty even when ordinary remote plant cache rows exist. A dedicated registration table was considered, but `local_plants` already contains the complete plant shape and is the documented local counterpart of `plants`; explicit origin and remote mapping avoid duplication while preserving ownership.

3. Generate durable offline identity at local save time.

   Generate `local_id` with `expo-crypto.randomUUID()`. Use a shared app-scoped device-id helper backed by persistent storage: reuse an existing stored installation identifier or generate and persist a UUID once. Do not use a session identifier as the primary `device_id`, because it changes across app processes and would defeat retry idempotency. Local `created_at` and `updated_at` are the same ISO timestamp captured when Save commits; `sync_status = 'pending_create'`, `is_dead = 0`, `non_existent = 0`, and `is_new = 1`. Nullable fields not collected by the form remain null and database defaults remain authoritative where applicable.

4. Use a map-first full-screen modal with a scrollable form sheet.

   Pressing “Adicionar planta” opens a modal with a map region centered on the current foreground location, a user marker, and a form surface that remains usable with the keyboard and small screens. Latitude and longitude are labeled, read-only/disabled values; variety and zone are labeled selectors; planting date uses the existing themed date picker. Save is disabled while location is unresolved, a submission is running, or required values are invalid. Permission denial and acquisition failure show specific messages and a retry action. The modal does not silently save stale coordinates. A compact bottom sheet was considered, but a full-screen modal gives the map and form enough space at 375px widths and supports accessibility/keyboard layout more reliably.

5. Make gestures progressive enhancement, not the only control.

   Each card uses `ReanimatedSwipeable`: finger movement to the right reveals the destructive local Delete action (`renderLeftActions`), and movement to the left reveals Synchronize (`renderRightActions`). The card also exposes labeled 44x44 action buttons or an accessible action menu with the same operations for screen readers, keyboard users, and users who cannot perform gestures. Delete requires themed confirmation, closes the swipeable, and removes only the SQLite row. Synchronize is disabled for an already synced/in-flight card; Delete remains local-only for every state. Status text and icon accompany color-coded badges.

6. Synchronize through an idempotent RPC keyed by device and local identity.

   Add a migration-created unique partial index on `public.plants (device_id, local_id)` when both values are non-null and a `public.sync_new_plant(jsonb)` RPC. The payload carries `localId`, `deviceId`, latitude, longitude, `varietyId`, `zoneId`, and planting date. The RPC validates required values and referenced variety/zone records, inserts or reconciles the same plant under the unique key, and returns at least `plant_id`, `created_at`, `updated_at`, and `synced_at`. The database generates those remote timestamps when synchronization runs; local save timestamps are not copied into `public.plants`. It writes `is_dead = false`, `non_existent = false`, `is_new = true`, `sync_status = 'synced'`, and leaves other optional fields null/default. Retries preserve the first remote `created_at`, update `updated_at`/`synced_at`, and reconcile the same row rather than creating another. SQLite replaces its local timestamps with the returned remote values after success.

   The RPC will use a fixed search path and the least privilege compatible with the deployed mobile role. Implementation must inspect existing RLS and Data API grants, then explicitly grant only the needed execute/table privileges. If `security definer` is necessary for the unauthenticated mobile flow, it must validate its complete input, expose only this operation, revoke `public` execution, and grant execution only to the intended roles. Direct client inserts and a blind upsert were considered; the RPC gives one validated contract and makes partial-index conflict handling and returned identity deterministic.

7. Preserve retryable local state around remote writes.

   Before the RPC call, atomically mark the row `syncing`; on success, atomically store `remote_plant_id`, remote/sync timestamps, clear `sync_error`, and mark `synced`. On failure or an incomplete response, retain the row, store a safe error message, and mark `error`. Startup normalizes stale `syncing` rows back to a retryable state. Concurrent taps for the same local row are coalesced/disabled, while the server identity guarantee protects against transport uncertainty.

8. Update every requested `database.md` section and version the actual SQL.

   Item 18 documents the complete RPC signature, payload, return type, idempotency, validation, security mode, and grants. Item 20 adds the offline plant-registration flow and the evolved SQLite schema. Item 22 summarizes fields collected and synchronized. Item 24 drops the new function before tables/index ownership is removed. Item 25 creates the index, function, policies/grants, and comments in the consolidated setup. Item 5 is checked and clarified for the identity/flags contract if needed. The executable Supabase change is created as a versioned migration; documentation is not treated as the migration itself.

## Risks / Trade-offs

- [GPS permission is denied or no fix is available] → Keep Save disabled, explain the problem near the map, and provide retry/back actions without fabricating coordinates.
- [Cached variety or zone options are stale] → Preserve selected IDs locally, validate references in the RPC, show the server error on the card, and refresh structural options when online.
- [A timeout occurs after the server commits] → Retry with the same `(device_id, local_id)` and reconcile the existing remote row through the unique identity.
- [Existing remote data contains duplicate non-null identity pairs] → Audit duplicates before adding the unique index; stop the migration for explicit remediation rather than discarding rows.
- [Downloaded plants are mixed with registrations] → Filter using `record_origin` and ensure initial-sync writes use `remote_cache` without overwriting unsynced local-registration rows.
- [A synchronized card is deleted locally] → Clearly label confirmation as local-only; the Supabase record remains authoritative and recoverable through normal plant data refresh.
- [An elevated RPC broadens write access] → Prefer invoker rights; if definer rights are required, use a fixed search path, strict validation, explicit grants, and tests against unauthorized operations.
- [Swipe direction is interpreted inconsistently by libraries] → Tests assert the exposed action side using `renderLeftActions` for rightward Delete and `renderRightActions` for leftward Synchronize, and visible action labels remove ambiguity.

## Migration Plan

1. Add migration-safe SQLite columns through `ensureColumn`, indexes for registration origin/sync status, the stable device-id helper, and tests before enabling the route.
2. Add domain/services/repository/view-model/UI and field-work readiness/navigation changes behind the new card.
3. Audit deployed `plants` duplicates, RLS, grants, and current mobile role; add the versioned Supabase migration for the unique identity and RPC.
4. Update `database.md` items 5, 18, 20, 22, 24, and 25 to match the final executable contract.
5. Verify local save offline, app restart, local-only delete, successful sync, failure/retry, timeout retry, dark/light mode, denied location permission, and screen-reader/action alternatives.

Rollback removes the card/route and RPC execute grants first. The RPC and unique index can then be dropped with a forward rollback migration if required. Added SQLite columns remain harmless and should not be destructively removed; local pending rows remain recoverable. Remote plants already synchronized are not automatically deleted during rollback.

## Open Questions

- Confirm during implementation whether the deployed mobile client acts as `anon`, `authenticated`, or both so the migration can use the narrowest correct RPC/RLS grants.
- Confirm whether product language should name the field-work card “Adicionar planta” or “Cadastro de plantas”; the route and capability remain unchanged.
