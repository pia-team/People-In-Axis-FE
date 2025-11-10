import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

import { useKeycloak } from '@/hooks/useKeycloak';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import PrivateRoute from '@/components/auth/PrivateRoute';
import PublicRoute from '@/components/auth/PublicRoute';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Unauthorized = lazy(() => import('@/pages/auth/Unauthorized'));

// Employee pages
const EmployeeList = lazy(() => import('@/pages/employees/EmployeeList'));
const EmployeeDetail = lazy(() => import('@/pages/employees/EmployeeDetail'));
const EmployeeForm = lazy(() => import('@/pages/employees/EmployeeForm'));
const MyProfile = lazy(() => import('@/pages/employees/MyProfile'));

// Company pages
const CompanyList = lazy(() => import('@/pages/companies/CompanyList'));
const CompanyDetail = lazy(() => import('@/pages/companies/CompanyDetail'));
const CompanyForm = lazy(() => import('@/pages/companies/CompanyForm'));

// Department pages
const DepartmentList = lazy(() => import('@/pages/departments/DepartmentList'));
const DepartmentDetail = lazy(() => import('@/pages/departments/DepartmentDetail'));
const DepartmentForm = lazy(() => import('@/pages/departments/DepartmentForm'));

// TimeSheet pages
const TimeSheetList = lazy(() => import('@/pages/timesheets/TimeSheetList'));
const TimeSheetForm = lazy(() => import('@/pages/timesheets/TimeSheetForm'));
const MyTimeSheets = lazy(() => import('@/pages/timesheets/MyTimeSheets'));
const TimeSheetApproval = lazy(() => import('@/pages/timesheets/TimeSheetApproval'));
const TimeSheetDetail = lazy(() => import('@/pages/timesheets/TimeSheetDetail'));
const TeamLeadAssigned = lazy(() => import('@/pages/timesheets/TeamLeadAssigned'));
const TimeSheetImport = lazy(() => import('@/pages/timesheets/TimeSheetImport'));

// Expense pages
const ExpenseList = lazy(() => import('@/pages/expenses/ExpenseList'));
const ExpenseForm = lazy(() => import('@/pages/expenses/ExpenseForm'));
const MyExpenses = lazy(() => import('@/pages/expenses/MyExpenses'));
const ExpenseApproval = lazy(() => import('@/pages/expenses/ExpenseApproval'));
const ExpenseDetail = lazy(() => import('@/pages/expenses/ExpenseDetail'));

// Project pages
const ProjectList = lazy(() => import('@/pages/projects/ProjectList'));
const ProjectDetail = lazy(() => import('@/pages/projects/ProjectDetail'));
const ProjectForm = lazy(() => import('@/pages/projects/ProjectForm'));

// CV Sharing pages
const PositionList = lazy(() => import('@/pages/cv-sharing/positions/PositionList'));
const PositionDetail = lazy(() => import('@/pages/cv-sharing/positions/PositionDetail'));
const PositionForm = lazy(() => import('@/pages/cv-sharing/positions/PositionForm'));
const ApplicationList = lazy(() => import('@/pages/cv-sharing/applications/ApplicationList'));
import AllMeetingsCalendar from '@/pages/meetings/AllMeetingsCalendar';
const ApplicationDetail = lazy(() => import('@/pages/cv-sharing/applications/ApplicationDetail'));
const ApplicationForm = lazy(() => import('@/pages/cv-sharing/applications/ApplicationForm'));
const ForwardDialog = lazy(() => import('@/pages/cv-sharing/applications/ForwardDialog'));
const ApplicationReview = lazy(() => import('@/pages/cv-sharing/applications/ApplicationReview'));
const MeetingScheduler = lazy(() => import('@/pages/cv-sharing/applications/MeetingScheduler'));
const PoolCVList = lazy(() => import('@/pages/cv-sharing/pool-cvs/PoolCVList'));
const PoolCVDetail = lazy(() => import('@/pages/cv-sharing/pool-cvs/PoolCVDetail'));
const PoolCVForm = lazy(() => import('@/pages/cv-sharing/pool-cvs/PoolCVForm'));
const MatchingSettings = lazy(() => import('@/pages/cv-sharing/settings/MatchingSettings'));

