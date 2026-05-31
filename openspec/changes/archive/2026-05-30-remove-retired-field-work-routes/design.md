## Context

The app currently has route files for `/add-plant`, `/annotation`, and `/spraying`, and `field-works` still advertises those flows. Each route has a broad dependency tree: UI folders, view-models, local SQLite services, Supabase services, domain models, stores, background tasks, hooks, and utility files.

Inspection is the route that remains active for the field workflow. Removing the retired flows should not disturb shared foundations used by inspection, structural sync, maps, forms, or common UI.

## Goals / Non-Goals

**Goals:**

- Delete the `add-plant`, `annotation`, and `spraying` route files from `src/app`.
- Remove route registrations and menu entries that navigate to those routes.
- Remove files exclusively owned by those flows.
- Remove imports with side effects that exist only to support deleted flows, especially spraying background tracking registration.
- Preserve the retained routes and inspection flow.
- Keep shared components and models when they are still referenced by remaining code.

**Non-Goals:**

- Do not remove `/inspection`, `/field-works`, `/modal`, `/`, or layout infrastructure.
- Do not change Supabase remote schema.
- Do not remove structural/local sync tables that are still used by inspection or retained future capabilities.
- Do not perform unrelated UI redesigns.

## Decisions

1. Remove by dependency ownership, not by string match alone.

   Files under `src/ui/add-plant`, `src/ui/annotation`, and `src/ui/spraying` are owned by deleted routes and should be removed. Shared files should be removed only when no retained import remains. This prevents accidental deletion of common map, form, plant marker, geolocation, or theme utilities.

2. Remove navigation references at the source.

   `src/app/_layout.tsx` should no longer register stack screens for the deleted routes, and `src/app/field-works.tsx` should no longer show actions pointing to them. This is preferable to leaving dead menu items that fail at runtime.

3. Remove background side effects with the owning flow.

   The layout import for `spraying-background-location-task` should be removed with the spraying flow. Background task constants, hooks, task registration, route simulation helpers, and spraying store/services should be deleted when no retained code imports them.

4. Keep SQLite cleanup scoped.

   Local table creation for annotation, add-plant, and spraying can be removed if no remaining flow uses those tables. Existing inspection and structural sync tables must remain. If migration/drop behavior is needed for already-installed apps, handle it explicitly in a later data migration change rather than silently dropping user data as part of route cleanup.

## Risks / Trade-offs

- [Risk] A shared file is deleted because it mentions a retired flow term -> Mitigation: run `rg` after deletion and keep files with retained imports.
- [Risk] TypeScript breaks due to stale imports from layout, field menu, or shared hooks -> Mitigation: run `npx.cmd tsc --noEmit` and fix references.
- [Risk] Full lint reports unrelated existing issues -> Mitigation: run focused lint on touched files and report broader pre-existing failures separately.
- [Risk] Existing local data for retired flows remains in installed apps -> Mitigation: remove feature access now; handle destructive data cleanup only through an explicit migration if product requires it.
