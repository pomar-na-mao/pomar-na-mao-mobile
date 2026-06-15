## Remote contract inspected on 2026-06-15

Project: `cumkqrjwsbyotaojeyxv`

### `public.plant_occurrence_events`

- The table exists with the canonical columns and contains zero rows.
- The primary key, four foreign keys, action check, occurrence index, operation
  index, and partial unique retry index already exist.
- RLS is enabled, but there are no policies.
- `anon` and `authenticated` currently have direct `SELECT`, `INSERT`,
  `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES`, and `TRIGGER` grants.
- The migration must revoke direct mutation privileges, grant authenticated
  read access, add the authenticated read policy, and add the missing
  plant/type chronology index.

### Deployed RPC differences

- `sync_manual_inspection(jsonb)` returns
  `removed_occurrences_count`, uses `search_path = public, extensions`, grants
  execution through `PUBLIC`, and does not persist occurrence events.
- `create_occurrence_annotation(...)` has the expected 15-argument signature,
  return shape, defaults, and role grants, but does not persist an occurrence
  event.
- `sync_polygon_bulk_update(jsonb)` has the expected return shape and
  authenticated execution contract, but does not persist occurrence events.
- `get_inspection_operations(date, date, uuid)` has the expected signature,
  top-level return shape, empty search path, and authenticated execution
  contract, but does not return `occurrence_events`.
- The deployed inspection and polygon writers can replace
  `plant_occurrences.field_operation_id` when an existing occurrence changes.
  The migration must preserve that field as creation attribution and represent
  later mutations only through append-only events.

The exact function identities, owners (`postgres`), security-definer state,
search paths, grants, and definitions were inspected through Supabase MCP
catalog queries before the migration was written.
