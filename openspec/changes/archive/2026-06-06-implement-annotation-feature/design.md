## Context

The app currently exposes inspection as the active field-work route and intentionally removed the older `/annotation` implementation. `database-and-features-organization.md` item `20.3` describes the annotation process, and item `22.2` summarizes the main tables and collected fields: occurrence type, GPS point, accuracy, notes, and severity. Existing local structural tables already include `local_field_operations` and `local_plant_occurrences`, which can represent annotation operations and their generated occurrences.

The new feature should reuse the inspection architecture: Expo route file, provider/view-model, focused UI components, repository/service layer, and SQLite/Supabase isolation. It should not resurrect deleted annotation code from the retired route; the implementation should be new and consistent with the current inspection modules.

## Goals / Non-Goals

**Goals:**

- Build `/annotation` as an active field-work route with a map-first layout similar to inspection.
- Let the user open a modal from bottom actions, select annotation data, save the current GPS position locally, finalize, and synchronize.
- Keep SQLite as the temporary source of truth while offline, with summary counts driven by local pending/synced/error rows.
- Use the existing/recommended Supabase annotation contract where possible and document any required RPC contract changes in `database-and-features-organization.md`.
- Add tests around UI state, local persistence, GPS position capture, and RPC payload mapping.

**Non-Goals:**

- Do not restore the old retired `src/ui/annotation` implementation or any deleted route behavior wholesale.
- Do not implement spraying or add-plant flows.
- Do not redesign the inspection screen beyond the field-work navigation change needed to expose annotation.
- Do not make Supabase direct multi-table writes the default sync path unless the RPC is unavailable or cannot satisfy the payload contract.

## Decisions

1. Implement annotation as a new route and feature module.

   `src/app/annotation.tsx` should mirror the inspection route shape by mounting an annotation provider and screen component. Annotation-specific files should live under `src/ui/annotation`, `src/data/repositories/annotation`, `src/data/services/annotation`, and `src/domain/models/annotation` as needed. Alternative considered: add annotation as a mode inside inspection. That would blur two field workflows with different persistence and sync semantics, so a separate route keeps ownership clearer.

2. Reuse the map-first inspection interaction pattern.

   The annotation screen should show the map behind the controls, a summary panel for total/pending/synced/error annotations, and bottom actions for selecting data, finalizing, and syncing. The modal should own occurrence type, notes, severity, and GPS context. Alternative considered: use a simple form screen without the map. That would omit the spatial context that item `22.2` expects and would diverge from the requested inspection-like UI.

3. Persist using local operation and occurrence records.

   The local save should create or reuse an annotation field operation with `operation_type_code = 'occurrence_annotation'` and create a local occurrence row with the annotation GPS fields and sync status, leaving `plant_id` and assigned distance empty until sync. The existing normalized local tables can be used first; if implementation needs the dedicated `local_occurrence_annotations` / `local_annotation_operations` tables from item `20.3`, the document and SQLite initialization should be aligned in the same change. Alternative considered: keep annotation rows only in component state until sync. That would lose offline resilience and conflict with the app's local-source-of-truth rule.

4. Resolve nearest plant only during synchronization.

   The app should store the annotation latitude/longitude and should not calculate, display, or require a local nearest plant. The Supabase RPC should use PostGIS during sync to find the nearest plant from the recorded annotation point. Alternative considered: calculate with locally cached plant coordinates. That was rejected because annotation should allow arbitrary occurrence points and server-side PostGIS is the source of truth for assignment.

5. Prefer an RPC-backed sync boundary.

   Sync should call a Supabase RPC for annotation creation so `field_operations` and `plant_occurrences` are created consistently on the server. The proposal names `create_occurrence_annotation` because the document already recommends it; implementation must verify its signature and response before wiring it. If the current RPC cannot accept offline metadata such as `local_id`, device id, GPS point, or operation mapping, update the Supabase function through MCP and document the SQL/contract changes in `database-and-features-organization.md`. Alternative considered: direct table inserts from the client. That increases multi-table consistency and RLS risk.

## Risks / Trade-offs

- [Risk] The existing `create_occurrence_annotation` RPC may not match the mobile offline payload -> Mitigation: verify the deployed RPC through Supabase MCP during implementation, isolate payload mapping in an annotation Supabase service, and update both RPC and document if needed.
- [Risk] Reintroducing `/annotation` conflicts with the retired-route spec -> Mitigation: modify only the field-work navigation requirement so annotation is active again while add-plant and spraying remain retired.
- [Risk] Local schema choice may diverge from item `20.3` -> Mitigation: prefer existing normalized local tables when sufficient, and explicitly update `database-and-features-organization.md` if dedicated tables are added or avoided.
- [Risk] Server-side nearest-plant assignment can be wrong when GPS accuracy is poor -> Mitigation: surface GPS accuracy before local save and persist the original annotation point for audit.
- [Risk] Sync retry could create duplicates -> Mitigation: send stable `local_id`/`device_id`, store remote IDs after success, and mark synced only after the RPC returns success.

## Migration Plan

1. Add the new route, navigation card, feature modules, local repository/service methods, and tests.
2. Add or adjust SQLite initialization for any annotation-specific local schema that is missing.
3. Verify the Supabase RPC contract through MCP before final sync wiring; apply a migration and update `database-and-features-organization.md` if the RPC needs changes.
4. Keep rollback simple by removing the `/annotation` route/card and leaving pending local data untouched; server changes should be reversible through the paired migration if created.

## Open Questions

- Should annotation use the existing `local_field_operations` / `local_plant_occurrences` tables exclusively, or should implementation add the dedicated local tables from item `20.3` for clearer feature ownership?
- Should sync create one field operation per annotation or reuse a session-level operation for multiple annotations saved before finalization?
- The annotation RPC should not enforce a maximum nearest-plant distance by default; callers may pass one only when a specific workflow needs that constraint.
