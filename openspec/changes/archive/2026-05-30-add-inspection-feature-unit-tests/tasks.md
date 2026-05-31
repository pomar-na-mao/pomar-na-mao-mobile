## 1. Test Inventory And Shared Harness

- [x] 1.1 Confirm the current direct inspection feature file inventory and record any type-only or barrel files that need only import/type smoke coverage
- [x] 1.2 Add shared inspection test fixtures for plants, occurrences, filters, local inspections, location objects, and sync payloads
- [x] 1.3 Add reusable mocks for Supabase client chains, Expo SQLite context, Expo Location, Expo Constants, alert/loading stores, and inspection context consumers where needed
- [x] 1.4 Ensure existing Jest setup mocks are sufficient for inspection map/native dependencies before adding feature-specific mocks

## 2. Helper Unit Tests

- [x] 2.1 Add or extend tests for `src/ui/inspection/helpers/simulation-route.ts`
- [x] 2.2 Add tests for `src/ui/inspection/helpers/nearest-plant.ts`
- [x] 2.3 Add tests for `src/ui/inspection/helpers/inspection-list-formatters.ts`
- [x] 2.4 Add tests for `src/ui/inspection/helpers/device.ts`

## 3. Domain And Repository Tests

- [x] 3.1 Add import/type smoke coverage for `src/domain/models/inspection/index.ts`
- [x] 3.2 Add import/type smoke coverage for `src/domain/models/inspection/inspection.model.ts`
- [x] 3.3 Add tests for `groupInspectionPlantRows` in `src/data/repositories/inspection/inspection-repository.ts`
- [x] 3.4 Add tests for repository methods that normalize filter options, grouped plants, and sync results from mocked `inspectionSupabaseService`

## 4. Supabase Service Tests

- [x] 4.1 Add tests for `inspectionSupabaseService.getFilterOptions` success and partial error behavior
- [x] 4.2 Add tests for `inspectionSupabaseService.getInspectionPlants` RPC name and filter parameter mapping
- [x] 4.3 Add tests for `inspectionSupabaseService.syncManualInspection` RPC name and payload parameter mapping

## 5. SQLite Service Tests

- [x] 5.1 Add tests for cached filter option reads and row mapping in `use-inspection-sqlite-service.ts`
- [x] 5.2 Add tests for `createInspection`, including UUID usage, transaction usage, local inspection insert, and loaded plant inserts
- [x] 5.3 Add tests for inspection lookup/list methods and loaded plant row conversion
- [x] 5.4 Add tests for `updateNearestPlant`, `addInspectionChange`, `refreshChangedPlantsCount` behavior through public methods, and `finishInspection`
- [x] 5.5 Add tests for `buildSyncPayload`, including JSON parsing, missing inspection error handling, and grouping changes by plant
- [x] 5.6 Add tests for `markInspectionSyncing`, `markInspectionSynced`, `markInspectionSyncError`, and `clearLoadedPlantsChangedState`

## 6. Provider/View-Model Tests

- [x] 6.1 Add tests for initial `InspectionProvider` load with cached filters, pending inspection restore, latest inspection restore, and successful location permission
- [x] 6.2 Add tests for denied location permission and filter repository error handling
- [x] 6.3 Add tests for `applyFilters` validation, empty result behavior, repository error behavior, and successful local inspection creation
- [x] 6.4 Add tests for `applyLocationUpdate`, nearest plant evaluation, simulation gating, modal visibility, and nearest plant persistence threshold
- [x] 6.5 Add tests for `saveOccurrenceChange` validation, previous occurrence detection, local change persistence, and success alert
- [x] 6.6 Add tests for `finishActiveInspection` validation and successful local finish behavior
- [x] 6.7 Add tests for `syncInspection` empty payload handling, repository error handling, success state reset, and local sync status transitions

## 7. Component Tests

- [x] 7.1 Add tests for `src/ui/inspection/components/inspection-screen/index.tsx`
- [x] 7.2 Add tests for `src/ui/inspection/components/inspection-list/index.tsx`
- [x] 7.3 Add tests for `src/ui/inspection/components/inspection-filter-modal/index.tsx`
- [x] 7.4 Add tests for `src/ui/inspection/components/nearest-plant-modal/index.tsx`
- [x] 7.5 Add tests for `src/ui/inspection/components/inspection-map/index.tsx`
- [x] 7.6 Add tests for `src/ui/inspection/components/inspection-nearest-plant-simulation/index.tsx`

## 8. Validation And Documentation

- [x] 8.1 Run `npm test` and fix inspection test runtime failures
- [x] 8.2 Run `npx tsc --noEmit` and fix type issues introduced by inspection tests
- [x] 8.3 Run focused ESLint on new and touched inspection test files and fix lint errors
- [x] 8.4 Update `TESTING.md` with inspection-specific test conventions, mocks, and any intentionally skipped/no-runtime files
- [x] 8.5 Re-run `openspec status --change add-inspection-feature-unit-tests --json` and confirm proposal, design, specs, and tasks are complete
