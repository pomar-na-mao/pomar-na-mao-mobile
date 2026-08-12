## Why

In deployed mobile builds, the nearest-plant occurrence edit modal can hide its
last controls under the on-screen keyboard. Users may be unable to reach or
confirm the final occurrence fields when adding an occurrence during inspection.

## What Changes

- Update the inspection nearest-plant occurrence modal so keyboard appearance
  does not obscure the final fields or save action.
- Reuse the proven layout behavior from the spraying "Nova Pulverização" setup
  modal: keyboard avoidance, scrollable content, drag-to-dismiss behavior, and
  enough bottom spacing for deployed mobile keyboards.
- Preserve the current occurrence add/remove behavior, validation, dropdowns,
  and nearest-plant details.
- Add focused tests that assert the inspection modal uses the same keyboard-safe
  structure as the spraying setup modal.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `inspection-occurrence-editing`: The nearest-plant occurrence edit modal must
  remain usable when the keyboard is visible in deployed mobile builds.

## Impact

- Affected UI: `src/ui/inspection/components/nearest-plant-modal`.
- Reference UI: `src/ui/spraying/components/spraying-setup-modal`.
- Affected tests: nearest-plant modal component tests.
- No database, API, Supabase, or SQLite contract changes.
