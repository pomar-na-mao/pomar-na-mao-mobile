## 1. Shared Structural Data

- [x] 1.1 Add shared Supabase readers and stable TanStack Query definitions for zones, occurrence types, and varieties, returning normalized arrays and surfacing request errors.
- [x] 1.2 Add route-specific adapters/snapshot accessors that map the shared cached resources to inspection, annotation, and spraying option types without starting remote requests.
- [x] 1.3 Implement the field-work readiness hook with Expo Network reachability, per-card dependency evaluation, loading/unavailable/ready states, and focus-based retry for failed or empty resources.
- [x] 1.4 Add unit tests for resource queries, per-card dependency mapping, offline handling, empty responses, API failures, cache reuse, and selective retry.

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

- [ ] 4.1 Run focused tests for shared readiness, field-work navigation, and the three feature providers.
- [ ] 4.2 Run the TypeScript compiler and lint checks for the completed change and resolve all introduced failures.
- [ ] 4.3 Confirm the final diff contains no Supabase schema, migration, RPC, policy, permission, or `database.md` changes.
