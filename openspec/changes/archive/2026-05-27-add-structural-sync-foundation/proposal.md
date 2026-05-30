## Why

The database restructuring in `database-and-features-organization.md` defines the next data model for map, history, field operations, and offline-first workflows. Before refactoring existing features, the app needs a structural foundation that represents the new Supabase tables in TypeScript and prepares the initial SQLite sync cache from item 20.1.

## What Changes

- Add TypeScript domain models for the new structural Supabase tables described in the database organization document.
- Add local SQLite model definitions and initialization structure for the initial app sync process from item 20.1.
- Add a generic sync foundation for initial download/cache state, local/remote ID mapping, sync status, timestamps, and error fields.
- Keep existing feature behavior unchanged: inspection, annotation, spraying, map filters, repositories, screens, and RPC workflows remain functionally untouched in this change.
- Do not execute Supabase migrations or change remote database schema in this app change; the implementation only creates app-side structure needed to consume the new schema later.

## Capabilities

### New Capabilities

- `structural-data-models`: Defines app-side models for the restructured Supabase tables and shared sync metadata.
- `initial-sync-foundation`: Defines the local SQLite structure and service boundaries for the initial download/cache process from item 20.1.

### Modified Capabilities

- None.

## Impact

- Affected code: `src/domain/models`, `src/data/services/sqlite`, and new sync-oriented data service/repository modules as needed.
- Affected systems: app-side TypeScript model layer and SQLite initialization.
- No user-facing functionality changes are intended.
- No Supabase schema migration is applied by this change.
