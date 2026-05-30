## Why

The app still exposes retired field-work routes for add-plant, annotation, and spraying even though the active field workflow is now centered on inspection. Removing these routes and their exclusive implementation files reduces navigation noise, dead code, background side effects, and maintenance cost.

## What Changes

- **BREAKING**: Remove the `/add-plant`, `/annotation`, and `/spraying` app routes.
- Remove those routes from stack/navigation configuration and from any field-work menu entries.
- Delete UI, view-model, data service/repository/store, domain model, hook, task, utility, and constant files that are used only by those removed flows.
- Remove initialization or background registration code that exists only for annotation, add-plant, or spraying.
- Keep all other routes, especially `/inspection`, `/field-works`, `/modal`, and `/`, working.
- Preserve shared components/utilities that are still referenced by inspection or other retained routes.

## Capabilities

### New Capabilities

- `retired-field-work-route-removal`: Defines the removal contract for retired field-work routes and their exclusive implementation files.

### Modified Capabilities

- `inspection-screen-route`: Active field-work navigation must not reference removed legacy routes while preserving the inspection entrypoint.

## Impact

- Affected route files:
  - `src/app/add-plant.tsx`
  - `src/app/annotation.tsx`
  - `src/app/spraying.tsx`
  - `src/app/_layout.tsx`
  - `src/app/field-works.tsx`
- Likely removed feature folders:
  - `src/ui/add-plant`
  - `src/ui/annotation`
  - `src/ui/spraying`
  - `src/data/repositories/annotation`
  - `src/data/services/annotation`
  - `src/data/services/new-plants`
  - `src/data/services/spraying`
  - `src/data/store/spraying`
  - `src/domain/models/annotation`
  - `src/domain/models/spraying`
- Likely removed spraying-only support files:
  - `src/shared/tasks/spraying-background-location-task.ts`
  - `src/shared/hooks/use-spraying-gps-tracker.ts`
  - `src/shared/hooks/use-tracking-timer.ts`
  - `src/shared/constants/spraying-background-location.ts`
  - `src/shared/utils/spraying-mock-route.ts`
  - `src/shared/utils/spraying-route-location-filter.ts`
- SQLite initialization may remove local tables used exclusively by deleted flows, while preserving tables required by inspection and remaining sync foundations.
- Supabase schema is not changed by this app cleanup.
