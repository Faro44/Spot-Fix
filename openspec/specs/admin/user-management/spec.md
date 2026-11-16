# User and Role Administration Specification

## Purpose
Enables platform administrators to manage user accounts, assign authorized roles, and enforce security policies across the institution.

## Requirements

### Requirement: Role Granting and Revocation
The system SHALL grant system administrators exclusive privileges to assign, modify, and revoke user roles (Usuario, Directivo Autorizado, Administrador).

#### Scenario: Admin assigns director role
- **WHEN** an administrator assigns the "Directivo Autorizado" role to a faculty member's institutional email
- **THEN** the system updates user permissions and grants immediate access to the supervision portal upon next login

#### Scenario: Revoking administrative privileges
- **WHEN** an administrator revokes a director role returning the account to standard user status
- **THEN** the system invalidates active privileged sessions and restricts subsequent access to standard user capabilities

