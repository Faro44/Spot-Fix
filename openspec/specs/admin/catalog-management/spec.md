# Catalog Management Specification

## Purpose
Provides system administrators with tools to maintain master data catalogs including incident categories and hierarchical institutional locations.

## Requirements

### Requirement: Master Catalog Administration
The system SHALL enable system administrators to create, edit, activate, and deactivate incident categories as well as hierarchical location structures (building, floor, room/area).

#### Scenario: Admin creates a new physical location
- **WHEN** an administrator creates a new building with corresponding floors and classroom identifiers
- **THEN** the system validates uniqueness and makes the location available for user report submissions

#### Scenario: Deactivating an obsolete category
- **WHEN** an administrator deactivates an existing incident category
- **THEN** the system hides the category from future report submissions while preserving historical associations in past reports

