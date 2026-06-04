## Context

The inspection modal currently exposes `add_occurrence`, `update_occurrence`, `resolve_occurrence`, and `remove_occurrence`. Recent offline work already projects local occurrence state for add/remove/update/resolve, but the business workflow now needs only two field decisions: register an occurrence or remove an occurrence.

The database architecture document also describes item `20.2` with four inspection change types and SQL examples that branch on update/resolve. That document must be updated with the code change so the app behavior and database summary stay aligned.

## Goals / Non-Goals

**Goals:**

- Restrict inspection occurrence actions to `add_occurrence` and `remove_occurrence`.
- Remove update/resolve options from the nearest-plant modal and tests.
- Narrow TypeScript change types, local projection logic, sync payload expectations, and RPC-facing examples to add/remove.
- Document the simplified inspection flow in `database-and-features-organization.md` under item `20.2`.

**Non-Goals:**

- Redesigning the modal layout beyond removing action options.
- Changing the underlying remote table schema.
- Adding a separate occurrence-resolution workflow outside inspection.
- Migrating historical local rows that may already contain update/resolve change types on installed devices.

## Decisions

1. Keep `remove_occurrence` as the only closing action.

   Remove will represent the inspection decision that an occurrence should no longer be open for the plant. Alternative considered: keep resolve and hide remove, but the requested workflow explicitly keeps remove and removes resolve.

2. Narrow `InspectionChangeType`.

   The app should remove `update_occurrence` and `resolve_occurrence` from the inspection union type so unsupported actions fail at compile time. Alternative considered: keep the broad type and only hide UI options. That would leave stale implementation branches and tests for unavailable behavior.

3. Keep notes and severity fields on add/remove payloads.

   Add still needs severity/notes. Remove can keep notes/location metadata for audit even if severity is not meaningful. Alternative considered: remove severity/notes for removal, but that creates additional UI branching without being required for this simplification.

4. Update documentation after code behavior is changed.

   `database-and-features-organization.md` should be updated in section `20.2` to show only add/remove in local tables, payload types, RPC examples, and sync outcomes. Alternative considered: document a future database cleanup separately, but the user requested this document update as part of the same change.

## Risks / Trade-offs

- Existing pending inspections with update/resolve rows -> The new app flow will not create them, but historical rows may still sync if already present. Tests should focus on new behavior rather than a migration.
- RPC still accepts update/resolve in deployed SQL -> The app can stop sending them; documentation should recommend add/remove-only SQL branches.
- "Remove" may be semantically broader than "resolve" -> Use removal as the unified close action and document that it closes the occurrence for inspection purposes.
