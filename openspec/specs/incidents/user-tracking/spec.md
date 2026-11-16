# User Tracking and Self-Service Specification

## Purpose
Allows users to consult the history, status, and timeline of their own reported incidents, as well as modify or cancel reports before processing begins.

## Requirements

### Requirement: Personal Report History
The system SHALL provide each user with a personalized view listing all incidents they have submitted, including creation dates, current status, and recent update timestamps.

#### Scenario: User queries personal reports
- **WHEN** an authenticated user opens their personal reports screen
- **THEN** the system returns all incidents originated by that user sorted by creation date

### Requirement: Report Editing and Cancellation in Received State
The system SHALL permit the reporter to edit the content or cancel an incident while its status remains "recibida", and MUST prevent modification or cancellation once the status transitions to "en proceso" or beyond.

#### Scenario: Editing an incident in recibida status
- **WHEN** a user updates the description of a report that is currently in "recibida" status
- **THEN** the system saves the changes and updates the last modification timestamp

#### Scenario: Attempting to edit an incident in process
- **WHEN** a user attempts to edit or cancel an incident that has moved to "en proceso" status
- **THEN** the system rejects the operation and indicates that the report is locked for review

