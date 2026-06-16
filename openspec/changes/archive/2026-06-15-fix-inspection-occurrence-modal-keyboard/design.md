## Context

`NearestPlantModal` currently renders a centered transparent `Modal` with a
`Pressable` overlay, an inner content card, and a `ScrollView`. It does not use
`KeyboardAvoidingView`, and its action buttons live inside the same scrollable
content. In deployed mobile builds, the native keyboard can cover the bottom of
the modal, hiding the notes/save area.

`SprayingSetupModal` already solves this interaction with a `KeyboardAvoidingView`
around the overlay, a bounded content card, a scroll view using
`keyboardShouldPersistTaps="handled"` and `keyboardDismissMode="on-drag"`, and
footer actions outside the scrollable form.

## Goals / Non-Goals

**Goals:**

- Make the inspection occurrence modal usable when the keyboard is visible in
  deployed builds.
- Align the inspection modal keyboard behavior with `SprayingSetupModal`.
- Preserve all current nearest-plant information, add/remove actions, validation,
  and save behavior.
- Cover the behavior with focused component tests.

**Non-Goals:**

- Redesigning the visual language of inspection modals beyond keyboard-safe
  layout changes.
- Changing the inspection occurrence domain model, sync payload, SQLite schema,
  or Supabase contract.
- Changing dropdown behavior globally.

## Decisions

### Reuse the spraying setup modal structure

The inspection modal will wrap its overlay/content in `KeyboardAvoidingView`
with `Platform.OS === 'ios' ? 'padding' : 'height'`, matching the spraying setup
modal. This is a narrow, already-proven local pattern and avoids introducing a
new shared modal abstraction for one fix.

Alternative considered: tune only `maxHeight` and padding on the current
`ScrollView`. That does not reliably account for keyboard resize behavior in
deployed native builds.

### Keep footer actions outside the scrollable content

The nearest-plant details and form fields will remain scrollable, while the
close/save footer will remain visible at the bottom of the card whenever the
modal card is visible. The scroll container will receive bottom padding so the
last editable field can scroll above the footer and keyboard.

Alternative considered: keep buttons inside the scroll body. That can still hide
the save button below the keyboard on smaller devices.

### Preserve overlay dismissal behavior

The outer overlay may still close the modal, but tapping inside the modal content
must not propagate to the overlay. The change should not introduce accidental
closes while selecting dropdowns or editing text.

## Risks / Trade-offs

- [Dropdowns inside a keyboard-aware scroll can lose taps] -> Set
  `keyboardShouldPersistTaps="handled"` on the scroll view.
- [Footer consumes vertical space on small screens] -> Keep the card bounded with
  `maxHeight`, `minHeight: 0`, and `flexShrink` on the scroll view so details
  remain reachable.
- [Platform-specific keyboard behavior differs] -> Use the same iOS/Android
  behavior split already used by the spraying setup modal.
