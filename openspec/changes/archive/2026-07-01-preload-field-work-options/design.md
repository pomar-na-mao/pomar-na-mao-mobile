## Context

The three field-work route providers currently own their structural-data startup reads. Inspection requests zones, occurrence types, and varieties; annotation requests zones and occurrence types; spraying requests zones. These requests repeat table reads and happen only after navigation. The app already has a root `QueryClientProvider`, Expo Network, and Material Icons, so readiness can be established without a new dependency or remote contract.

The feature providers also restore local operation state and request location permission on mount. Those responsibilities are unrelated to structural-data readiness and must continue after the remote option reads move to the field-work screen.

## Goals / Non-Goals

**Goals:**

- Fetch each required structural resource when `field-works` is focused.
- Compute loading, ready, and unavailable states independently for each card.
- Prevent navigation while a card is not ready and make unavailable state visible and accessible.
- Reuse the preload across route transitions without another Supabase option request.
- Allow transient failures and empty responses to be retried when the menu is revisited.

**Non-Goals:**

- Changing Supabase tables, RLS, RPCs, migrations, or API contracts.
- Automatically downloading plants without an explicit zone selection on the loaded-data card.
- Replacing existing SQLite operation recovery, local work persistence, or synchronization behavior.

## Decisions

### Cache structural resources separately with TanStack Query

Create shared query definitions for zones, occurrence types, and varieties, each with a stable query key and a normalized result. The field-work readiness hook starts these queries together and combines their states as follows:

| Card       | Required non-empty resources       |
| ---------- | ---------------------------------- |
| Inspection | zones, occurrence types, varieties |
| Annotation | zones, occurrence types            |
| Spraying   | zones                              |

Separate resource queries avoid repeated reads and preserve independent availability. For example, an occurrence-type failure does not make spraying unavailable when zones loaded successfully.

### Persist successful structural resources with AsyncStorage

Each successful zones, occurrence-types, or varieties response is serialized under a separate AsyncStorage key. Separate keys avoid read-modify-write races while the three Supabase queries run in parallel. On field-work startup, persisted resources hydrate the TanStack Query cache before readiness is evaluated or online requests are enabled.

Persisted non-empty resources enable their dependent cards when the app restarts offline. When online, hydrated resources remain subject to mount-time remote validation and successful responses replace their persisted values. Invalid or unreadable persisted values are ignored rather than blocking startup.

Alternative considered: invoke the existing inspection, annotation, and spraying repository option methods in parallel. That would move the timing but would still request zones and occurrence types multiple times and make per-resource failures harder to classify.

### Treat the field-work screen as the only remote option loader

The route providers will initialize their option state from the shared query cache and remove their mount-time Supabase option calls. Inspection, annotation, and spraying will continue to restore local workflow state, initialize GPS, and fetch plants after explicit user selections.

The shared data layer will expose route-specific adapters so existing domain types remain intact. Normal navigation guarantees a ready cache because disabled cards cannot push a route. A direct route with no preload must not silently start a duplicate option request; it will receive empty option state and remain unable to start option-dependent work.

Alternative considered: let each provider call the same `useQuery` hook. A stale query could refetch on route mount, which would retain the loading behavior this change removes.

### Derive card state from network and required query results

A card is `loading` while network reachability or an online request for any required resource is unresolved. It is `unavailable` when a required request fails, a required resource resolves to an empty array, or the device is offline without every required resource already cached. It is `ready` while all required resources are non-empty, including when those resources were loaded earlier in the current app process and the device is now offline.

When online, cached structural data is validated remotely when the field-work screen mounts, and cards remain loading while that validation is in progress. When explicitly offline, no remote validation is attempted and complete non-empty cached resources remain usable. Missing, failed, or empty dependencies disable only the affected cards.

Cards are disabled in both `loading` and `unavailable` states. Loading uses a progress treatment; unavailable uses the Material Icons `cloud-off` glyph and an accessibility label that communicates the reason. An offline state changes missing or unresolved resources to unavailable but does not override complete cached resources.

Alternative considered: represent all non-ready states with the offline glyph. Distinguishing pending work from a completed failure prevents a normal startup delay from appearing to be a connectivity error.

### Retry on field-work focus and reconnection

The first screen mount starts all structural queries. On later focus events, only failed or empty resources are refetched when the device is online. Successful non-empty resources remain cached, so retrying one dependency does not repeat every table read.

While the field-work screen remains mounted, the network listener also detects an offline-to-online transition. Queries that were disabled while offline start automatically, and failed or empty cached resources are refetched so card readiness updates without requiring navigation or an app restart.

Alternative considered: add a retry button to each card. Focus-based retry keeps the card layout simple and recovers naturally after the user restores connectivity and returns to the menu.

## Risks / Trade-offs

### Persist zone plant snapshots in shared SQLite storage

The loaded-data card replaces the weather card and opens a zone selector. An explicit load requests the existing plant RPC, then atomically replaces that zone's local snapshot, including occurrence data and load timestamp. Multiple zones may coexist.

Inspection filters the selected zone snapshot locally, including the optional occurrence criterion. Spraying lists only loaded zones and reads the selected snapshot locally. Neither route requests plants from Supabase, which keeps both workflows usable after an app restart without internet. Inspection and spraying additionally require a non-empty plant snapshot; annotation remains independent.

- [Network reachability can briefly be unknown on startup] -> Keep cards in loading state until reachability or query results establish a definitive state.
- [The operating system can report an active network while Supabase is unreachable] -> Require a successful resource fetch on field-work mount and keep cards disabled during validation or after a refetch error.
- [A valid resource table is intentionally empty] -> Treat it as unavailable as requested; tests will verify the dependency mapping per card.
- [Direct navigation bypasses the menu] -> Do not issue hidden route-startup requests; option-dependent actions remain unavailable until the normal preload has populated the cache.
- [Existing provider tests assume remote calls on mount] -> Replace those assertions with cache-seeding tests while retaining local restoration and location tests.
- [Structural data changes during a long-running app session] -> Retry unavailable resources on focus; successful resource refresh policy remains explicit in the shared query configuration rather than route-specific.

## Migration Plan

1. Add the shared structural-resource query definitions, readiness hook, route adapters, and tests.
2. Update `field-works` to load readiness, disable cards, and render loading/unavailable feedback.
3. Update each feature provider to consume the preloaded snapshot and remove only its mount-time remote option read.
4. Run focused UI/provider tests, TypeScript validation, and lint.

Rollback consists of restoring provider-owned option reads and removing the field-work readiness hook. No database or persisted-data rollback is required.

## Open Questions

None. The dependency mapping follows the structural collections currently loaded by each feature.
