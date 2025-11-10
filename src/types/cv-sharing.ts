// CV Sharing Feature Type Definitions

// Enums
export enum PositionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PASSIVE = 'PASSIVE',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED'
}

export enum ApplicationStatus {
  NEW = 'NEW',
  IN_REVIEW = 'IN_REVIEW',
  FORWARDED = 'FORWARDED',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  ARCHIVED = 'ARCHIVED'
}

export enum WorkType {
  ONSITE = 'ONSITE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID'
}

export enum LanguageProficiency {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
  NATIVE = 'NATIVE'
}

export enum MeetingProvider {
  TEAMS = 'TEAMS',
  ZOOM = 'ZOOM',
  MEET = 'MEET',
  OTHER = 'OTHER'
}

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Common Types
export interface Skill {
  id?: string;
  name: string;
  isRequired?: boolean;
  proficiencyLevel?: string;
  yearsOfExperience?: number;
}

export interface Language {
  id?: string;
  code: string;
  proficiencyLevel: LanguageProficiency;
}

export interface FileInfo {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  uploadedAt: string;
  downloadUrl?: string;
}

export interface PageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Position Types
export interface Position {
  id: string;
  name: string;
  title: string;
  department?: string;
  location?: string;
  workType?: WorkType;
  minExperience?: number;
  educationLevel?: string;
  description?: string;
  requirements?: string;
  skills?: Skill[];
  languages?: Language[];
  visibility?: 'PUBLIC' | 'INTERNAL';
  applicationDeadline?: string;
  salaryRangeMin?: number;
  salaryRangeMax?: number;
  status: PositionStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  createdById?: string;
  applicationCount?: number;
}

export interface CreatePositionRequest {
  name: string;
  title: string;
  department?: string;
  location?: string;
  workType?: WorkType;
  minExperience?: number;
  educationLevel?: string;
  description?: string;
  requirements?: string;
  skills?: Skill[];
  languages?: Language[];
  visibility?: 'PUBLIC' | 'INTERNAL';
  applicationDeadline?: string;
  salaryRangeMin?: number;
  salaryRangeMax?: number;
}

export interface UpdatePositionRequest extends Partial<CreatePositionRequest> {
  status?: PositionStatus;
}

export interface PositionTemplate {
  id: string;
  templateName: string;
  name?: string;
  title?: string;
  department?: string;
  location?: string;
  workType?: WorkType;
  minExperience?: number;
  educationLevel?: string;
  description?: string;
  requirements?: string;
  createdAt: string;
  updatedAt: string;
}

// Application Types
export interface Application {
  id: string;
  positionId: string;
  positionTitle?: string;
  poolCvId?: string;
  firstName: string;
  lastName: string;
  tckn?: string; // Masked
  birthDate?: string;
  email: string;
  phone?: string;
  address?: string;
  experienceYears?: number;
  expectedSalary?: number;
  availableStartDate?: string;
  noticePeriodDays?: number;
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: string;
  withdrawnAt?: string;
  createdAt: string;
  updatedAt: string;
  // Optional metrics used in list UIs
  averageRating?: number;
  ratingCount?: number;
  commentCount?: number;
}

export interface ApplicationDetail extends Application {
  files?: FileInfo[];
  comments?: Comment[];
  recentComments?: Comment[];
  ratings?: Rating[];
  forwardings?: Forwarding[];
  meetings?: Meeting[];
  auditLogs?: AuditLog[];
}

export interface CreateApplicationRequest {
  positionId: string;
  poolCvId?: string;
  firstName: string;
  lastName: string;
  tckn?: string;
  birthDate?: string;
  email: string;
  phone?: string;
  address?: string;
  experienceYears?: number;
  expectedSalary?: number;
  availableStartDate?: string;
  noticePeriodDays?: number;
  coverLetter?: string;
  kvkkConsent: boolean;
}

export interface UpdateApplicationRequest {
  expectedSalary?: number;
  availableStartDate?: string;
  noticePeriodDays?: number;
  coverLetter?: string;
}

// Pool CV Types
export interface PoolCV {
  id: string;
  firstName: string;
  lastName: string;
  tckn?: string; // Masked
  birthDate?: string;
  email: string;
  phone?: string;
  address?: string;
  experienceYears?: number;
  currentPosition?: string;
  currentCompany?: string;
  skills?: Skill[];
  languages?: Language[];
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Optional aggregate data for UI
  fileCount?: number;
}

