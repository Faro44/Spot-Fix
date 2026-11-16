# Duplicate Detection and Endorsement Specification

## Purpose
Mitigates redundant reports by alerting users to existing nearby incidents and providing an endorsement mechanism to measure community impact.

## Requirements

### Requirement: Duplicate Incident Warning
The system SHALL detect potential duplicate reports matching the selected category and location, alerting the reporter prior to final submission.

#### Scenario: Potential duplicate detected during submission
- **WHEN** a user selects a location and category where an active incident is already open
- **THEN** the system displays a list of matching open reports with an option to view them

### Requirement: Community Endorsement Support
The system SHALL enable authenticated users to support or upvote an existing incident report to increment its community impact counter without duplicating records.

#### Scenario: User supports an existing incident
- **WHEN** a user confirms support for an existing active report
- **THEN** the system increments the affected user tally and registers the user as an interested party

