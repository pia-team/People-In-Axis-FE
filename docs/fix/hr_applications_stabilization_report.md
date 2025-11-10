# HR Applications Stabilization Report

Date: 2025-11-08

## Scope
Stabilize CV Sharing → Applications by fixing non-functional filters and enabling missing delete/cancel actions. Adds a company-wide meetings calendar view.

## Modified Files (Backend)
- src/main/java/com/pia/cvsharing/controller/FileController.java
  - DELETE /files/{fileId}: roles extended to HUMAN_RESOURCES, COMPANY_MANAGER, EMPLOYEE; returns `{ success: true, message: "File deleted" }`.
  - Added GET /files/applications/{applicationId}/files to list files (already wired earlier).
- src/main/java/com/pia/cvsharing/controller/MeetingController.java
  - PATCH/DELETE endpoints now permit HUMAN_RESOURCES, COMPANY_MANAGER, EMPLOYEE.
- src/main/java/com/pia/cvsharing/controller/AllMeetingsController.java (NEW)
  - GET /meetings: lists company-wide meetings for current user.
- src/main/java/com/pia/cvsharing/repository/MeetingRepository.java
  - Added `findByCompanyId(UUID companyId)` with JPQL query.
- src/main/java/com/pia/cvsharing/controller/ApplicationController.java
  - GET /applications/{id}/files provided to list application files (mirrors Files controller list).

## Modified Files (Frontend)
- src/pages/cv-sharing/applications/ApplicationList.tsx
  - Status filter + search reset pagination to page 0 to refetch instantly.
- src/pages/cv-sharing/applications/ApplicationDetail.tsx
  - File list: added Delete action with confirmation; calls DELETE /files/{fileId}, refreshes query.
  - Meetings list: added Cancel Meeting action; PATCH status to CANCELLED, refreshes query.
  - Fixed JSX structure for Status selector.
- src/services/cv-sharing/applicationService.ts
  - Added deleteFile() to call DELETE /files/{fileId}.
  - Added getCompanyMeetings() to call GET /meetings.
  - Relaxed updateMeeting() payload typing to accept status updates.
- src/pages/meetings/AllMeetingsCalendar.tsx (NEW)
  - Read-only company-wide meetings grouped by date with Month/Week/Day views.
- src/App.tsx
  - Registered route /applications/:id/meetings → AllMeetingsCalendar.
  - Preserved existing cv-sharing per-application scheduler routes.

## Endpoints Verified/Added
- GET /applications?status={status}&q={search}
  - FE consumes via ApplicationList useQuery; instant update on dropdown/search changes.
- DELETE /files/{fileId}
  - Roles: HUMAN_RESOURCES, COMPANY_MANAGER, EMPLOYEE.
  - Response: `{ success: true, message: "File deleted" }`.
- PATCH /applications/{applicationId}/meetings/{meetingId}
  - Body: `{ "status": "CANCELLED" }` supported; roles include EMPLOYEE.
- GET /meetings
  - Returns company-wide meetings for the authenticated user.

## Validation Checklist
- Status dropdown filters properly without page reload.
- File Delete removes DB record and file; UI list updates via query invalidation.
- Cancel Meeting sets status=CANCELLED; UI shows button disabled with label "Cancelled".
- No 404 from "Open Scheduler" (both /cv-sharing/... and /applications/:id/meetings exist).
- Role guards for ADMIN/SYSTEM_ADMIN untouched; HR, COMPANY_MANAGER, EMPLOYEE allowed as specified.

## Quick Test Steps
- Filter:
  - Go to /cv-sharing/applications → pick "New" → verify only NEW show. Type in search → combined filter applies.
- Files:
  - In Application Detail, upload files; then delete one; confirm success and list refresh.
  - Network: DELETE /files/{fileId} returns 200 with success body.
- Meetings:
  - Schedule a meeting then Cancel via button → status becomes CANCELLED; reload persists.
- Calendar:
  - Open /applications/{someId}/meetings → page renders company meetings grouped by date.

## Notes
- If backend filtering by `status` was missing previously, ensure ApplicationController query integrates optional status param. FE already sends `status` and `q`.
- Minor lint: an unused import warning remains for `standardDataGridSx` in ApplicationList; it is harmless and can be removed if desired.
