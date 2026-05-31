## Why

During inspection, the nearest plant can change in the field before the app reflects it, causing the map highlight and nearest-plant action to lag behind reality. The detection needs to respond immediately to foreground location updates while still avoiding noisy flicker and excessive SQLite writes.

## What Changes

- Improve nearest-plant detection cadence so every valid foreground location update can update the in-memory nearest plant.
- Decouple immediate UI state updates from throttled SQLite persistence.
- Tune nearest-plant switching hysteresis so it prevents flicker only when distances are effectively tied, not when the user has clearly moved closer to another plant.
- Avoid stale closures and redundant full marker-array updates that can delay visual marker state.
- Keep the existing inspection data model, map markers, and sync payload behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `inspection-map-nearest-plant`: Make nearest-plant detection and marker state updates responsive to real-time walking movement while preserving persistence throttling.

## Impact

- Affects `src/ui/inspection/view-models/use-inspection.tsx`.
- Affects nearest-plant marker state in `src/ui/inspection/components/inspection-map` through existing `PlantMapMarkers` props.
- May add small geolocation/nearest-plant helper utilities or refs for current inspection state.
- No Supabase schema, SQLite schema, or RPC contract changes expected.
