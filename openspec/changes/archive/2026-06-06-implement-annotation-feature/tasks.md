## 1. Route and Navigation

- [x] 1.1 Add `src/app/annotation.tsx` with an annotation provider and screen entrypoint matching the current inspection route pattern.
- [x] 1.2 Register the annotation route type/screen wherever route typing or stack registration requires it.
- [x] 1.3 Add an Annotation card to `src/app/field-works.tsx` while keeping add-plant and spraying absent.
- [x] 1.4 Add route/navigation tests or update existing tests to verify `/annotation` is exposed and retired routes remain hidden.

## 2. Domain and Local Data

- [x] 2.1 Add annotation domain models for form data, local annotation records, summary counts, GPS position, and sync payload/result.
- [x] 2.2 Decide whether to use existing `local_field_operations` / `local_plant_occurrences` only or add dedicated annotation local tables from `database-and-features-organization.md` item `20.3`.
- [x] 2.3 Update SQLite initialization for any missing annotation persistence fields/tables/indexes needed by the chosen local schema.
- [x] 2.4 Implement annotation SQLite service methods to create/update annotation operation records, create occurrence rows, load local annotations, mark finished, mark synced, and record sync errors.
- [x] 2.5 Implement an annotation repository that normalizes local rows and exposes create, load, finalize, and sync state update operations.

## 3. GPS Position Assignment

- [x] 3.1 Save annotations against the current GPS point without requiring local plant coordinates.
- [x] 3.2 Surface GPS position and accuracy in annotation view-model state.
- [x] 3.3 Support saving annotations without user confirmation of a suggested plant.
- [x] 3.4 Add unit tests for GPS-position local save, missing occurrence validation, and sync payload output without plant id.

## 4. Annotation UI and View Model

- [x] 4.1 Create annotation screen components with map background, current-location state, annotation summary, and bottom actions for data modal, finalize, and sync.
- [x] 4.2 Create the annotation data modal with occurrence type selection, GPS position details, severity, notes, validation state, save, and cancel actions.
- [x] 4.3 Implement the annotation provider/view-model to load options/local rows, open/close modal, save valid annotations locally, finalize the operation, and refresh summary counts.
- [x] 4.4 Add UI tests for initial screen rendering, modal open/close, required-field validation, successful local save, summary count updates, and finalize behavior.

## 5. Supabase Sync and Documentation

- [x] 5.1 Use Supabase MCP to inspect the deployed `create_occurrence_annotation` function signature, permissions, and return shape before wiring sync.
- [x] 5.2 Implement annotation Supabase service/repository sync mapping to call the configured RPC with occurrence type, coordinates, GPS accuracy, severity, notes, device id, local id, and no local plant id.
- [x] 5.3 If the deployed RPC cannot support the mobile offline-first payload, create or edit the Supabase RPC through MCP and add the corresponding migration/artifact expected by the project.
- [x] 5.4 Update `database-and-features-organization.md` item `22.2` and related RPC sections if the implementation changes or clarifies the annotation sync contract.
- [x] 5.5 Mark local annotations synced only after RPC success, store remote identifiers when returned, and preserve local rows with error details on failure.
- [x] 5.6 Add tests for RPC name, payload mapping, success handling, failure preservation, and duplicate-prevention fields such as stable `local_id`/`device_id`.

## 6. Verification

- [x] 6.1 Run TypeScript checks and fix compile errors introduced by the annotation modules.
- [x] 6.2 Run the relevant Jest test suites for annotation, inspection navigation, repository, SQLite service, and Supabase service behavior.
- [x] 6.3 Run lint/prettier on changed files and apply formatting fixes.
- [ ] 6.4 Manually verify the annotation route in the local app: map loads, modal saves locally, summary updates, finalize works, and sync handles success/error states.
