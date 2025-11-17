/**
 * Centralized query key factory for React Query
 * This ensures consistent query key structure across the application
 */

export const queryKeys = {
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    metrics: () => [...queryKeys.dashboard.all, 'metrics'] as const,
  },

  // Employees
  employees: {
    all: ['employees'] as const,
    lists: () => [...queryKeys.employees.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.employees.lists(), filters] as const,
    details: () => [...queryKeys.employees.all, 'detail'] as const,
    detail: (id: number | string) => [...queryKeys.employees.details(), id] as const,
  },

  // Companies
  companies: {
    all: ['companies'] as const,
    lists: () => [...queryKeys.companies.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.companies.lists(), filters] as const,
    details: () => [...queryKeys.companies.all, 'detail'] as const,
    detail: (id: number | string) => [...queryKeys.companies.details(), id] as const,
  },

  // Departments
  departments: {
    all: ['departments'] as const,
    lists: () => [...queryKeys.departments.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.departments.lists(), filters] as const,
    details: () => [...queryKeys.departments.all, 'detail'] as const,
    detail: (id: number | string) => [...queryKeys.departments.details(), id] as const,
  },

  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: number | string) => [...queryKeys.projects.details(), id] as const,
  },

  // Timesheets
  timesheets: {
    all: ['timesheets'] as const,
    lists: () => [...queryKeys.timesheets.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.timesheets.lists(), filters] as const,
    details: () => [...queryKeys.timesheets.all, 'detail'] as const,
    detail: (id: number | string) => [...queryKeys.timesheets.details(), id] as const,
    my: () => [...queryKeys.timesheets.all, 'my'] as const,
    pending: () => [...queryKeys.timesheets.all, 'pending'] as const,
    approval: () => [...queryKeys.timesheets.all, 'approval'] as const,
    adminApproval: () => [...queryKeys.timesheets.all, 'admin-approval'] as const,
    assigned: () => [...queryKeys.timesheets.all, 'assigned'] as const,
  },

  // Expenses
  expenses: {
    all: ['expenses'] as const,
    lists: () => [...queryKeys.expenses.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.expenses.lists(), filters] as const,
    details: () => [...queryKeys.expenses.all, 'detail'] as const,
    detail: (id: number | string) => [...queryKeys.expenses.details(), id] as const,
    my: () => [...queryKeys.expenses.all, 'my'] as const,
    pending: () => [...queryKeys.expenses.all, 'pending'] as const,
    approval: () => [...queryKeys.expenses.all, 'approval'] as const,
  },

  // CV Sharing - Positions
  positions: {
    all: ['positions'] as const,
    lists: () => [...queryKeys.positions.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.positions.lists(), filters] as const,
    details: () => [...queryKeys.positions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.positions.details(), id] as const,
    templates: () => [...queryKeys.positions.all, 'templates'] as const,
    statistics: (id: string) => [...queryKeys.positions.detail(id), 'statistics'] as const,
    matches: (id: string) => [...queryKeys.positions.detail(id), 'matches'] as const,
  },

  // CV Sharing - Applications
  applications: {
    all: ['applications'] as const,
    lists: () => [...queryKeys.applications.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.applications.lists(), filters] as const,
    details: () => [...queryKeys.applications.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.applications.details(), id] as const,
    my: () => [...queryKeys.applications.all, 'my'] as const,
    forReview: () => [...queryKeys.applications.all, 'for-review'] as const,
    statistics: (positionId?: string) => [...queryKeys.applications.all, 'statistics', positionId] as const,
  },

  // CV Sharing - Pool CVs
  poolCVs: {
    all: ['pool-cvs'] as const,
    lists: () => [...queryKeys.poolCVs.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.poolCVs.lists(), filters] as const,
    details: () => [...queryKeys.poolCVs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.poolCVs.details(), id] as const,
    statistics: () => [...queryKeys.poolCVs.all, 'statistics'] as const,
  },

  // CV Sharing - Matching
  matching: {
    all: ['matching'] as const,
    config: () => [...queryKeys.matching.all, 'config'] as const,
    aliases: () => [...queryKeys.matching.all, 'aliases'] as const,
  },

  // Languages
  languages: {
    all: ['languages'] as const,
    active: () => [...queryKeys.languages.all, 'active'] as const,
    list: () => [...queryKeys.languages.all, 'list'] as const,
  },

  // Reports
  reports: {
    all: ['reports'] as const,
    timesheet: () => [...queryKeys.reports.all, 'timesheet'] as const,
    expense: () => [...queryKeys.reports.all, 'expense'] as const,
    logs: () => [...queryKeys.reports.all, 'logs'] as const,
  },

  // Admin
  admin: {
    all: ['admin'] as const,
    users: () => [...queryKeys.admin.all, 'users'] as const,
    roles: () => [...queryKeys.admin.all, 'roles'] as const,
    settings: () => [...queryKeys.admin.all, 'settings'] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.notifications.lists(), filters] as const,
    details: () => [...queryKeys.notifications.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.notifications.details(), id] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
  },
} as const;

