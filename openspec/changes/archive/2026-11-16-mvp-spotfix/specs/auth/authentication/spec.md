# User Authentication Specification

## Purpose
Provides secure identity verification for institution members, allowing students, faculty, and administrative staff to authenticate using institutional credentials.

## MODIFIED Requirements

### Requirement: Institutional Email Authentication
The system SHALL authenticate users using their institutional email address and encrypted password credentials over HTTPS connections.

#### Scenario: Successful login with valid credentials
- **WHEN** a registered user submits a valid institutional email and correct password
- **THEN** the system issues an authenticated session token and grants access according to their role

#### Scenario: Rejected login with invalid credentials
- **WHEN** an unauthenticated user submits invalid or unrecognized credentials
- **THEN** the system SHALL reject the login attempt with a generic error message

### Requirement: Session Management
The system SHALL manage active user sessions securely and terminate expired or logged out sessions.

#### Scenario: Explicit logout
- **WHEN** an authenticated user triggers the logout action
- **THEN** the system invalidates the active session token and redirects to the login screen
