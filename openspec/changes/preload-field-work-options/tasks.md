## 1. Shared Structural Data

- [x] 1.1 Add shared Supabase readers and stable TanStack Query definitions for zones, occurrence types, and varieties, returning normalized arrays and surfacing request errors.
- [x] 1.2 Add route-specific adapters/snapshot accessors that map the shared cached resources to inspection, annotation, and spraying option types without starting remote requests.
- [x] 1.3 Implement the field-work readiness hook with Expo Network reachability, per-card dependency evaluation, loading/unavailable/ready states, and focus-based retry for failed or empty resources.
- [x] 1.4 Add unit tests for resource queries, per-card dependency mapping, offline handling, empty responses, API failures, cache reuse, and selective retry.
- [x] 1.5 Listen for offline-to-online transitions while the field-work screen remains mounted, reload unavailable resources, and test the live card-state update.
- [x] 1.6 Require successful Supabase validation on field-work mount before cached resources can enable cards, and cover cached-data refetch failure.
- [x] 1.7 Allow offline card readiness from complete in-memory option caches while keeping missing dependencies blocked and retaining reconnect loading.
- [x] 1.8 Persist successful structural option resources, hydrate the query cache before readiness evaluation, and test offline restart recovery.

## 2. Field-Work Card States

- [x] 2.1 Update `field-works.tsx` to start structural preloading, bind each card to its readiness state, and block navigation unless the card is ready.
- [x] 2.2 Add a loading treatment for unresolved cards and an accessible Material Icons `cloud-off` indicator for offline, failed, or empty-resource cards while preserving the existing visual language.
- [x] 2.3 Extend field-work screen tests for initial loading, successful navigation, independent disabled states, unavailable indicators, accessibility labels, and blocked presses.

## 3. Feature Data Handoff

- [x] 3.1 Update the inspection provider to initialize filter options from the shared preload and remove its mount-time Supabase option request while preserving SQLite inspection restoration, GPS startup, and filtered plant loading.
- [x] 3.2 Update the annotation provider to initialize zones and occurrence types from the shared preload and remove its mount-time Supabase option request while preserving local annotation restoration and GPS startup.
- [x] 3.3 Update the spraying provider to initialize zones from the shared preload and remove its mount-time Supabase zone request while preserving cached operation/loaded-zone restoration, GPS startup, and selected-zone plant loading.
- [x] 3.4 Update inspection, annotation, and spraying provider tests to seed the shared query cache, assert that route mount performs no structural Supabase reads, and retain coverage for feature-specific remote plant requests.

## 4. Verification

- [x] 4.1 Run focused tests for shared readiness, field-work navigation, and the three feature providers.
- [x] 4.2 Run the TypeScript compiler and lint checks for the completed change and resolve all introduced failures.
- [x] 4.3 Confirm the final diff contains no Supabase schema, migration, RPC, policy, permission, or `database.md` changes.

## 5. Shared Plant Snapshots

- [x] 5.1 Replace the weather card with a loaded-data card and zone plant loader.
- [x] 5.2 Persist per-zone plant snapshots in shared SQLite storage.
- [x] 5.3 Require loaded plants for inspection and spraying readiness.
- [x] 5.4 Make inspection and spraying read and filter plants locally without remote plant requests.
- [x] 5.5 Add cache tests and run final validation.
- [x] 5.6 Refine the loaded-data card with per-zone plant totals, dependency guidance, and a dedicated modal action.
- [x] 5.7 Improve the loaded-data card hierarchy with colored summaries and a yellow informational banner.
- [x] 5.8 Reduce the loaded-data header icon and remove the aggregate plant-count subtitle.
- [x] 5.9 Use the 32px header download icon as the modal action without a background or separate button.
- [x] 5.10 Extract the loaded-data card, plant-loader hook, modal, and styles from `field-works.tsx` into a dedicated component.
- [x] 5.11 Keep the loaded-data card at a fixed height and make its zone summary independently scrollable.
- [x] 5.12 Add a confirmed trash action that clears all locally loaded plants and refreshes card readiness.
- [x] 5.13 Replace the native deletion alert with a theme-aware modal matching the plant-loading modal.
- [x] 5.14 Make loaded-zone rows swipeable from left to right and support confirmed deletion of one zone snapshot.
- [x] 5.15 Remove occurrence selection from the inspection plant-loading modal and load all cached plants for the zone.
