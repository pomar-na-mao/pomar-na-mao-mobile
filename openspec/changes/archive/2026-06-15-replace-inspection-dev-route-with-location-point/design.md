## Context

The inspection map currently owns a three-point DEV simulator. It stores P1/P2/P3, builds an interpolated route, emits synthetic `LocationObject` values on an interval, animates the camera, and asks the inspection view-model to ignore device updates while playback is active.

The required workflow is a static location override: a developer selects one map coordinate, that coordinate becomes the effective user location, and deleting it restores normal GPS-driven behavior. Production behavior must remain unchanged.

## Goals / Non-Goals

**Goals:**

- Reduce the DEV interaction to selecting and deleting one simulated location point.
- Reuse the normal inspection location pipeline so nearest-plant state, marker state, and persistence react exactly as they do to device updates.
- Restore the latest real device location as soon as the simulated point is deleted.
- Remove route interpolation, timers, camera playback, and route preview behavior.

**Non-Goals:**

- Simulating movement, speed, or a changing heading.
- Changing foreground location accuracy, subscription cadence, or production behavior.
- Changing inspection persistence, database schemas, synchronization, or Supabase contracts.
- Changing the spraying simulator.

## Decisions

### Apply the point immediately through the existing location pipeline

After the developer arms point selection and presses the map, the map component will enable the DEV override and call `applyLocationUpdate` once with a synthetic `LocationObject` at the selected coordinate. This keeps nearest-plant evaluation and persistence in the existing view-model path.

Alternative considered: store a visual-only coordinate in the map component. This was rejected because the user marker would move without updating nearest-plant detection or inspection state.

### Cache device samples while the DEV override is active

`applyLocationUpdate` will retain the latest device-sourced location before deciding whether it may become the effective location. While the override is active, device samples remain suppressed from the UI and nearest-plant calculation but continue refreshing this cache. Disabling the override will immediately apply the cached device sample through the normal evaluation path.

Alternative considered: wait for the next `watchPositionAsync` event after deletion. This was rejected because restoration latency would depend on GPS cadence and could leave the simulated position visible.

Alternative considered: call `getCurrentPositionAsync` on deletion. This adds an asynchronous location request and can be slower than reusing the foreground sample already received by the watcher.

### Keep DEV state local to the inspection map

The selected point and point-selection mode remain component state because they are transient map interaction details. The view-model remains responsible only for choosing whether device or simulation updates become effective and for running nearest-plant evaluation.

### Replace route helpers with a point-location factory

Route segment construction, route interpolation, bearing generation, interval constants, and three-point tuple types will be removed. A small inspection-local pure helper will create the synthetic static `LocationObject`, using the selected latitude/longitude, a current timestamp, zero speed, and stable metadata appropriate for a stationary point.

### Render one marker and minimal controls

The DEV overlay will expose one action to arm point selection and one delete action. There will be no start/stop actions or polyline. Selecting another point will replace the existing simulated point and immediately update the effective location.

## Risks / Trade-offs

- [The cached device sample may be slightly older than the instant of deletion] -> Continue accepting every device sample into the cache and let subsequent watcher updates resume normally after restoration.
- [A static synthetic location has no meaningful movement heading] -> Treat it as stationary and avoid inventing route-derived heading or speed.
- [Changing activation and restoration order could briefly apply a device sample] -> Enable the override before applying the simulated location, and restore the cached device sample only when disabling it.
- [DEV controls could leak into production] -> Preserve explicit `__DEV__` guards in rendering and view-model override behavior.
