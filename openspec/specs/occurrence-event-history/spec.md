# occurrence-event-history Specification

## Purpose
TBD - created by archiving change persist-occurrence-event-history. Update Purpose after archive.
## Requirements
### Requirement: Append-only occurrence event records

The database SHALL persist each successfully applied occurrence mutation as an immutable row in `plant_occurrence_events`.

#### Scenario: New occurrence is created

- **WHEN** an occurrence writer inserts a new `plant_occurrences` row
- **THEN** it SHALL insert an `added` event linked to the occurrence, plant, occurrence type, and field operation
- **AND** the event SHALL include the mutation timestamp and resulting occurrence values

#### Scenario: Existing occurrence is updated

- **WHEN** an occurrence writer changes mutable values on an existing open occurrence
- **THEN** it SHALL insert an `updated` event with the previous and resulting values

#### Scenario: Existing occurrence is removed

- **WHEN** an occurrence writer closes an existing open occurrence
- **THEN** it SHALL insert a `removed` event with the previous open state and resulting closed state

#### Scenario: Mutation fails to record its event

- **WHEN** an event insertion fails during an occurrence-writing RPC
- **THEN** the occurrence mutation and enclosing field operation changes SHALL roll back

### Requirement: Stable occurrence creation attribution

`plant_occurrences.field_operation_id` SHALL identify the operation that created the occurrence and SHALL NOT be overwritten by later update or removal operations.

#### Scenario: Later operation removes an occurrence

- **WHEN** an operation removes an occurrence created by an earlier operation
- **THEN** the occurrence SHALL retain the earlier creation operation ID
- **AND** the removal event SHALL reference the later operation ID

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

### Requirement: Polygon occurrence event history

`sync_polygon_bulk_update` SHALL record the actual occurrence mutation applied to each selected plant.

#### Scenario: Polygon adds a missing occurrence

- **WHEN** `occurrenceAction` is `add` and no matching open occurrence exists
- **THEN** the RPC SHALL create the occurrence and an `added` event

#### Scenario: Polygon updates an existing open occurrence

- **WHEN** `occurrenceAction` is `add` and a matching open occurrence already exists
- **THEN** the RPC SHALL update the occurrence without replacing its creation operation
- **AND** it SHALL create an `updated` event

#### Scenario: Polygon removes an existing open occurrence

- **WHEN** `occurrenceAction` is `remove` and a matching open occurrence exists
- **THEN** the RPC SHALL close the occurrence without replacing its creation operation
- **AND** it SHALL create a `removed` event

#### Scenario: Polygon removal finds no open occurrence

- **WHEN** `occurrenceAction` is `remove` and no matching open occurrence exists
- **THEN** the RPC SHALL NOT create an occurrence or event for that plant and occurrence type

### Requirement: Inspection operation event retrieval

`get_inspection_operations` SHALL expose the occurrence actions attributed to each inspection operation without removing its existing occurrence data.

#### Scenario: Desktop loads an inspection operation

- **WHEN** an inspection operation contains occurrence events
- **THEN** each plant object SHALL include an `occurrence_events` array ordered chronologically
- **AND** each event SHALL identify the occurrence type, action, timestamp, previous value, and new value
- **AND** the existing `occurrences` array SHALL remain available

#### Scenario: Inspection only removed an existing occurrence

- **WHEN** an inspection operation contains a removal event for an occurrence created by an earlier operation
- **THEN** the operation SHALL expose that removal in `occurrence_events` even when its `occurrences` array is empty

#### Scenario: Inspection added then removed an occurrence

- **WHEN** one inspection adds and later removes the same occurrence
- **THEN** `occurrence_events` SHALL contain both actions in chronological order

### Requirement: Occurrence event access control

The database SHALL enable RLS on `plant_occurrence_events` and SHALL restrict event writes to controlled backend RPCs.

#### Scenario: Client attempts direct event mutation

- **WHEN** an `anon` or authenticated client attempts a direct insert, update, or delete
- **THEN** the database SHALL deny the mutation

#### Scenario: Authorized desktop reads history

- **WHEN** an authenticated desktop client calls the supported history RPC
- **THEN** it SHALL receive the occurrence events permitted by that RPC

### Requirement: Versioned database contract

The repository SHALL version and document the deployed occurrence event table and all RPCs that write or return occurrence events.

#### Scenario: Database change is implemented

- **WHEN** occurrence event history is deployed
- **THEN** a Supabase migration SHALL define or reconcile the table, indexes, RLS, policies, grants, and changed RPCs
- **AND** `database.md` SHALL contain their complete current SQL contracts and event semantics

