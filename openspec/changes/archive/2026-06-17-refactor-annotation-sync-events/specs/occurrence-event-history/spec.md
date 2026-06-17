## MODIFIED Requirements

### Requirement: Idempotent occurrence events

Occurrence event writers SHALL use stable client identities to prevent duplicate events when a synchronization request is retried, while allowing multiple annotation events to share the same parent field operation.

#### Scenario: Inspection or annotation retry

- **WHEN** the same device and stable local change id are submitted again
- **THEN** the database SHALL NOT create a duplicate occurrence event

#### Scenario: Annotation retry reuses one remote operation

- **WHEN** an annotation synchronization request is retried with the same device id, the same local operation id, and the same local annotation id
- **THEN** the database SHALL reconcile the same remote `field_operation` by the local operation identity
- **AND** it SHALL keep occurrence and event idempotency tied to the local annotation identity

#### Scenario: Polygon retry

- **WHEN** the same polygon operation, plant, occurrence type, and action are submitted again from the same device
- **THEN** the database SHALL use a deterministic event identity and SHALL NOT create a duplicate occurrence event
