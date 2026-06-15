## MODIFIED Requirements

### Requirement: Sync RPC call

The app SHALL call `sync_manual_inspection` with the inspection payload, and the RPC SHALL persist an append-only event for every occurrence change it successfully applies.

#### Scenario: Sync starts

- **WHEN** the app has a valid inspection sync payload
- **THEN** it SHALL call the Supabase RPC `sync_manual_inspection`

#### Scenario: Add action creates an occurrence

- **WHEN** the payload contains `add_occurrence` and no matching open occurrence exists
- **THEN** the RPC SHALL create the occurrence and an `added` event linked to the inspection operation

#### Scenario: Add action updates an existing occurrence

- **WHEN** the payload contains `add_occurrence` and a matching open occurrence exists
- **THEN** the RPC SHALL update the occurrence without replacing its creation operation
- **AND** it SHALL create an `updated` event linked to the inspection operation

#### Scenario: Remove action sync starts

- **WHEN** the payload contains a `remove_occurrence` change for an existing open occurrence
- **THEN** the RPC SHALL close that occurrence without replacing its creation operation
- **AND** it SHALL create a `removed` event linked to the inspection operation

#### Scenario: Offline add then remove is synchronized

- **WHEN** the payload contains an add followed by a remove for the same plant and occurrence type
- **THEN** the RPC SHALL process both rows chronologically
- **AND** it SHALL persist both events with their stable local change IDs
