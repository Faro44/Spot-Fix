# Incident Submission Specification

## Purpose
Enables institutional students and staff to register reports of infrastructure issues or equipment failures with descriptive details and optional evidence photographs.

## Requirements

### Requirement: Incident Report Creation
The system SHALL allow authenticated users to submit incident reports containing mandatory category, hierarchical location, detailed textual description, and an optional photographic attachment in at most 3 steps and under 2 minutes.

#### Scenario: Valid incident submission
- **WHEN** a user fills all mandatory fields (category, location, description) and submits the form
- **THEN** the system persists the report with an initial status of "recibida" and returns a unique confirmation identifier

#### Scenario: Missing mandatory fields
- **WHEN** a user submits a report without selecting a category or providing a description
- **THEN** the system rejects the submission and highlights the missing required fields

### Requirement: Image Attachment Compression and Limit
The system MUST compress uploaded photographic attachments and reject files exceeding 5 megabytes.

#### Scenario: Image within acceptable limits
- **WHEN** a user attaches an image under or equal to 5 megabytes
- **THEN** the system compresses the image and stores it securely associated with the incident

#### Scenario: Image exceeding size threshold
- **WHEN** a user uploads an image larger than 5 megabytes
- **THEN** the system rejects the upload with an explicit file size warning

