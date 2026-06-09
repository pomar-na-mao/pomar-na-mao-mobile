# annotation-gps-position Specification

## Purpose
TBD - created by archiving change implement-annotation-feature. Update Purpose after archive.
## Requirements
### Requirement: GPS position annotation

The annotation workflow SHALL save annotations against the captured GPS point without requiring a local nearest-plant assignment.

#### Scenario: User saves annotation position

- **WHEN** the user saves an annotation with a current GPS point
- **THEN** the app SHALL persist annotation latitude, longitude, and GPS accuracy
- **AND** it SHALL leave local plant assignment and assigned distance empty

### Requirement: No local plant requirement

The annotation workflow SHALL NOT require the user to confirm or correct a nearest plant before saving.

#### Scenario: No plant is available locally

- **WHEN** occurrence type and current GPS position are available
- **THEN** the app SHALL allow the annotation to be saved even if no local plant cache exists

### Requirement: GPS quality context

The annotation workflow SHALL expose captured GPS accuracy so the user can judge the annotation quality.

#### Scenario: GPS accuracy exists

- **WHEN** the current location includes GPS accuracy
- **THEN** the annotation modal SHALL show the GPS accuracy before saving

### Requirement: Server-side nearest plant resolution

The annotation workflow SHALL rely on synchronization to resolve the nearest plant from the saved annotation coordinates.

#### Scenario: Annotation is synchronized

- **WHEN** a local annotation without plant id is synchronized
- **THEN** the Supabase RPC SHALL find the nearest plant from the annotation latitude and longitude

