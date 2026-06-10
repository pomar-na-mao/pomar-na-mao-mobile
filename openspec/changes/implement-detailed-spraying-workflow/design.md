## Context

The app is an Expo Router React Native application using TypeScript, `expo-sqlite`, `expo-location`, `expo-task-manager`, React Native Maps, and Supabase. Inspection and annotation already establish a route/provider/view-model/repository/service pattern, but spraying was intentionally removed and no active spraying modules remain.

Item 20.4 of `database.md` requires a map-first, offline-first workflow that captures GPS with the screen closed, stores every point locally, simulates plants affected by the route, permits manual review, and synchronizes the reviewed result. The existing SQLite foundation has shared operation and plant caches but none of the six spraying-specific tables. The database document mentions `recalculate_operation_affected_plants`, while the consolidated teardown references `sync_reviewed_spraying_operation` without defining its final contract. Implementation therefore must inspect the deployed Supabase schema/functions before changing them.

## Goals / Non-Goals

**Goals:**

- Implement `/spraying` as a new feature consistent with current MVVM and data-layer boundaries.
- Keep SQLite as the source of truth from draft creation through successful synchronization.
- Capture GPS durably in foreground and background and recover an interrupted active operation.
- Simulate candidates locally using reviewed route geometry and make manual review authoritative.
- Synchronize the complete reviewed aggregate atomically and idempotently through one RPC.
- Document the actual SQLite, RPC, migration, permission, and payload contracts.

**Non-Goals:**

- Do not restore deleted legacy spraying code wholesale.
- Do not implement fertilization, harvest, route history browsing, or desktop administration.
- Do not automatically synchronize an unreviewed route.
- Do not let server-side distance recalculation overwrite user-confirmed plant selections.
- Do not redesign inspection or annotation beyond navigation changes required to expose spraying.

## Decisions

1. Model spraying as a feature aggregate with explicit lifecycle.

   A spraying operation owns setup data, inputs, points, route, simulation candidates, and confirmed plants. The provider/view-model enforces `draft -> tracking -> finished -> simulated -> reviewed -> syncing -> synced|sync_error`; repositories enforce persistence invariants. This prevents invalid actions such as changing zones during tracking or syncing before review. Alternative considered: derive state from nullable timestamps and row counts. That is simpler initially but produces ambiguous recovery and action rules.

2. Use the six item 20.4 SQLite tables, with additive schema evolution.

   Add `local_spraying_operations`, `local_spraying_track_points`, `local_spraying_routes`, `local_spraying_inputs`, `local_spraying_candidate_plants`, and `local_spraying_confirmed_plants` plus indexes. Add `min_distance_meters` to the documented operation shape alongside `max_distance_meters`, defaulting to `3.5` and `4.0`, because a maximum-only radius does not represent the stated lateral band. Initialization remains idempotent and uses column guards for future upgrades. Alternative considered: place everything in `local_field_operations` and JSON columns. Dedicated normalized tables support background writes, review queries, retries, and child-level remote ID mapping without rewriting shared structural contracts.

3. Register one module-scope background task and persist points directly.

   Define the Expo TaskManager task outside React components. Before tracking, request foreground then background permission and persist the active operation identity so the task can resolve it without mounted UI. Each accepted location is inserted into SQLite first; UI subscribes/polls for persisted changes and never acts as the sole owner of track data. Platform app configuration must declare required Android foreground/background location service permissions and iOS location background mode. Alternative considered: component `watchPositionAsync` only. It cannot satisfy screen-closed tracking and loses data when the component unmounts.

4. Apply explicit GPS acceptance and recovery rules.

   Reject malformed coordinates, stale samples, and samples above a configurable accuracy ceiling; avoid exact/near duplicate points that add no route value. On startup, reconcile operations marked `tracking` with `Location.hasStartedLocationUpdatesAsync`: restore if active, otherwise expose a recovery action instead of silently changing status. Finish stops the task first, persists `finished_at`, then consolidates the route. Alternative considered: accept every platform sample. That inflates SQLite and creates geometry spikes that distort plant distance.

5. Consolidate route and simulate plants locally from the polyline.

   Build a chronological GeoJSON `LineString` with `[longitude, latitude]`, calculate total segment distance, and persist it after at least two valid points. For each zone plant, calculate the shortest point-to-segment geodesic distance, not merely distance to sampled vertices. A plant becomes an automatic candidate when the shortest distance is within the inclusive configurable band, default `3.5 <= d <= 4.0` meters. The helper must return nearest segment/point context and be unit tested around boundaries, sparse tracks, and coordinate order. Alternative considered: compare plants only to recorded points. Sparse GPS sampling can miss plants beside the path.

6. Persist manual review separately from repeatable simulation.

   Candidate rows contain calculated evidence and review status; confirmed rows are the synchronization source. Manual removals and additions persist as overrides and survive reopening or rerunning simulation. Re-simulation updates automatic evidence but does not erase explicit user decisions. Alternative considered: toggle a boolean on candidates only. That cannot cleanly represent manually added plants outside the candidate set or preserve provenance.

