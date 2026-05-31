## Why

Several staged inspection components and view-model files contain local helper functions that are not part of rendering or state orchestration, such as `buildSimulationRoute` and its route math helpers inside `InspectionMap`. Keeping reusable or pure helper logic inside components makes the MVVM boundary harder to maintain and increases the chance of duplicating route, formatting, and mapping logic across staged files.

## What Changes

- Extract pure helper functions from staged components and view-models into specific files named for their responsibility.
- Move inspection map simulation route helpers out of `src/ui/inspection/components/inspection-map/index.tsx` into an inspection-specific helper module.
- Keep components focused on rendering, event handling, and binding to view-model state.
- Keep view-models focused on state orchestration and domain/service interaction, while moving pure calculations/mappers into nearby helper/model files.
- Preserve existing runtime behavior and public UI flow; this change is structural and testability-oriented.

## Capabilities

### New Capabilities

- `mvvm-helper-organization`: Defines how reusable or pure helper logic from staged UI components and view-models is separated into responsibility-specific files while preserving MVVM boundaries.

### Modified Capabilities

- None.

## Impact

- Affected code:
  - `src/ui/inspection/components/inspection-map/index.tsx`
  - `src/ui/inspection/view-models/use-inspection.tsx`
  - Other staged UI component/view-model files that contain pure helpers, mappers, or formatters.
- New helper files may be added under feature-local paths such as `src/ui/inspection/helpers/` or shared utility paths when logic is truly cross-feature.
- No database schema, navigation route, external API, or dependency changes are expected.
