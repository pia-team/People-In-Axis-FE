export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'TEMPORARY'
  | 'INTERN'
  | 'FREELANCE'
  | 'CONSULTANT'
  | 'VOLUNTEER';

export type EmployeeStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ON_LEAVE'
  | 'TERMINATED';

export interface Employee {
  id: number;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email?: string;
  position?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  companyId?: number;
  companyName?: string;
  departmentId?: number;
  departmentName?: string;
  managerId?: number;
  managerName?: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
  employmentType?: EmploymentType;
  status?: EmployeeStatus;
  isActive?: boolean;
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
}

export interface EmployeeCreateDTO {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  startDate: string; // YYYY-MM-DD
  employmentType: EmploymentType;
  companyId: number;
  departmentId?: number;
  managerId?: number;
}

export interface EmployeeUpdateDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  employmentType?: EmploymentType;
  companyId?: number;
  departmentId?: number | null;
  managerId?: number | null;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export type PaginatedResponse<T> = Page<T>;

export type TimeSheetStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVISION_REQUESTED'
  | 'CANCELLED';

export interface TimeSheet {
  id: number;
  employeeId: number;
  employeeName?: string;
  projectId?: number;
  projectName?: string;
  workDate: string;
  hoursWorked: number;
  overtimeHours?: number;
  taskDescription?: string;
  status?: TimeSheetStatus;
  baseStatus?: TimeSheetBaseStatus;
  billable?: boolean;
}

export type TimeSheetBaseStatus =
  | 'CREATED'
  | 'SUBMITTED'
  | 'WAITING_FOR_MANAGER_APPROVAL'
  | 'PROCESSING'
  | 'WAITING_FOR_ADMIN_APPROVAL'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'REVISION_REQUESTED'
  | 'COMPANY_REJECTED'
  | 'MANAGER_REJECTED'
  | 'ADMIN_REJECTED';

export type TimeSheetRowStatus =
  | 'CREATED'
  | 'MANAGER_APPROVED'
  | 'MANAGER_REJECTED'
  | 'ASSIGNED'
  | 'TEAM_LEAD_APPROVE'
  | 'TEAM_LEAD_REJECT'
  | 'COMPLETED'
  | 'ADMIN_REJECTED';

export interface TimeSheetRow {
  id: number;
  timesheetId: number;
  workDate: string; // ISO
  startTime?: string; // ISO
  endTime?: string; // ISO
  hours: number;
  taskDescription?: string;
  location?: string;
  status?: TimeSheetRowStatus;
  assignedToEmployeeId?: number | null;
  assignedToName?: string | null;
  reviewerId?: number | null;
  reviewerName?: string | null;
  rejectionReason?: string | null;
  approvalComments?: string | null;
}

export type ExpenseStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'REIMBURSED'
  | 'CANCELLED'
  | 'ON_HOLD';

export interface Expense {
  id: number;
  employeeId: number;
  employeeName?: string;
  expenseTypeId: number;
  expenseTypeName?: string;
  projectId?: number;
  projectName?: string;
  expenseDate: string;
  amount: number;
  currency?: string;
  status?: ExpenseStatus;
}

// Company
export interface Company {
  id: number;
  name: string;
  code?: string;
  taxNumber?: string;
  taxOffice?: string;
  email?: string;
  phone?: string;
  fax?: string;
  website?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  logoUrl?: string;
  sector?: string;
  employeeCount?: number;
  establishedYear?: number;
  description?: string;
  parentCompanyId?: number | null;
  isActive?: boolean;
}

export interface CompanyCreateDTO {
  name: string;
  taxNumber?: string;
  taxOffice?: string;
  email?: string;
  phone?: string;
  fax?: string;
  website?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  logoUrl?: string;
  sector?: string;
  employeeCount?: number;
  establishedYear?: number;
  description?: string;
  parentCompanyId?: number | null;
}

export interface CompanyUpdateDTO extends Partial<CompanyCreateDTO> {
  isActive?: boolean;
}

// Department
export interface Department {
  id: number;
  name: string;
  code?: string;
  description?: string;
  location?: string;
  budget?: number;
  companyId: number;
  companyName?: string;
  managerId?: number | null;
  managerName?: string;
  parentDepartmentId?: number | null;
  isActive?: boolean;
}

export interface DepartmentCreateDTO {
  name: string;
  description?: string;
  location?: string;
  budget?: number;
  companyId: number;
  managerId?: number | null;
  parentDepartmentId?: number | null;
}

export interface DepartmentUpdateDTO extends Partial<DepartmentCreateDTO> {
  isActive?: boolean;
}

// Project
export interface Project {
  id: number;
  name: string;
  code?: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
  deadline?: string | null;
  status?: string;
  budget?: number;
  spentAmount?: number;
  currency?: string;
  completionPercentage?: number;
  priority?: string;
  clientName?: string;
  clientContact?: string;
  companyId: number;
  companyName?: string;
  projectManagerId?: number | null;
  projectManagerName?: string;
  isActive?: boolean;
}

export interface ProjectCreateDTO {
  name: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string | null;
  deadline?: string | null;
  status?: string;
  budget?: number;
  spentAmount?: number;
  currency?: string;
  completionPercentage?: number;
  priority?: string;
  clientName?: string;
  clientContact?: string;
  companyId: number;
  projectManagerId?: number | null;
}

export interface ProjectUpdateDTO extends Partial<ProjectCreateDTO> {}

// Auth/User (minimal shape used by Redux store)
export interface User {
  id?: string | number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

// TimeSheet Import Result
export interface TimeSheetImportRowResult {
  rowNumber: number;
  employeeId?: number;
  projectId?: number;
  workDate?: string;
  hoursWorked?: number;
  timeSheetId?: number;
  status: 'SUCCESS' | 'FAILURE';
  message?: string;
}

export interface TimeSheetImportResult {
  totalRows: number;
  importedCount: number;
  failedCount: number;
  successRows: TimeSheetImportRowResult[];
  failedRows: TimeSheetImportRowResult[];
}