7. Use a transactional, idempotent spraying sync RPC.

   The mobile service sends one JSON payload containing operation metadata, ordered points, route GeoJSON/distance, inputs, and confirmed plants. The final RPC, expected to be `sync_reviewed_spraying_operation`, validates `spraying`, resolves the operation type, upserts by stable `(device_id, local_id)` identity, replaces/upserts children deterministically, and writes only confirmed `plant_operation_history` rows with preserved `match_source`. It returns the remote operation ID, child ID mappings or sufficient identifiers, and counts. Any failure rolls back the transaction.

   Implementation must first inspect deployed tables, constraints, functions, grants, and RLS. If remote tables lack uniqueness needed for idempotency, add the smallest compatible unique indexes/constraints in a generated Supabase migration. Do not expose a service-role key in the app. RPC execution permission must be limited to the intended authenticated role, and table RLS/grants must remain compatible with the access model. The existing `recalculate_operation_affected_plants` may remain an administrative/recalculation tool but is not used to overwrite reviewed mobile selections. Alternative considered: five client-side write sequences. That risks partial operations, duplicate retries, and wider table permissions.

8. Keep local status transition atomic around sync results.

   Set the operation to `syncing` before the request without discarding `reviewed` data. On success, update operation and all child remote IDs/statuses in one SQLite transaction. On failure, restore a retryable `sync_error` state and preserve the complete aggregate. Stable local IDs make an unknown network outcome safe to retry. Alternative considered: mark each child synced as responses arrive. A single RPC has one aggregate outcome, so partial local success markers would be misleading.

9. Update both database documentation targets deliberately.

   Update `database.md` item 20.4 to replace the maximum-only 3 m examples with the implemented 3.5-4.0 m band, define the reviewed sync payload/response and authoritative confirmed set, and record migrations/security details. `openspec/config.yaml` requires `database-and-features-organization.md`, but that file is absent; implementation must either create the canonical file with the relevant feature/database organization content or update the project rule and documentation naming consistently rather than silently skipping it.

## Risks / Trade-offs

- [Risk] Background tracking behavior differs between Android, iOS, Expo Go, and development builds. -> Mitigation: configure native permissions/background modes, test on development builds and physical devices, and expose permission/task diagnostics.
- [Risk] GPS noise near the narrow 3.5-4.0 m band causes unstable candidates. -> Mitigation: retain distance evidence, use point-to-segment distance, reject poor samples, and require manual review.
- [Risk] Long routes produce expensive plant-to-segment comparisons. -> Mitigation: prefilter plants by the selected zone and route bounding box expanded by the maximum distance, then calculate exact distance only for survivors.
- [Risk] App termination by the OS can stop location delivery. -> Mitigation: persist each point immediately, detect interrupted tracking on restart, and never claim continuous capture when the platform task is inactive.
- [Risk] Deployed Supabase constraints may not support stable upserts. -> Mitigation: inspect schema first, add explicit uniqueness through a migration, and test retry behavior against the database.
- [Risk] A `security definer` RPC in `public` broadens privilege risk. -> Mitigation: prefer the project's supported private/unexposed function pattern where feasible; otherwise lock `search_path`, validate caller/input, revoke public execute, and grant only the intended role.
- [Trade-off] Dedicated local tables duplicate some shared operation fields. -> Mitigation: treat spraying tables as the aggregate workspace and map to shared remote tables only at sync, avoiding coupling background/review state to generic caches.

## Migration Plan

1. Add domain models, geometry helpers, SQLite tables/indexes, repository/service methods, and tests without exposing navigation.
2. Add the registered background task and native Expo permission configuration; verify foreground, background, stop, and recovery behavior on supported development builds.
3. Add the route, screen, setup modal, live map, simulation/review UI, and field-work navigation.
4. Inspect the deployed Supabase schema/functions/policies through MCP, then implement and test the final RPC contract. Generate a project migration for any function, constraint, grant, or policy changes.
5. Update `database.md` item 20.4 and resolve the configured `database-and-features-organization.md` documentation target.
6. Enable synchronization after local and remote contract tests pass. Rollback can hide/remove the route while preserving local tables and pending data; database rollback must drop or restore only migration-owned function/constraint changes.

## Open Questions

- What GPS accuracy ceiling and minimum point interval/distance should production use for the orchard devices?
- Should operators be allowed to change the 3.5-4.0 m treatment band per operation, or should it remain an application-level configuration?
- Does the deployed database already contain `sync_reviewed_spraying_operation` and uniqueness constraints for `(device_id, local_id)` on all synchronized entities?
- Should `database-and-features-organization.md` be created as a canonical companion, or should `openspec/config.yaml` be corrected to name the existing `database.md`?
