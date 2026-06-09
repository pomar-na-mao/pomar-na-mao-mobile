## Why

Item 20.4 of `database.md` defines a detailed offline-first spraying workflow, but the current mobile app has no `/spraying` route, GPS track capture, local review, or synchronization path. Implementing it now enables field operators to record treatments reliably, review affected plants before upload, and preserve the resulting plant history even when connectivity is unavailable.

## What Changes

- Add a new `/spraying` field-work route with a map-first screen, operation summary, zone loading, operator/machine/input collection, and lifecycle actions.
- Capture and persist GPS track points while the app is foregrounded or backgrounded, render the route in real time, and consolidate the completed route locally.
- Add the item 20.4 spraying-specific SQLite schema and repositories for operations, points, routes, inputs, candidate plants, and confirmed plants.
- Simulate affected plants locally after tracking ends using the reviewed 3.5-4 meter lateral treatment range, then let users add or remove plants before confirmation.
- Synchronize a reviewed spraying operation through an idempotent Supabase RPC that creates the operation, track points, route, inputs, and confirmed `plant_operation_history` rows atomically.
- Verify and, if necessary, add or revise the spraying RPC, grants, RLS-compatible access, and database migration while keeping stable `local_id` and `device_id` duplicate-prevention metadata.
- Update item 20.4 of `database.md` with the implemented SQLite, geometry, RPC, security, and payload contracts; also resolve the required `database-and-features-organization.md` documentation target defined by `openspec/config.yaml`.
- Replace the existing specification rules that keep `/spraying` retired while preserving retirement of `/add-plant`.

## Capabilities

### New Capabilities

- `spraying-screen-route`: Navigation and map-first spraying workflow, including setup, tracking, simulation, review, completion, and synchronization actions.
- `spraying-background-tracking`: Permission handling, foreground/background GPS capture, durable point persistence, live route display, and recovery after interruption.
- `spraying-local-review`: Spraying-specific SQLite state, zone plant loading, local route consolidation, lateral-distance simulation, and manual confirmation overrides.
- `spraying-sync`: Idempotent Supabase synchronization of a reviewed spraying operation and all related records through a transactional RPC boundary.

### Modified Capabilities

- `retired-field-work-route-removal`: Reactivate `/spraying` as a newly implemented route while keeping `/add-plant` retired and avoiding restoration of deleted legacy spraying code.
- `inspection-screen-route`: Change field-work navigation requirements so inspection, annotation, and spraying are active entrypoints.

## Impact

- Adds route registration under `src/app` and new spraying UI/view-model modules under `src/ui/spraying`.
- Adds spraying domain models, repositories, SQLite services, Supabase services, geospatial helpers, and background location task integration.
- Extends SQLite initialization with six spraying-specific tables and supporting indexes from item 20.4.
- Requires Expo background-location configuration and platform permission handling using the existing `expo-location` and `expo-task-manager` dependencies.
- Affects Supabase functions, grants/permissions, and potentially migrations for `sync_reviewed_spraying_operation`; implementation must inspect the deployed database before changing it.
- Adds focused tests for lifecycle state, GPS task persistence, route geometry/distance, plant simulation and overrides, RPC payload mapping, idempotency, and failure recovery.