// Reports pages
const Reports = lazy(() => import('@/pages/reports/Reports'));
const TimeSheetReport = lazy(() => import('@/pages/reports/TimeSheetReport'));
const ExpenseReport = lazy(() => import('@/pages/reports/ExpenseReport'));
const AuditLogs = lazy(() => import('@/pages/reports/Logs'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const RoleManagement = lazy(() => import('@/pages/admin/RoleManagement'));
const Settings = lazy(() => import('@/pages/admin/Settings'));
// Settings pages
const LanguagesPage = lazy(() => import('@/pages/settings/Languages'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const LoadingScreen: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

const App: React.FC = () => {
  const { initialized } = useKeycloak();

  if (!initialized) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>
        </Route>

        {/* Private routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            {/* Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Profile */}
            <Route path="/profile" element={<MyProfile />} />

            {/* Employees */}
            <Route path="/employees">
              <Route index element={<EmployeeList />} />
              <Route path="new" element={<EmployeeForm />} />
              <Route path=":id" element={<EmployeeDetail />} />
              <Route path=":id/edit" element={<EmployeeForm />} />
            </Route>

            {/* Companies */}
            <Route path="/companies">
              <Route index element={<CompanyList />} />
              <Route path="new" element={<CompanyForm />} />
              <Route path=":id" element={<CompanyDetail />} />
              <Route path=":id/edit" element={<CompanyForm />} />
            </Route>

            {/* Departments */}
            <Route path="/departments">
              <Route index element={<DepartmentList />} />
              <Route path="new" element={<DepartmentForm />} />
              <Route path=":id" element={<DepartmentDetail />} />
              <Route path=":id/edit" element={<DepartmentForm />} />
            </Route>

            {/* Projects */}
            <Route path="/projects">
              <Route index element={<ProjectList />} />
              <Route path="new" element={<ProjectForm />} />
              <Route path=":id" element={<ProjectDetail />} />
              <Route path=":id/edit" element={<ProjectForm />} />
            </Route>

            {/* TimeSheets */}
            <Route path="/timesheets">
              <Route index element={<TimeSheetList />} />
              <Route path="my" element={<MyTimeSheets />} />
              <Route path=":id" element={<TimeSheetDetail />} />
              <Route path="new" element={<TimeSheetForm />} />
              <Route path=":id/edit" element={<TimeSheetForm />} />
            </Route>

            {/* TimeSheets Approval (role-guarded) */}
            <Route
              path="/timesheets/approval"
              element={<PrivateRoute roles={["TEAM_MANAGER", "HUMAN_RESOURCES"]} />}
            >
              <Route index element={<TimeSheetApproval />} />
            </Route>

            {/* TeamLead Assigned Rows (role-guarded) */}
            <Route
              path="/timesheets/assigned"
              element={<PrivateRoute roles={["TEAM_MANAGER"]} />}
            >
              <Route index element={<TeamLeadAssigned />} />
            </Route>

            {/* TimeSheet Import (role-guarded) */}
            <Route
              path="/timesheets/import"
              element={<PrivateRoute roles={["HUMAN_RESOURCES", "COMPANY_MANAGER"]} />}
            >
              <Route index element={<TimeSheetImport />} />
            </Route>

            {/* Admin TimeSheets Approval (role-guarded) */}
            <Route
              path="/timesheets/admin-approval"
              element={<PrivateRoute roles={["ADMIN"]} />}
            >
              <Route index element={React.createElement(React.lazy(() => import('@/pages/timesheets/AdminTimeSheetApproval')))} />
            </Route>

            {/* Expenses */}
            <Route path="/expenses">
              <Route index element={<ExpenseList />} />
              <Route path="my" element={<MyExpenses />} />
              <Route path=":id" element={<ExpenseDetail />} />
              <Route path="new" element={<ExpenseForm />} />
              <Route path=":id/edit" element={<ExpenseForm />} />
            </Route>

            {/* Expenses Approval (role-guarded) */}
            <Route
              path="/expenses/approval"
              element={<PrivateRoute roles={["TEAM_MANAGER", "HUMAN_RESOURCES", "FINANCE"]} />}
            >
              <Route index element={<ExpenseApproval />} />
            </Route>

            {/* Reports (protected) */}
            <Route
              path="/reports"
              element={<PrivateRoute roles={["HUMAN_RESOURCES", "ADMIN", "COMPANY_MANAGER"]} />}
            >
              <Route index element={<Reports />} />
              <Route path="timesheet" element={<TimeSheetReport />} />
              <Route path="expense" element={<ExpenseReport />} />
              <Route path="logs" element={<AuditLogs />} />
            </Route>

            {/* CV Sharing - Positions (HR) */}
            <Route
              path="/cv-sharing/positions"
              element={<PrivateRoute roles={["HUMAN_RESOURCES", "COMPANY_MANAGER"]} />}
            >
              <Route index element={<PositionList />} />
              <Route path="new" element={<PositionForm />} />
              <Route path=":id" element={<PositionDetail />} />
              <Route path=":id/edit" element={<PositionForm />} />
            </Route>

            {/* CV Sharing - Applications */}
            <Route path="/cv-sharing/applications">
              <Route index element={<ApplicationList />} />
              <Route path="new/:positionId" element={<ApplicationForm />} />
              <Route path=":id" element={<ApplicationDetail />} />
              <Route path=":id/review" element={<ApplicationReview />} />
              <Route path=":id/forward" element={<ForwardDialog />} />
              <Route path=":id/meetings" element={<MeetingScheduler />} />
              <Route path=":id/scheduler" element={<MeetingScheduler />} />
            </Route>

            {/* Applications - Calendar (non cv-sharing alias) */}
            <Route path="/applications">
              <Route path=":id/meetings" element={<AllMeetingsCalendar />} />
            </Route>

            {/* CV Sharing - Pool CVs */}
            <Route path="/cv-sharing/pool-cvs">
              <Route index element={<PoolCVList />} />
              <Route path=":id" element={<PoolCVDetail />} />
              <Route path="new" element={<PoolCVForm />} />
              <Route path=":id/edit" element={<PoolCVForm />} />
            </Route>

            {/* CV Sharing - Settings (Matching) */}
            <Route
              path="/cv-sharing/settings"
              element={<PrivateRoute roles={["HUMAN_RESOURCES", "COMPANY_MANAGER", "EMPLOYEE"]} />}
            >
              <Route path="matching" element={<MatchingSettings />} />
            </Route>

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <PrivateRoute roles={['ADMIN', 'SYSTEM_ADMIN']} />
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="roles" element={<RoleManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Settings */}
            <Route path="/settings">
              <Route path="languages" element={<LanguagesPage />} />
            </Route>

          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
