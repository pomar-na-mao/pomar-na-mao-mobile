## Why

Field users currently cannot register a newly planted tree at its real GPS position while working offline. Adding an offline-first plant registration flow lets them capture the minimum agronomic data in the field and synchronize it safely to `public.plants` when connectivity is available.

## What Changes

- Add a new plant-registration card to `src/app/field-works.tsx` and a dedicated Expo Router route.
- Add a local-plants screen with an empty state, accessible plant cards, visible sync status, and bidirectional swipe actions: swipe right to delete locally and swipe left to synchronize.
- Add a map-first plant form modal that captures the device latitude and longitude as read-only values and requires variety, zone, and planting date.
- Reuse preloaded/cached `varieties` and `zones`, current device location, themed form controls, and the existing React Native gesture patterns.
- Persist every valid plant to SQLite first with generated `local_id` and `device_id`, save timestamps, `is_dead = false`, `non_existent = false`, `is_new = true`, and pending synchronization state.
- Add an idempotent Supabase synchronization boundary that maps the local coordinates, `variety_id`, `zone_id`, planting date, identity fields, and flags into `public.plants`; remote timestamps are generated at synchronization time and reconciled locally with the returned remote id.
- Preserve a failed synchronization as a retryable local card with an error state; successful synchronization must not create duplicates on retry.
- Update `database.md` items 18, 20, 22, 24, and 25 with the plant-registration RPC, offline-first process, process summary, teardown SQL, consolidated creation SQL, permissions, and idempotency index/constraint. Item 5 remains the source contract for the `plants` columns and will be clarified if implementation changes that contract.

## Capabilities

### New Capabilities

- `plant-registration-screen`: Field-work navigation, the local plant list, map-first form modal, validation, accessible swipe alternatives, and visual states.
- `plant-registration-local-state`: SQLite persistence, generated local/device identity, local deletion, timestamps, flags, option references, and retryable sync status.
- `plant-registration-sync`: Idempotent Supabase plant creation, local-to-remote field mapping, remote id reconciliation, permissions, and failure handling.

### Modified Capabilities

- `field-work-data-readiness`: Add the plant-registration card and gate it on available variety and zone options while retaining offline use from persisted options.

## Impact

- Affects Expo Router registration, `src/app/field-works.tsx`, field-work readiness types/state, and new plant-registration UI/view-model modules.
- Extends the existing `local_plants` SQLite contract and adds focused local and Supabase services/repositories plus domain models and tests.
- Reuses `expo-location`, `expo-crypto`, `expo-constants`, `react-native-maps`, `react-hook-form`, the themed date picker, and `ReanimatedSwipeable`; no new runtime dependency is expected.
- Changes the Supabase contract through an idempotent plant-sync RPC and a `(device_id, local_id)` uniqueness guarantee, with matching migration, RLS/grant review, and `database.md` updates.
