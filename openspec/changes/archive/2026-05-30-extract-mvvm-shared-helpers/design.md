## Context

The staged inspection work introduces larger components and view-models as part of the routine-to-inspection migration. Some files now mix MVVM responsibilities with pure helper logic. For example, `InspectionMap` owns UI rendering and simulation controls, but also defines route-building math helpers such as `buildSimulationRoute`, `buildRouteSegment`, and bearing/location factory functions.

The project already has utility folders for cross-feature helpers, including `src/utils/geolocation`, `src/utils/plant-data`, and `src/shared/hooks`. This change should follow that structure without turning feature-specific logic into global utilities too early.

## Goals / Non-Goals

**Goals:**

- Keep components focused on rendering, user events, and view-model bindings.
- Keep view-models focused on state orchestration, use cases, and service calls.
- Extract pure calculations, formatters, mappers, and factories from staged UI files into named modules.
- Make helper modules easy to test independently.
- Preserve current inspection behavior, including dev-only nearest-plant route simulation.

**Non-Goals:**

- Redesign the inspection screen, map interactions, or nearest-plant algorithm.
- Change database schemas, repositories, or sync contracts.
- Introduce a new dependency or global state pattern.
- Move every nested callback out of components; event handlers that depend on component state can remain local.

## Decisions

1. Feature-specific helpers stay feature-local.

   Inspection-only simulation helpers will move to an inspection-owned module, such as `src/ui/inspection/helpers/simulation-route.ts`. This keeps the API close to the feature and avoids polluting global utilities with code that only exists to support inspection UI behavior. The alternative was placing the helpers under `src/utils/geolocation`, but the route simulation factory also depends on inspection simulation concepts and `expo-location` output shape, so a feature-local file is the clearer default.

2. Shared helpers move only when reuse is real.

   Helpers used by multiple features, such as generic geolocation math or plant comparison behavior, can live under existing shared utility paths. Helpers used by a single component or feature remain under that feature. This prevents premature abstraction while still giving repeated logic a stable home.

3. Helper modules export typed pure functions.

   Extracted helper files should define explicit parameter and return types, avoid React state, avoid hooks, and avoid direct component imports. This keeps the helper boundary testable and independent from rendering.

4. MVVM boundaries drive extraction.

   Component-local UI event handlers can remain in components when they coordinate local state, refs, or rendering. Pure transforms, mappers, route builders, date/label formatters, and calculation utilities should be extracted when they do not need component lifecycle state.

## Risks / Trade-offs

- Helpers become scattered across too many tiny files -> Mitigation: group related helpers by responsibility, such as one simulation route helper module rather than one file per function.
- Feature helpers are moved to shared utilities too early -> Mitigation: require at least one real cross-feature consumer before moving to `src/shared` or `src/utils`.
- Behavior changes during refactor -> Mitigation: extract first, update imports second, and verify with typecheck/lint plus focused tests where helper behavior is non-trivial.
- Circular imports between UI, view-models, and helpers -> Mitigation: helper modules must not import components or view-model providers.
