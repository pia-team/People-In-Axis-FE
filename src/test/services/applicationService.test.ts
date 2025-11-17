import { describe, it, expect, vi, beforeEach } from 'vitest';
import { applicationService } from '@/services/cv-sharing/applicationService';
import axios from '@/services/api';
import type {
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
  FileUploadResponse,
  ApplicationStatistics,
} from '@/types/cv-sharing';
import { ApplicationStatus } from '@/types/cv-sharing';
import { SpringPageResponse } from '@/types/api';

vi.mock('@/services/api');
vi.mock('@/config/apiPaths', () => ({
  apiPath: (path: string) => `/api/${path}`,
}));

describe('applicationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getApplications', () => {
    it('fetches paginated applications with Spring page response', async () => {
      const mockResponse: SpringPageResponse<Application> = {
        content: [
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', status: ApplicationStatus.PENDING },
          { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', status: ApplicationStatus.PENDING },
        ],
        number: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await applicationService.getApplications();
      expect(result.content).toHaveLength(2);
      expect(result.pageInfo.totalElements).toBe(2);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/applications', { params: undefined });
    });

    it('fetches applications with filter', async () => {
      const filter: ApplicationFilter = { status: ApplicationStatus.PENDING, page: 0, size: 10 };
      const mockResponse: SpringPageResponse<Application> = {
        content: [],
        number: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await applicationService.getApplications(filter);
      expect(result.content).toHaveLength(0);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/applications', { params: filter });
    });

    it('handles array response', async () => {
      const mockApplications: Application[] = [
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', status: ApplicationStatus.PENDING },
      ];
      vi.mocked(axios.get).mockResolvedValue({ data: mockApplications } as any);

      const result = await applicationService.getApplications();
      expect(result.content).toHaveLength(1);
      expect(result.pageInfo.totalElements).toBe(1);
    });
  });

  describe('getApplicationsByPosition', () => {
    it('fetches applications by position ID', async () => {
      const mockResponse: PagedResponse<Application> = {
        content: [
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', status: ApplicationStatus.PENDING },
        ],
        pageInfo: { page: 0, size: 10, totalElements: 1, totalPages: 1 },
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await applicationService.getApplicationsByPosition('pos1');
      expect(result).toHaveLength(1);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/applications', {
        params: { positionId: 'pos1', page: 0, size: 10 },
      });
    });
  });

  describe('getApplicationById', () => {
    it('fetches application by ID', async () => {
      const mockApplication: ApplicationDetail = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: ApplicationStatus.PENDING,
      } as ApplicationDetail;
      vi.mocked(axios.get).mockResolvedValue({ data: mockApplication } as any);

      const result = await applicationService.getApplicationById('1');
      expect(result).toEqual(mockApplication);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/applications/1');
    });
  });

  describe('createApplication', () => {
    it('creates a new application', async () => {
      const createRequest: CreateApplicationRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        kvkkConsent: true,
      };
      const mockApplication: Application = {
        id: '1',
        ...createRequest,
        status: ApplicationStatus.PENDING,
      };
      vi.mocked(axios.post).mockResolvedValue({ data: mockApplication } as any);

      const result = await applicationService.createApplication(createRequest);
      expect(result).toEqual(mockApplication);
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/applications', createRequest);
    });
  });

  describe('updateApplication', () => {
    it('updates an application', async () => {
      const updateRequest: UpdateApplicationRequest = {
        firstName: 'John Updated',
      };
      const mockApplication: Application = {
        id: '1',
        firstName: 'John Updated',
        lastName: 'Doe',
        email: 'john@example.com',
        status: ApplicationStatus.PENDING,
      };
      vi.mocked(axios.patch).mockResolvedValue({ data: mockApplication } as any);

      const result = await applicationService.updateApplication('1', updateRequest);
      expect(result).toEqual(mockApplication);
      expect(vi.mocked(axios.patch)).toHaveBeenCalledWith('/api/applications/1', updateRequest);
    });
  });

  describe('withdrawApplication', () => {
    it('withdraws an application', async () => {
      vi.mocked(axios.post).mockResolvedValue({} as any);

      await applicationService.withdrawApplication('1');
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/applications/1/status', null, {
        params: { status: ApplicationStatus.WITHDRAWN },
      });
    });
  });

  describe('forwardApplication', () => {
    it('forwards an application', async () => {
      const forwardRequest: ForwardApplicationRequest = {
        reviewerIds: ['user1', 'user2'],
        message: 'Please review',
      };
      vi.mocked(axios.post).mockResolvedValue({ data: { success: true } } as any);

      const result = await applicationService.forwardApplication('1', forwardRequest);
      expect(result).toEqual({ success: true });
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/applications/1/forward', forwardRequest);
    });
  });

  describe('addComment', () => {
    it('adds a comment to an application', async () => {
      const commentRequest: CreateCommentRequest = {
        content: 'Great candidate',
        isInternal: true,
      };
      vi.mocked(axios.post).mockResolvedValue({} as any);

      await applicationService.addComment('1', commentRequest);
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/applications/1/comments', null, {
        params: {
          content: 'Great candidate',
          isInternal: true,
        },
      });
    });

    it('adds a comment with isInternal defaulting to true', async () => {
      const commentRequest: CreateCommentRequest = {
        content: 'Great candidate',
      };
      vi.mocked(axios.post).mockResolvedValue({} as any);

      await applicationService.addComment('1', commentRequest);
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/applications/1/comments', null, {
        params: {
          content: 'Great candidate',
          isInternal: true,
        },
      });
    });
  });

  describe('getComments', () => {
    it('fetches comments for an application', async () => {
      const mockComments: Comment[] = [
        { id: '1', content: 'Great candidate', userId: 'user1', createdAt: '2024-01-01' },
        { id: '2', content: 'Needs follow-up', userId: 'user2', createdAt: '2024-01-02' },
      ];
      vi.mocked(axios.get).mockResolvedValue({ data: mockComments } as any);

      const result = await applicationService.getComments('1');
      expect(result).toEqual(mockComments);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/applications/1/comments');
    });
  });

  describe('addRating', () => {
    it('adds a rating to an application', async () => {
      const ratingRequest: CreateRatingRequest = {
        score: 5,
      };
      vi.mocked(axios.post).mockResolvedValue({} as any);

      await applicationService.addRating('1', ratingRequest);
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/applications/1/ratings', null, {
        params: { score: 5 },
      });
    });
  });

  describe('getRatings', () => {
    it('fetches ratings for an application', async () => {
      const mockRatings: Rating[] = [
        { id: '1', score: 5, userId: 'user1', createdAt: '2024-01-01' },
        { id: '2', score: 4, userId: 'user2', createdAt: '2024-01-02' },
      ];
      vi.mocked(axios.get).mockResolvedValue({ data: mockRatings } as any);

      const result = await applicationService.getRatings('1');
      expect(result).toEqual(mockRatings);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/applications/1/ratings');
    });
  });

  describe('scheduleMeeting', () => {
    it('schedules a meeting for an application', async () => {
      const meetingRequest: CreateMeetingRequest = {
        scheduledDate: '2024-01-15T10:00:00Z',
        location: 'Office',
        notes: 'Interview',
      };
      const mockMeeting: Meeting = {
        id: '1',
        applicationId: '1',
        ...meetingRequest,
      };
      vi.mocked(axios.post).mockResolvedValue({ data: mockMeeting } as any);

      const result = await applicationService.scheduleMeeting('1', meetingRequest);
      expect(result).toEqual(mockMeeting);
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/applications/1/meetings', meetingRequest);
    });
  });

  describe('getMeetings', () => {
    it('fetches meetings for an application', async () => {
      const mockMeetings: Meeting[] = [
        { id: '1', applicationId: '1', scheduledDate: '2024-01-15T10:00:00Z', location: 'Office' },
        { id: '2', applicationId: '1', scheduledDate: '2024-01-16T10:00:00Z', location: 'Remote' },
      ];
      vi.mocked(axios.get).mockResolvedValue({ data: mockMeetings } as any);

      const result = await applicationService.getMeetings('1');
      expect(result).toEqual(mockMeetings);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/applications/1/meetings');
    });
  });

  describe('updateMeeting', () => {
    it('updates a meeting', async () => {
      const updateData = {
        scheduledDate: '2024-01-20T10:00:00Z',
        location: 'New Office',
      };
      const mockMeeting: Meeting = {
        id: '1',
        applicationId: '1',
        ...updateData,
      };
      vi.mocked(axios.patch).mockResolvedValue({ data: mockMeeting } as any);

      const result = await applicationService.updateMeeting('1', '1', updateData);
      expect(result).toEqual(mockMeeting);
      expect(vi.mocked(axios.patch)).toHaveBeenCalledWith('/api/applications/1/meetings/1', updateData);
    });
  });

  describe('cancelMeeting', () => {
    it('cancels a meeting', async () => {
      vi.mocked(axios.delete).mockResolvedValue({} as any);

      await applicationService.cancelMeeting('1', '1');
      expect(vi.mocked(axios.delete)).toHaveBeenCalledWith('/api/applications/1/meetings/1');
    });
  });

  describe('deleteFile', () => {
    it('deletes a file from an application', async () => {
      vi.mocked(axios.delete).mockResolvedValue({ data: { success: true } } as any);

      const result = await applicationService.deleteFile('1', 'file1');
      expect(result).toEqual({ success: true });
      expect(vi.mocked(axios.delete)).toHaveBeenCalledWith('/api/files/file1');
    });
  });

  describe('getCompanyMeetings', () => {
    it('fetches company meetings', async () => {
      const mockMeetings: Meeting[] = [
        { id: '1', applicationId: '1', scheduledDate: '2024-01-15T10:00:00Z', location: 'Office' },
      ];
      vi.mocked(axios.get).mockResolvedValue({ data: mockMeetings } as any);

      const result = await applicationService.getCompanyMeetings();
      expect(result).toEqual(mockMeetings);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/meetings');
    });
  });

  describe('updateApplicationStatus', () => {
    it('updates application status', async () => {
      vi.mocked(axios.post).mockResolvedValue({} as any);

      await applicationService.updateApplicationStatus('1', { status: ApplicationStatus.APPROVED });
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/applications/1/status', null, {
        params: { status: ApplicationStatus.APPROVED },
      });
    });
  });

  describe('uploadFiles', () => {
    it('uploads files to an application', async () => {
      const files = [new File(['content'], 'resume.pdf'), new File(['content'], 'cover.pdf')];
      const mockResponse: FileUploadResponse = {
        uploadedFiles: [
          { id: 'file1', fileName: 'resume.pdf', fileSize: 1000 },
          { id: 'file2', fileName: 'cover.pdf', fileSize: 2000 },
        ],
      };
      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse } as any);

      const result = await applicationService.uploadFiles('1', files);
      expect(result).toEqual(mockResponse);
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith(
        '/api/files/upload/multiple/application/1',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });
  });

  describe('downloadFile', () => {
    it('downloads a file from an application', async () => {
      const mockBlob = new Blob([], { type: 'application/pdf' });
      vi.mocked(axios.get).mockResolvedValueOnce({ 
        data: mockBlob,
        headers: { 'content-type': 'application/pdf' }
      } as any);

      const result = await applicationService.downloadFile('1', 'file1');
      expect(result).toBeInstanceOf(Blob);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/files/download/file1', {
        responseType: 'blob',
      });
    });
  });

  describe('getMyApplications', () => {
    it('fetches current user applications', async () => {
      const mockResponse: PagedResponse<Application> = {
        content: [
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', status: ApplicationStatus.PENDING },
        ],
        pageInfo: { page: 0, size: 20, totalElements: 1, totalPages: 1 },
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await applicationService.getMyApplications();
      expect(result).toEqual(mockResponse);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/applications/my-applications', {
        params: { page: 0, size: 20 },
      });
    });
  });

  describe('getApplicationsForReview', () => {
    it('fetches applications for review', async () => {
      const mockResponse: PagedResponse<Application> = {
        content: [
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', status: ApplicationStatus.PENDING },
        ],
        pageInfo: { page: 0, size: 20, totalElements: 1, totalPages: 1 },
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await applicationService.getApplicationsForReview();
      expect(result).toEqual(mockResponse);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/applications/for-review', {
        params: { page: 0, size: 20 },
      });
    });
  });

  describe('bulkForward', () => {
    it('bulk forwards applications', async () => {
      const forwardRequest: ForwardApplicationRequest = {
        reviewerIds: ['user1', 'user2'],
        message: 'Please review',
      };
      vi.mocked(axios.post).mockResolvedValue({ data: { success: true, data: 2 } } as any);

      const result = await applicationService.bulkForward(['1', '2'], forwardRequest);
      expect(result).toEqual({ success: true, data: 2 });
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/applications/bulk-forward', {
        applicationIds: ['1', '2'],
        ...forwardRequest,
      });
    });
  });

  describe('exportApplications', () => {
    it('exports applications to CSV', async () => {
      // Create a minimal mock blob for faster test execution
      const mockBlob = new Blob([], { type: 'text/csv' });
      vi.mocked(axios.get).mockResolvedValueOnce({ 
        data: mockBlob,
        headers: { 'content-type': 'text/csv' }
      } as any);

      const result = await applicationService.exportApplications();
      
      // Just verify it's a Blob and the API was called correctly
      expect(result).toBeInstanceOf(Blob);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/applications/export', {
        params: undefined,
        responseType: 'blob',
      });
    });

    it('exports applications with filters', async () => {
      const mockBlob = new Blob([], { type: 'text/csv' });
      const filter: ApplicationFilter = { status: ApplicationStatus.PENDING };
      vi.mocked(axios.get).mockResolvedValueOnce({ 
        data: mockBlob,
        headers: { 'content-type': 'text/csv' }
      } as any);

      const result = await applicationService.exportApplications(filter);
      
      expect(result).toBeInstanceOf(Blob);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/applications/export', {
        params: filter,
        responseType: 'blob',
      });
    });
  });

  describe('getApplicationStatistics', () => {
    it('fetches application statistics', async () => {
      const mockStats: ApplicationStatistics = {
        total: 100,
        pending: 20,
        approved: 50,
        rejected: 30,
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockStats } as any);

      const result = await applicationService.getApplicationStatistics();
      expect(result).toEqual(mockStats);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/applications/statistics', { params: {} });
    });

    it('fetches application statistics for a position', async () => {
      const mockStats: ApplicationStatistics = {
        total: 50,
        pending: 10,
        approved: 30,
        rejected: 10,
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockStats } as any);

      const result = await applicationService.getApplicationStatistics('pos1');
      expect(result).toEqual(mockStats);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/applications/statistics', {
        params: { positionId: 'pos1' },
      });
    });
  });

  describe('validateApplicationData', () => {
    it('validates application data correctly', () => {
      const validData: CreateApplicationRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        kvkkConsent: true,
      };
      const errors = applicationService.validateApplicationData(validData);
      expect(errors).toHaveLength(0);
    });

    it('returns errors for missing required fields', () => {
      const invalidData: Partial<CreateApplicationRequest> = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        kvkkConsent: false,
      };
      const errors = applicationService.validateApplicationData(invalidData as CreateApplicationRequest);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('First name is required');
      expect(errors).toContain('Last name is required');
      expect(errors).toContain('Valid email is required');
      expect(errors).toContain('Phone number is required');
      expect(errors).toContain('KVKK consent is required');
    });

    it('returns error for invalid email', () => {
      const invalidData: CreateApplicationRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '1234567890',
        kvkkConsent: true,
      };
      const errors = applicationService.validateApplicationData(invalidData);
      expect(errors).toContain('Valid email is required');
    });

    it('returns error for invalid TCKN', () => {
      const invalidData: CreateApplicationRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        kvkkConsent: true,
        tckn: '12345678901', // Invalid TCKN
      };
      const errors = applicationService.validateApplicationData(invalidData);
      expect(errors).toContain('Invalid TCKN number');
    });
  });
});

