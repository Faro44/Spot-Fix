# Status Alerts and Notifications Specification

## Purpose
Dispatches timely alerts across multiple communication channels to keep reporters informed about updates, status changes, and resolutions of their incidents.

## Requirements

### Requirement: Automated Status Change Alerts
The system SHALL dispatch automated notifications to the reporting user whenever the status of their incident transitions, supporting in-app alert badges and institutional email notifications.

#### Scenario: Status changes to in process
- **WHEN** an incident status transitions to "en proceso"
- **THEN** the system generates an in-app notification and queues an email notification to the reporter's institutional address

#### Scenario: Incident marked as solved
- **WHEN** an incident status transitions to "solucionada"
- **THEN** the system delivers a notification containing the resolution summary to the submitter

