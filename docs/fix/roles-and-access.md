# Roles & Access Guide

This document summarizes roles, what they do, which frontend pages they can access, and the backend API access rules. Users and roles are managed in Keycloak.

## Roles (Realm Roles)
- ADMIN
  - Full admin access, including destructive operations (most DELETE endpoints)
- SYSTEM_ADMIN
  - System-level admin. `/system-admin/**` requires SYSTEM_ADMIN or ADMIN
- HUMAN_RESOURCES
  - Can manage employees/companies/departments, approve timesheets/expenses, view reports
- TEAM_MANAGER
  - Can approve timesheets/expenses at team level, can create/update projects
- FINANCE
  - Can approve expenses and perform reimburse, can import/export expenses
- COMPANY_MANAGER
  - Can access company module and reports in UI (backend changes limited by endpoint rules)
- ACCOUNT_ADMIN
  - Access to `/user/**` with TEAM_MANAGER
- Authenticated (any logged-in user)
  - Some pages and GET endpoints are available to any authenticated user

Note: Realm roles appear in JWT at `realm_access.roles`. Backend maps them to `ROLE_<ROLE>`.

## Frontend — Pages and Role Requirements
Sources: `src/App.tsx`, `src/layouts/MainLayout.tsx`, `src/components/auth/PrivateRoute.tsx`

- General
  - `/login`, `/unauthorized`: Public
  - All other routes require authentication (PrivateRoute)
- Dashboard
  - `/dashboard`: Any authenticated user
- Profile
  - `/profile`: Any authenticated user
- Employees
  - Routes: `/employees`, `/employees/new`, `/employees/:id`, `/employees/:id/edit`
  - UI menu visible to: HUMAN_RESOURCES, ADMIN
- Companies
  - Routes: `/companies`, `/companies/new`, `/companies/:id`, `/companies/:id/edit`
  - UI menu visible to: COMPANY_MANAGER, ADMIN
- Departments
  - Routes: `/departments` ...
  - UI menu: Any authenticated user; backend rules apply for changes
- Projects
  - Routes: `/projects`, `/projects/new`, `/projects/:id`, `/projects/:id/edit`
  - UI menu: Any authenticated user (create/update is enforced by backend roles)
- Timesheets
  - List/Create: `/timesheets`, `/timesheets/new`, `/timesheets/:id`, `/timesheets/my` → Authenticated
  - Approval: `/timesheets/approval` → TEAM_MANAGER or HUMAN_RESOURCES
- Expenses
  - List/Create: `/expenses`, `/expenses/new`, `/expenses/:id`, `/expenses/my` → Authenticated
  - Approval: `/expenses/approval` → TEAM_MANAGER, HUMAN_RESOURCES, FINANCE
- Reports
  - `/reports`, `/reports/timesheet`, `/reports/expense`
  - UI menu visible to: HUMAN_RESOURCES, ADMIN, COMPANY_MANAGER
- Admin
  - `/admin`, `/admin/users`, `/admin/roles`, `/admin/settings` → ADMIN or SYSTEM_ADMIN

## Backend — API Role Rules (Summary)
Source: `src/main/java/com/pia/config/SecurityConfig.java`

- Public: `/swagger-ui/**`, `/v3/api-docs/**`, `/actuator/health`, `/public/**`
- Admin:
  - `/admin/**` → ADMIN
  - `/system-admin/**` → SYSTEM_ADMIN or ADMIN
- Management: `/management/**` → HUMAN_RESOURCES
- Company: GET `/companies/**` → Auth; POST/PUT → HUMAN_RESOURCES or ADMIN; DELETE → ADMIN
- User: `/user/**` → ACCOUNT_ADMIN or TEAM_MANAGER
- Employee: GET → Auth; POST/PUT → HUMAN_RESOURCES or ADMIN; DELETE → ADMIN
- Department: GET → Auth; POST/PUT → HUMAN_RESOURCES or ADMIN; DELETE → ADMIN
- Project: GET → Auth; POST/PUT → TEAM_MANAGER, HUMAN_RESOURCES, ADMIN; DELETE → ADMIN
- Timesheet:
  - GET `/timesheets/my/**` → Auth
  - GET `/timesheets/pending` → TEAM_MANAGER, HUMAN_RESOURCES
  - GET `/timesheets/export` → TEAM_MANAGER, HUMAN_RESOURCES
  - POST `/timesheets/import` → HUMAN_RESOURCES
  - POST `/timesheets/**` → Auth
  - POST `/timesheets/*/approve|reject` → TEAM_MANAGER, HUMAN_RESOURCES
- Expense:
  - GET `/expenses/my/**` → Auth
  - GET `/expenses/pending` → TEAM_MANAGER, HUMAN_RESOURCES, FINANCE
  - GET `/expenses/export` → HUMAN_RESOURCES, FINANCE
  - POST `/expenses/import` → HUMAN_RESOURCES, FINANCE
  - POST `/expenses/**` → Auth
  - POST `/expenses/*/approve|reject` → TEAM_MANAGER, HUMAN_RESOURCES, FINANCE
  - POST `/expenses/*/reimburse` → FINANCE

Note: Backend JWT roles are derived from Keycloak `realm_access.roles` → `ROLE_<ROLE>`.

## Users (Keycloak)
- There are no demo users seeded in code/DB. Create users and assign roles in Keycloak.
- Current Keycloak realm/client:
  - URL: `https://diam.dnext-pia.com`
  - Realm: `orbitant-realm`
  - Client (Public): `orbitant-ui-client`

## Tips
- UI menu visibility is filtered by role lists in `src/layouts/MainLayout.tsx`.
- Even if a route lacks an explicit FE guard, backend role rules always apply.
- To debug roles:
  - Inspect JWT in DevTools Application Storage → ensure `realm_access.roles` contains expected roles.
  - Trace 401/403 in backend logs using `X-Correlation-Id`.