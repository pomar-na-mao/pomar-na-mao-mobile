## Context

The spraying feature already caches zone plants in `local_plants` through
`cacheZonePlants`, and `getZonePlants` can reload them from SQLite. The problem
is that `selectedZone` and `selectedZonePlants` live only in React state when no
spraying operation exists. On app restart, `refresh()` restores recoverable
operations but does not restore the previously loaded idle zone.

The screen currently shows the delete action only for an active aggregate. If
the user loaded plants but has not started an operation, there is no explicit way
to clear that loaded map state.

## Goals / Non-Goals

**Goals:**

- Restore the last loaded spraying zone and cached plants after app restart.
- Keep selected zone plants available for map display and setup while no active
  operation exists.
- Clear the persisted loaded-zone state only when the user explicitly deletes
  the local spraying state or loads a different zone.
- Keep active/recoverable spraying operations as the authoritative state when
  they exist.

**Non-Goals:**

- Changing Supabase RPCs, remote tables, or sync payload contracts.
- Persisting a separate copy of plant coordinates outside the existing local
  plant cache.
- Changing spraying review semantics for candidate or confirmed plants.

## Decisions

### Persist only the loaded zone identity

Store the last loaded spraying zone `{ id, name }` in a small local persistence
helper. On startup, read that identity and call `repository.local.getZonePlants`
to hydrate `selectedZonePlants` from SQLite.

Alternative considered: create a new SQLite table containing the loaded plants.
That duplicates data already held in `local_plants` and creates another cache to
keep consistent.

### Prefer the active aggregate over restored idle zone state

When `refresh()` finds a recoverable spraying operation, the aggregate and its
plants remain the source of truth. The persisted loaded-zone identity is only
used when no active aggregate is recovered.

Alternative considered: always restore the last loaded zone before operation
recovery. That can briefly show stale idle plants before the aggregate replaces
them.

### Make deletion clear loaded idle plants too

The screen delete action should be available when either an active local
spraying aggregate exists or a zone has loaded plants. If only idle plants are
loaded, confirming delete clears the persisted selected zone and in-memory
plants. If an aggregate exists, the existing aggregate deletion remains
transactional and also clears the persisted loaded-zone state.

Alternative considered: leave delete available only for aggregates. That would
make loaded plants persistent but not explicitly removable before starting an
operation.

## Risks / Trade-offs

- [Persisted zone exists but plants are missing from SQLite] -> Do not restore
  the zone if `getZonePlants` returns an empty list; leave the screen empty and
  let the user reload.
- [Zone name changes remotely] -> Replacing the zone by loading from the modal
  updates the stored `{ id, name }`; the persisted label is only a convenience
  for local continuity.
- [Delete could remove more than the user expects] -> Keep the confirmation
  modal and message explicit that loaded plants/local spraying state will be
  cleared.
