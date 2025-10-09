// Common types
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  isActive: boolean;
  isDeleted: boolean;
}

// Pagination types
export interface PaginatedResponse<T> {
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

// Employee types
export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
  SUSPENDED = 'SUSPENDED',
  PROBATION = 'PROBATION',
  NOTICE_PERIOD = 'NOTICE_PERIOD',
  RESIGNED = 'RESIGNED',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  TEMPORARY = 'TEMPORARY',
  INTERN = 'INTERN',
  FREELANCE = 'FREELANCE',
  CONSULTANT = 'CONSULTANT',
  VOLUNTEER = 'VOLUNTEER',
}

export enum RateType {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  PROJECT_BASED = 'PROJECT_BASED',
  FIXED = 'FIXED',
}

export interface Employee extends BaseEntity {
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  mobileNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  nationalId?: string;
  passportNumber?: string;
  position: string;
  title?: string;
  startDate: string;
  endDate?: string;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  rateType?: RateType;
  rate?: number;
  currency?: string;
  bankName?: string;
  bankAccountNumber?: string;
  iban?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  photoUrl?: string;
  userCreated: boolean;
  companyId: number;
  companyName: string;
  departmentId?: number;
  departmentName?: string;
  managerId?: number;
  managerName?: string;
}

export interface EmployeeCreateDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  mobileNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  nationalId?: string;
  passportNumber?: string;
  position: string;
  title?: string;
  startDate: string;
  endDate?: string;
  status?: EmployeeStatus;
  employmentType: EmploymentType;
  rateType?: RateType;
  rate?: number;
  currency?: string;
  bankName?: string;
  bankAccountNumber?: string;
  iban?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  companyId: number;
  departmentId?: number;
  managerId?: number;
  createUser?: boolean;
  temporaryPassword?: string;
}

export interface EmployeeUpdateDTO extends Partial<EmployeeCreateDTO> {}

// Company types
export interface Company extends BaseEntity {
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
  parentCompanyId?: number;
}

// Department types
export interface Department extends BaseEntity {
  name: string;
  code?: string;
  description?: string;
  location?: string;
  budget?: number;
  companyId: number;
  companyName: string;
  managerId?: number;
  managerName?: string;
  parentDepartmentId?: number;
}

// Project types
export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  ARCHIVED = 'ARCHIVED',
}

export interface Project extends BaseEntity {
  name: string;
  code?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  deadline?: string;
  status: ProjectStatus;
  budget?: number;
  spentAmount?: number;
  currency?: string;
  completionPercentage: number;
  priority?: string;
  clientName?: string;
  clientContact?: string;
  companyId: number;
  companyName: string;
  projectManagerId?: number;
  projectManagerName?: string;
}

// TimeSheet types
export enum TimeSheetStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
}

export interface TimeSheet extends BaseEntity {
  employeeId: number;
  employeeName: string;
  projectId?: number;
  projectName?: string;
  workDate: string;
  startTime?: string;
  endTime?: string;
  hoursWorked: number;
  overtimeHours?: number;
  taskDescription?: string;
  location?: string;
  workType?: string;
  status: TimeSheetStatus;
  submittedAt?: string;
  approvedById?: number;
  approvedByName?: string;
  approvedAt?: string;
  approvalComments?: string;
  rejectionReason?: string;
  billable: boolean;
  rate?: number;
  totalAmount?: number;
  currency?: string;
  notes?: string;
}

// Expense types
export enum ExpenseStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REIMBURSED = 'REIMBURSED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

export interface ExpenseType extends BaseEntity {
  name: string;
  code?: string;
  description?: string;
  category?: string;
  requiresReceipt: boolean;
  maxAmount?: number;
  icon?: string;
  color?: string;
}

export interface Expense extends BaseEntity {
  employeeId: number;
  employeeName: string;
  expenseTypeId: number;
  expenseTypeName: string;
  projectId?: number;
  projectName?: string;
  expenseDate: string;
  amount: number;
  currency?: string;
  exchangeRate?: number;
  amountInBaseCurrency?: number;
  description?: string;
  merchant?: string;
  receiptNumber?: string;
  paymentMethod?: string;
  status: ExpenseStatus;
  submittedAt?: string;
  approvedById?: number;
  approvedByName?: string;
  approvedAt?: string;
  approvalComments?: string;
  rejectionReason?: string;
  reimbursementDate?: string;
  reimbursementReference?: string;
  receiptUrl?: string;
  isBillable: boolean;
  isReimbursable: boolean;
  notes?: string;
}

// User and Auth types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  employeeId?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Form types
export interface SelectOption {
  value: string | number;
  label: string;
}

export interface TableColumn<T> {
  id: keyof T;
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
}
