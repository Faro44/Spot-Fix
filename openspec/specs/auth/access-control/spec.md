# Access Control and Privacy Specification

## Purpose
Enforces role-based permissions across system operations and protects sensitive personal information of reporters against unauthorized access.

## Requirements

### Requirement: Role-Based Authorization
The system SHALL restrict access to endpoints, views, and actions based on the authenticated user's assigned role (Usuario, Directivo Autorizado, or Administrador).

#### Scenario: Unauthorized access attempt
- **WHEN** a standard user attempts to access administrative or supervision modules
- **THEN** the system denies access and responds with an authorization forbidden error

#### Scenario: Authorized director access
- **WHEN** an authorized director accesses the incident review dashboard
- **THEN** the system displays privileged management operations

### Requirement: Reporter Identity Privacy
The system SHALL conceal the personal identifying information of report submitters from unauthorized viewers and public queries.

#### Scenario: Public or regular user inspection
- **WHEN** a standard user views a public or duplicated incident summary
- **THEN** the system omits the reporter's personal details and contact data

#### Scenario: Privileged director inspection
- **WHEN** an authorized director inspects an incident detail
- **THEN** the system reveals the reporter identity for official contact and resolution

