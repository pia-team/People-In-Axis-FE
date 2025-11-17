# Pool CVs Combined Filtering Report

## Summary

Enabled combined filtering for `/pool-cvs` endpoint. The API now supports any combination of:
- `q` (text search)
- `minExperience` and `maxExperience`
- `active`

All provided filters are applied together with AND semantics. Null/empty parameters are ignored. Pagination and sorting remain unchanged.

## Backend Changes

- Controller: `PoolCVController.getPoolCVs`
  - If any filter param is present, delegates to combined search; otherwise returns all for company.

- Service: `PoolCVService.searchCombined(companyId, active, minYears, maxYears, q, pageable)`
  - Read-only, role-protected, returns `Page<PoolCVResponse>`.

- Repository: `PoolCVRepository.searchCombined(companyUuid, active, minYears, maxYears, query, pageable)`
  - JPQL with null-safe AND conditions on all filters.

## Validation Examples

1. Text search only
   - `GET /pool-cvs?q=Java`
   - Returns all Pool CVs containing "Java" in first/last name, email, current position, or current company.

2. Experience range only
   - `GET /pool-cvs?minExperience=2&maxExperience=5`
   - Returns Pool CVs with 2–5 years of experience.

3. Active only
   - `GET /pool-cvs?active=true`
   - Returns only active Pool CVs.

4. Combined filters
   - `GET /pool-cvs?q=React&active=true&minExperience=3&maxExperience=7`
   - Returns only active Pool CVs matching text search and within the experience range.

## Compatibility

- Query parameters are unchanged.
- Pagination and sorting preserved.
- No frontend changes required.

## Files Updated

- BE: `PoolCVController.java`
- BE: `PoolCVService.java`
- BE: `PoolCVRepository.java`
