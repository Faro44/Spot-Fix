# Status Workflow and Assignment Specification

## Purpose
Governs the lifecycle state machine of incidents, prioritization, department assignment, and auditable tracking of all status modifications.

## Requirements

### Requirement: Status Lifecycle Transitions
The system SHALL support incident state transitions through defined statuses: "recibida", "en proceso", "solucionada", and "no procedente", requiring an update timestamp and resolution notes upon completion or rejection.

#### Scenario: Advancing status to in process
- **WHEN** an authorized director moves an incident from "recibida" to "en proceso"
- **THEN** the system updates the record state, records the transition date, and notifies the reporter

#### Scenario: Closing an incident as solved
- **WHEN** a director marks an incident as "solucionada" with closing remarks
- **THEN** the system stores the resolution notes, records the final resolution date, and updates the status

### Requirement: Priority Assignment
The system SHALL allow authorized directors to assign and modify priority levels (alta, media, or baja) for each incident based on risk and operational impact.

#### Scenario: Setting incident priority
- **WHEN** a director assigns high priority to an infrastructure failure
- **THEN** the system updates the incident priority level and reflects it across sorting algorithms

### Requirement: Department and Staff Assignment
The system SHALL permit authorized directors to assign an incident to a specific operational department or responsible personnel member.

#### Scenario: Assigning to maintenance team
- **WHEN** a director assigns an incident to the maintenance department and specifies a technician
- **THEN** the system records the responsible party and associates future actions with that assignment

### Requirement: Immutable Audit Trail
The system MUST record an immutable audit entry for every status change, logging the acting user, exact timestamp, prior state, new state, and reason.

#### Scenario: State modification logging
- **WHEN** any incident state transition occurs
- **THEN** the system writes an audit log record containing user identifier, date, time, and transition metadata

