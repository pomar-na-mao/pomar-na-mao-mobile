## Context

The app currently has feature-specific models and SQLite tables for routines, annotations, new plants, and spraying. The database restructuring document introduces a normalized Supabase model centered on plants, zones, operation types, field operations, plant occurrences, inspection targets, and operation history.

This change prepares the app for that model without refactoring existing features yet. The implementation must add app-side structural models and the initial SQLite cache/sync foundation from item 20.1, while leaving current repositories, screens, and feature flows behaviorally unchanged.

## Goals / Non-Goals

**Goals:**

- Represent the restructured Supabase tables with TypeScript interfaces/types in the domain layer.
- Add reusable sync metadata types for `local_id`, remote IDs, `device_id`, `sync_status`, `synced_at`, timestamps, and sync errors.
- Add SQLite initialization for item 20.1 local cache tables: `local_varieties`, `local_occurrence_types`, `local_operation_types`, `local_zones`, `local_plants`, `local_plant_occurrences`, `local_field_operations`, `local_inspection_targets`, and `sync_queue`.
- Add clear module boundaries for a future initial sync repository/service that can download remote records and upsert them locally.

**Non-Goals:**

- No screen, navigation, or UI workflow changes.
- No refactor of inspection, annotation, spraying, or map behavior.
- No Supabase migration execution from the mobile app.
- No RPC implementation or feature synchronization payload implementation beyond the generic foundation.
- No data migration from legacy local SQLite tables into the new local tables.

## Decisions

1. Keep new structural models separate from legacy feature models.

   The new normalized schema differs from existing feature-specific shapes such as `PlantData` and current spraying models. New files should live in dedicated model modules, for example `src/domain/models/structural` or equivalent local convention, so later refactors can opt into them gradually.

   Alternative considered: rewriting existing models in place. This was rejected because it would force behavior changes in current screens and repositories before the structural foundation is stable.

2. Use explicit TypeScript interfaces matching Supabase column names.

   Supabase records currently use snake_case fields. Structural model interfaces should preserve remote column names for table rows and use separate local/cache interfaces only when SQLite fields differ.

   Alternative considered: converting all models to camelCase. This was rejected for this phase because it adds mapper work and raises the chance of accidental functional changes.

3. Store PostGIS-derived shapes as app-consumable values.

   Remote structural models may describe generated geography columns conceptually, but local SQLite tables should store latitude/longitude and GeoJSON text where item 20.1 calls for it, such as `boundary_geojson`.

   Alternative considered: emulating geography columns in SQLite. This was rejected because SQLite on device should remain a simple cache and offline working store.

4. Extend SQLite initialization idempotently.

   New `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` statements should be added without dropping existing tables. The current `dropDatabases` helper should not remove the new structural tables unless a deliberate reset scope is added later.

   Alternative considered: creating a separate initializer not called by app startup. This was rejected because the structural cache must exist before future sync code can safely use it.

5. Define sync boundaries without triggering sync behavior.

   The implementation should create types and thin service/repository boundaries for initial download/cache operations, but it must not automatically call Supabase or alter current app startup behavior unless existing initialization already requires table creation.

   Alternative considered: implementing full initial sync now. This was rejected because the user's requested scope is structure only.

## Risks / Trade-offs

- Duplicate concepts between legacy and structural models -> Keep modules separated and avoid replacing imports in existing features.
- SQLite schema drift from the database document -> Keep item 20.1 table names and fields traceable in constants/tests.
- Type mismatches for UUID, bigint, timestamptz, and booleans -> Use `string` for UUID/timestamptz, `number` for bigint IDs, and `0 | 1` or boolean-specific local types where SQLite stores integer booleans.
- Future migrations may need local table changes -> Use idempotent initialization now and leave destructive/local migration decisions for a later change.
- Adding services could imply behavior that is not yet implemented -> Expose only explicit foundations such as table names, row types, and stub-safe method boundaries; do not wire automatic network behavior.

## Migration Plan

1. Add new TypeScript model files and exports without changing existing feature imports.
2. Add SQLite table/index creation for item 20.1 in the existing initialization path.
3. Add initial sync foundation modules that can be imported by future feature refactors.
4. Validate with TypeScript and lint.

Rollback is limited to removing the new model/sync modules and SQLite initialization statements. Existing user-facing behavior should remain unaffected because this change does not replace current feature paths.
