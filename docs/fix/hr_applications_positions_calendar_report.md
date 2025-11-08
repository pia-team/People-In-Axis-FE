# HR Applications & Positions Filters + Calendar Report

Date: 2025-11-08

## Summary
This change set fixes backend filtering for Applications with combined parameters, ensures Applications and Positions tables have functional filters, and provides a clean, read-only calendar view for company-wide meetings with working Month/Week/Day views.

## Backend (Applications Filtering)
- Modified: src/main/java/com/pia/cvsharing/controller/ApplicationController.java
  - GET /applications now supports combined filters: `positionId`, `status`, `q` (search)
  - Logic order:
    - positionId + q (+ optional status)
    - positionId + status
    - positionId
    - q (+ optional status)
    - status
    - none
- Modified: src/main/java/com/pia/cvsharing/service/ApplicationService.java
  - Added methods:
    - `getApplicationsByStatus(companyId, status, pageable)`
    - `getApplicationsByPositionAndStatus(positionId, companyId, status, pageable)`
    - `searchApplications(companyId, q, status, pageable)`
    - `searchApplicationsByPosition(companyId, positionId, q, status, pageable)`
- Modified: src/main/java/com/pia/cvsharing/repository/ApplicationRepository.java
  - Added queries:
    - `searchApplicationsWithStatus(companyUuid, status, query, pageable)`
    - `searchApplicationsByPosition(companyUuid, positionId, query, pageable)`
    - `searchApplicationsByPositionAndStatus(companyUuid, positionId, status, query, pageable)`

## Frontend (Applications)
- Modified: src/pages/cv-sharing/applications/ApplicationList.tsx
  - Search and Status filter reset pagination to page 0 to refetch immediately
  - Query sends `status` and `q` parameters (server-side pagination)

## Frontend (Positions)
- Modified: src/pages/cv-sharing/positions/PositionList.tsx
  - Department dropdown populated from live departmentService (with fallback)
  - Query sends `status`, `q`, and `department` to backend
  - Combined filters supported; refetch on Apply or state change

## Calendar (Meetings)
- New: src/pages/meetings/AllMeetingsCalendar.tsx
  - Read-only list-style calendar with Month/Week/Day toggle
  - Data from GET /meetings (company-wide)
  - CANCELLED meetings highlighted (default/gray chip)
- Modified: src/App.tsx
  - Route `/applications/:id/meetings` displays AllMeetingsCalendar

## Validation
- Backend
  - GET `/applications?status=NEW` returns only NEW
  - Combined `/applications?positionId=...&status=NEW&q=test` returns intersection
- Frontend
  - Applications: search+status work; instant refetch
  - Positions: Department dropdown populated; filters applied
  - Calendar: Month/Week/Day toggle works; no 404
- Roles
  - HR full access unchanged; other roles unaffected

## Files Changed (List)
- BE: ApplicationController.java, ApplicationService.java, ApplicationRepository.java
- FE: ApplicationList.tsx, PositionList.tsx, AllMeetingsCalendar.tsx, App.tsx

