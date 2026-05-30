## 1. Route And Navigation Cleanup

- [x] 1.1 Delete `src/app/add-plant.tsx`, `src/app/annotation.tsx`, and `src/app/spraying.tsx`
- [x] 1.2 Remove stack screen registrations for `add-plant`, `annotation`, and `spraying` from `src/app/_layout.tsx`
- [x] 1.3 Remove field-work menu entries and route targets for `/add-plant`, `/annotation`, and `/spraying` from `src/app/field-works.tsx`
- [x] 1.4 Remove any remaining active route constants or app menu constants that reference the deleted routes

## 2. Feature File Removal

- [x] 2.1 Delete add-plant UI, view-model, local service, and domain files that are used only by `/add-plant`
- [x] 2.2 Delete annotation UI, view-model, repository, Supabase/local services, and domain files that are used only by `/annotation`
- [x] 2.3 Delete spraying UI, view-model, store, Supabase/local services, domain files, background tasks, hooks, constants, and utilities that are used only by `/spraying`
- [x] 2.4 Keep shared components and utilities when they are still imported by inspection or retained routes

## 3. SQLite And Side-Effect Cleanup

- [x] 3.1 Remove SQLite initialization for retired-flow-only tables when no retained code reads or writes them
- [x] 3.2 Remove side-effect imports and background task registrations that exist only for spraying
- [x] 3.3 Keep inspection and structural sync SQLite tables intact

## 4. Reference Sweep

- [x] 4.1 Search for active imports or route references to `add-plant`, `annotation`, and `spraying`
- [x] 4.2 Remove or update stale imports caused by deleted feature files
- [x] 4.3 Confirm remaining matches are only historical docs/OpenSpec artifacts or retained domain-neutral schema fields

## 5. Verification

- [x] 5.1 Run TypeScript validation and fix missing-module or stale-import errors
- [x] 5.2 Run focused lint on touched retained files and fix violations introduced by this cleanup
- [x] 5.3 Verify retained routes still exist and `/inspection` remains reachable from field-work navigation