export interface PoolCVDetail extends PoolCV {
  files?: FileInfo[];
  kvkkConsentId?: string;
}

export interface CreatePoolCVRequest {
  firstName: string;
  lastName: string;
  tckn?: string;
  birthDate?: string;
  email: string;
  phone?: string;
  address?: string;
  experienceYears?: number;
  currentPosition?: string;
  currentCompany?: string;
  skills?: Skill[];
  languages?: Language[];
  tags?: string[];
  kvkkConsent: boolean;
}

export interface UpdatePoolCVRequest extends Partial<Omit<CreatePoolCVRequest, 'kvkkConsent'>> {
  isActive?: boolean;
}

// Comment and Rating Types
export interface Comment {
  id: string;
  applicationId: string;
  userId: string;
  userName?: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  isInternal?: boolean;
}

export interface Rating {
  id: string;
  applicationId: string;
  userId: string;
  userName?: string;
  score: number; // 1-5
  createdAt: string;
  updatedAt: string;
}

export interface CreateRatingRequest {
  score: number; // 1-5
}

// Forwarding Types
export interface Forwarding {
  id: string;
  applicationId: string;
  forwardedBy: string;
  forwardedByName?: string;
  forwardedTo: string;
  forwardedToName?: string;
  message?: string;
  forwardedAt: string;
}

export interface ForwardApplicationRequest {
  recipients: string[];
  message?: string;
}

// Meeting Types
export interface Meeting {
  id: string;
  applicationId: string;
  title: string;
  startTime: string;
  durationMinutes: number;
  provider?: MeetingProvider;
  meetingLink?: string;
  location?: string;
  description?: string;
  status: MeetingStatus;
  participants?: MeetingParticipant[];
  organizedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingParticipant {
  id?: string;
  email: string;
  name?: string;
  isRequired?: boolean;
  responseStatus?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';
}

export interface CreateMeetingRequest {
  title: string;
  startTime: string;
  durationMinutes: number;
  provider?: MeetingProvider;
  meetingLink?: string;
  location?: string;
  description?: string;
  participants: MeetingParticipant[];
}

// KVKK Consent Types
export interface KVKKConsent {
  id: string;
  entityType: 'APPLICATION' | 'POOL_CV';
  entityId: string;
  consentText: string;
  version: string;
  givenAt: string;
  revokedAt?: string;
  ipAddress?: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  actorId?: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId: string;
  description?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp?: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageInfo: PageInfo;
}

// Filter and Search Types
export interface PositionFilter {
  status?: PositionStatus;
  department?: string;
  location?: string;
  workType?: WorkType;
  q?: string;
  page?: number;
  size?: number;
}

export interface ApplicationFilter {
  positionId?: string;
  status?: ApplicationStatus;
  assignee?: string;
  q?: string;
  department?: string;
  sort?: string; // e.g. "createdAt,asc" or "appliedAt,desc"
  page?: number;
  size?: number;
}

export interface PoolCVFilter {
  active?: boolean;
  skills?: string[];
  languages?: string[];
  tags?: string[];
  q?: string;
  page?: number;
  size?: number;
  // Optional experience range filters used by UI
  minExperience?: number;
  maxExperience?: number;
}

// Form Types
export interface PositionFormData extends CreatePositionRequest {
  id?: string;
}

export interface ApplicationFormData extends CreateApplicationRequest {
  id?: string;
  files?: File[];
}

export interface PoolCVFormData extends CreatePoolCVRequest {
  id?: string;
  files?: File[];
}

// Upload Types
export interface UploadUrlRequest {
  fileName: string;
  fileType: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  fileId: string;
  expiresAt: string;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
  expiresAt: string;
}

// Status Update Types
export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
  reason?: string;
}

// Dashboard Types
export interface PositionStatistics {
  totalPositions: number;
  activePositions: number;
  totalApplications: number;
  pendingApplications: number;
  averageTimeToHire?: number;
}

export interface ApplicationStatistics {
  totalApplications: number;
  byStatus: Record<ApplicationStatus, number>;
  recentApplications: Application[];
  conversionRate?: number;
}
