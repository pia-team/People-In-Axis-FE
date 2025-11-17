# Pool CVs Filter Condition Fix Report

## Overview

Refined `PoolCVController.getPoolCVs` to correctly detect valid filters and route to combined search, handling edge cases:
- Whitespace/empty `q` is ignored
- Single-sided experience (only min or only max) is supported
- `active=false` is treated as a valid filter (not ignored)
- When no valid filters are provided → unfiltered list is returned

## Updated Controller Logic

- Trim and validate `q` using `isBlank()` and `trim()` before using it:
  - `trimmedQ = (q != null && !q.isBlank()) ? q.trim() : null`
- Detect filter presence:
  - `hasAnyFilter = hasQ || hasMin || hasMax || hasActive`
- Behavior:
  - If `hasAnyFilter` → `poolCVService.searchCombined(companyId, active, min, max, trimmedQ, pageable)`
  - Else → `poolCVService.getPoolCVs(companyId, pageable)`

## Repository Behavior (Summary)

- `PoolCVRepository.searchCombined` applies AND semantics while ignoring null parameters:
  - `(:active IS NULL OR p.isActive = :active)`
  - `(:minYears IS NULL OR p.experienceYears >= :minYears)`
  - `(:maxYears IS NULL OR p.experienceYears <= :maxYears)`
  - `(:query IS NULL OR ... text fields LIKE '%:query%')`
- Pagination and sorting are preserved.

## Examples

| Request | Expected Behavior |
|--------|--------------------|
| `/pool-cvs` | Return all CVs (unfiltered) |
| `/pool-cvs?active=true` | Only active CVs |
| `/pool-cvs?minExperience=2` | CVs with experience ≥ 2 |
| `/pool-cvs?maxExperience=5` | CVs with experience ≤ 5 |
| `/pool-cvs?minExperience=2&maxExperience=5&active=false` | Inactive CVs with 2–5 years |
| `/pool-cvs?q=React&active=true` | Active CVs mentioning "React" |

## Notes

- Case-insensitive search can be enabled using Postgres `ILIKE` if desired. Current implementation uses `LIKE` to avoid `LOWER(bytea)` issues.
