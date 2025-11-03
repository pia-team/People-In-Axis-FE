import axios from '@/services/api';
import { apiPath } from '@/config/apiPaths';
import {
  Application,
  ApplicationDetail,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationFilter,
  PagedResponse,
  Comment,
  CreateCommentRequest,
  Rating,
  CreateRatingRequest,
  ForwardApplicationRequest,
  Meeting,
  CreateMeetingRequest,
  UpdateApplicationStatusRequest,
  ApiResponse
} from '@/types/cv-sharing';

class ApplicationService {
  private baseUrl = apiPath('applications');

  /**
   * Get paginated list of applications
   */
  async getApplications(filter?: ApplicationFilter): Promise<PagedResponse<Application>> {
    const response = await axios.get<PagedResponse<Application>>(this.baseUrl, {
      params: filter
    });
    return response.data;
  }

  /**
   * Get applications by position (first page by default)
   */
  async getApplicationsByPosition(positionId: string, page = 0, size = 10): Promise<Application[]> {
    const response = await axios.get<PagedResponse<Application>>(this.baseUrl, {
      params: { positionId, page, size }
    });
    return response.data.content;
  }

  /**
   * Get application details by ID
   */
  async getApplicationById(id: string): Promise<ApplicationDetail> {
    const response = await axios.get<ApplicationDetail>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Submit new application
   */
  async createApplication(data: CreateApplicationRequest): Promise<Application> {
    const response = await axios.post<Application>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Update application
   */
  async updateApplication(id: string, data: UpdateApplicationRequest): Promise<Application> {
    const response = await axios.patch<Application>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Withdraw application
   */
  async withdrawApplication(id: string): Promise<void> {
    await this.updateApplicationStatus(id, { status: 'WITHDRAWN' as any });
  }

  /**
   * Forward application to reviewers
   */
  async forwardApplication(id: string, data: ForwardApplicationRequest): Promise<ApiResponse<void>> {
    const response = await axios.post<ApiResponse<void>>(`${this.baseUrl}/${id}/forward`, data);
    return response.data;
  }

  /**
   * Add comment to application
   */
  async addComment(applicationId: string, data: CreateCommentRequest): Promise<Comment> {
    const response = await axios.post<Comment>(`${this.baseUrl}/${applicationId}/comments`, data);
    return response.data;
  }

  /**
   * Get application comments
   */
  async getComments(applicationId: string): Promise<Comment[]> {
    const response = await axios.get<Comment[]>(`${this.baseUrl}/${applicationId}/comments`);
    return response.data;
  }

  /**
   * Add rating to application
   */
  async addRating(applicationId: string, data: CreateRatingRequest): Promise<Rating> {
    const response = await axios.post<Rating>(`${this.baseUrl}/${applicationId}/ratings`, data);
    return response.data;
  }

  /**
   * Get application ratings
   */
  async getRatings(applicationId: string): Promise<Rating[]> {
    const response = await axios.get<Rating[]>(`${this.baseUrl}/${applicationId}/ratings`);
    return response.data;
  }

  /**
   * Schedule meeting for application
   */
  async scheduleMeeting(applicationId: string, data: CreateMeetingRequest): Promise<Meeting> {
    const response = await axios.post<Meeting>(`${this.baseUrl}/${applicationId}/meetings`, data);
    return response.data;
  }

  /**
   * Get application meetings
   */
  async getMeetings(applicationId: string): Promise<Meeting[]> {
    const response = await axios.get<Meeting[]>(`${this.baseUrl}/${applicationId}/meetings`);
    return response.data;
  }

  /**
   * Update meeting
   */
  async updateMeeting(applicationId: string, meetingId: string, data: Partial<CreateMeetingRequest>): Promise<Meeting> {
    const response = await axios.patch<Meeting>(`${this.baseUrl}/${applicationId}/meetings/${meetingId}`, data);
    return response.data;
  }

  /**
   * Cancel meeting
   */
  async cancelMeeting(applicationId: string, meetingId: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${applicationId}/meetings/${meetingId}`);
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(id: string, data: UpdateApplicationStatusRequest): Promise<void> {
    await axios.post(`${this.baseUrl}/${id}/status`, data);
  }

  /**
   * Upload application files
   */
  async uploadFiles(applicationId: string, files: File[]): Promise<ApiResponse<string[]>> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await axios.post<ApiResponse<string[]>>(
      `${this.baseUrl}/${applicationId}/files`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }

  /**
   * Download application file
   */
  async downloadFile(applicationId: string, fileId: string): Promise<Blob> {
    const response = await axios.get(`${this.baseUrl}/${applicationId}/files/${fileId}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Get my applications (for applicants)
   */
  async getMyApplications(page = 0, size = 20): Promise<PagedResponse<Application>> {
    const response = await axios.get<PagedResponse<Application>>(`${this.baseUrl}/my-applications`, {
      params: { page, size }
    });
    return response.data;
  }

  /**
   * Get applications for review (for reviewers)
   */
  async getApplicationsForReview(page = 0, size = 20): Promise<PagedResponse<Application>> {
    const response = await axios.get<PagedResponse<Application>>(`${this.baseUrl}/for-review`, {
      params: { page, size }
    });
    return response.data;
  }

  /**
   * Bulk forward applications
   */
  async bulkForward(applicationIds: string[], data: ForwardApplicationRequest): Promise<ApiResponse<number>> {
    const response = await axios.post<ApiResponse<number>>(`${this.baseUrl}/bulk-forward`, {
      applicationIds,
      ...data
    });
    return response.data;
  }

  /**
   * Export applications to CSV
   */
  async exportApplications(filter?: ApplicationFilter): Promise<Blob> {
    const response = await axios.get(`${this.baseUrl}/export`, {
      params: filter,
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Get application statistics
   */
  async getApplicationStatistics(positionId?: string): Promise<any> {
    const params = positionId ? { positionId } : {};
    const response = await axios.get(`${this.baseUrl}/statistics`, { params });
    return response.data;
  }

  /**
   * Validate application data
   */
  validateApplicationData(data: CreateApplicationRequest): string[] {
    const errors: string[] = [];

    if (!data.firstName || data.firstName.trim().length === 0) {
      errors.push('First name is required');
    }

    if (!data.lastName || data.lastName.trim().length === 0) {
      errors.push('Last name is required');
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.phone || data.phone.trim().length === 0) {
      errors.push('Phone number is required');
    }

    if (!data.kvkkConsent) {
      errors.push('KVKK consent is required');
    }

    if (data.tckn && !this.isValidTCKN(data.tckn)) {
      errors.push('Invalid TCKN number');
    }

    return errors;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate TCKN (Turkish ID number)
   */
  private isValidTCKN(tckn: string): boolean {
    if (!tckn || tckn.length !== 11) return false;
    
    const digits = tckn.split('').map(Number);
    if (digits[0] === 0) return false;
    
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    
    const digit10 = ((oddSum * 7) - evenSum) % 10;
    const digit11 = (digits.slice(0, 10).reduce((a, b) => a + b, 0)) % 10;
    
    return digits[9] === digit10 && digits[10] === digit11;
  }
}

export const applicationService = new ApplicationService();
