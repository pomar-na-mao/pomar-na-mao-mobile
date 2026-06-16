# Inspection Feature Test Inventory

Active field-work routes are `/inspection`, `/annotation`, and `/spraying`; `/add-plant` remains retired.
The spraying feature has its own SQLite aggregate, background GPS task, local simulation/review, and reviewed sync RPC.

Runtime files covered by this change:

- `src/ui/inspection/helpers/device.ts`
- `src/ui/inspection/helpers/inspection-list-formatters.ts`
- `src/ui/inspection/helpers/nearest-plant.ts`
- `src/ui/inspection/helpers/simulation-location.ts`
- `src/ui/inspection/view-models/use-inspection.tsx`
- `src/ui/inspection/components/inspection-filter-modal/index.tsx`
- `src/ui/inspection/components/inspection-list/index.tsx`
- `src/ui/inspection/components/inspection-map/index.tsx`
- `src/ui/inspection/components/inspection-nearest-plant-simulation/index.tsx`
- `src/ui/inspection/components/inspection-screen/index.tsx`
- `src/ui/inspection/components/nearest-plant-modal/index.tsx`
- `src/data/repositories/inspection/inspection-repository.ts`
- `src/data/services/inspection/inspection-supabase-service.ts`
- `src/data/services/inspection/use-inspection-sqlite-service.ts`

No-runtime/type-only coverage:

- `src/domain/models/inspection/index.ts`
- `src/domain/models/inspection/inspection.model.ts`
