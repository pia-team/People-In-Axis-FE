# Position Combined Filtering

## Summary

Positions endpoint now supports combined, null-safe filtering with AND semantics on:
- status (enum)
- department (text, case-insensitive)
- location (text, case-insensitive)
- q (text, case-insensitive; matches title and description)

Unauthenticated users continue to receive public active positions.
Requests without a companyId return an empty page with a warning log.
Pagination and sorting preserved.

## Backend Changes

- Controller: `PositionController.getPositions`
  - Trims/validates params and routes to combined search when any valid filter is present.
  - Fallback to `getPositions(companyId)` when no filters.
- Service: `PositionService.searchCombinedPositions(companyId, status, department, location, q, pageable)`
  - Implemented via JPA Specifications with `lower(field) like %value%` for case-insensitivity.
- Repository: `PositionRepository` now extends `JpaSpecificationExecutor<Position>`.

## Examples

- `/positions` → all positions (company)
- `/positions?status=ACTIVE` → active only
- `/positions?location=Berlin` → location contains “berlin”
- `/positions?department=IT&status=ACTIVE` → active IT positions
- `/positions?q=Manager&status=INACTIVE&location=Paris` → inactive, location contains “paris”, title/description contains “manager”

## Notes

- UI already consumes totals for pagination; no changes required for params.
- If a global distinct departments endpoint is needed, consider adding `/positions/departments` later.
