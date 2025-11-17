import { describe, it, expect, vi, beforeEach } from 'vitest';
import { poolCVService } from '@/services/cv-sharing/poolCVService';
import axios from '@/services/api';
import type {
  PoolCV,
  PoolCVDetail,
  CreatePoolCVRequest,
  UpdatePoolCVRequest,
  PoolCVFilter,
  PagedResponse,
  ApiResponse,
  FileUploadResponse,
  PoolCVStatistics,
} from '@/types/cv-sharing';
import { MatchedPosition } from '@/types/cv-sharing/matched-position';

vi.mock('@/services/api');
vi.mock('@/config/apiPaths', () => ({
  apiPath: (path: string) => `/api/${path}`,
}));

describe('poolCVService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPoolCVs', () => {
    it('fetches paginated pool CVs', async () => {
      const mockResponse: PagedResponse<PoolCV> = {
        content: [
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', isActive: true },
          { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', isActive: true },
        ],
        pageInfo: { page: 0, size: 10, totalElements: 2, totalPages: 1 },
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await poolCVService.getPoolCVs();
      expect(result.content).toHaveLength(2);
      expect(result.pageInfo.totalElements).toBe(2);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/pool-cvs', { params: undefined });
    });

    it('fetches pool CVs with filter', async () => {
      const filter: PoolCVFilter = { isActive: true, page: 0, size: 10 };
      const mockResponse: PagedResponse<PoolCV> = {
        content: [],
        pageInfo: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await poolCVService.getPoolCVs(filter);
      expect(result.content).toHaveLength(0);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/pool-cvs', { params: filter });
    });
  });

  describe('getPoolCVById', () => {
    it('fetches pool CV by ID', async () => {
      const mockPoolCV: PoolCVDetail = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isActive: true,
      } as PoolCVDetail;
      vi.mocked(axios.get).mockResolvedValue({ data: mockPoolCV } as any);

      const result = await poolCVService.getPoolCVById('1');
      expect(result).toEqual(mockPoolCV);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/pool-cvs/1');
    });
  });

  describe('createPoolCV', () => {
    it('creates a new pool CV', async () => {
      const createRequest: CreatePoolCVRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        kvkkConsent: true,
      };
      const mockPoolCV: PoolCV = {
        id: '1',
        ...createRequest,
        isActive: true,
      };
      vi.mocked(axios.post).mockResolvedValue({ data: mockPoolCV } as any);

      const result = await poolCVService.createPoolCV(createRequest);
      expect(result).toEqual(mockPoolCV);
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/pool-cvs', createRequest);
    });
  });

  describe('updatePoolCV', () => {
    it('updates a pool CV', async () => {
      const updateRequest: UpdatePoolCVRequest = {
        firstName: 'John Updated',
      };
      const mockPoolCV: PoolCV = {
        id: '1',
        firstName: 'John Updated',
        lastName: 'Doe',
        email: 'john@example.com',
        isActive: true,
      };
      vi.mocked(axios.put).mockResolvedValue({ data: mockPoolCV } as any);

      const result = await poolCVService.updatePoolCV('1', updateRequest);
      expect(result).toEqual(mockPoolCV);
      expect(vi.mocked(axios.put)).toHaveBeenCalledWith('/api/pool-cvs/1', updateRequest);
    });
  });

  describe('deletePoolCV', () => {
    it('deletes a pool CV', async () => {
      vi.mocked(axios.delete).mockResolvedValue({} as any);

      await poolCVService.deletePoolCV('1');
      expect(vi.mocked(axios.delete)).toHaveBeenCalledWith('/api/pool-cvs/1');
    });
  });

  describe('togglePoolCVStatus', () => {
    it('activates a pool CV', async () => {
      const mockPoolCV: PoolCV = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isActive: true,
      };
      vi.mocked(axios.patch).mockResolvedValue({ data: mockPoolCV } as any);

      const result = await poolCVService.togglePoolCVStatus('1', true);
      expect(result).toEqual(mockPoolCV);
      expect(vi.mocked(axios.patch)).toHaveBeenCalledWith('/api/pool-cvs/1/status', null, {
        params: { active: true },
      });
    });

    it('deactivates a pool CV', async () => {
      const mockPoolCV: PoolCV = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isActive: false,
      };
      vi.mocked(axios.patch).mockResolvedValue({ data: mockPoolCV } as any);

      const result = await poolCVService.togglePoolCVStatus('1', false);
      expect(result).toEqual(mockPoolCV);
      expect(vi.mocked(axios.patch)).toHaveBeenCalledWith('/api/pool-cvs/1/status', null, {
        params: { active: false },
      });
    });
  });

  describe('uploadFiles', () => {
    it('uploads files to a pool CV', async () => {
      const files = [new File(['content'], 'resume.pdf'), new File(['content'], 'cover.pdf')];
      const mockResponse: FileUploadResponse = {
        uploadedFiles: [
          { id: 'file1', fileName: 'resume.pdf', fileSize: 1000 },
          { id: 'file2', fileName: 'cover.pdf', fileSize: 2000 },
        ],
      };
      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse } as any);

      const result = await poolCVService.uploadFiles('1', files);
      expect(result).toEqual(mockResponse);
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith(
        '/api/files/upload/multiple/pool-cv/1',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });
  });

  describe('deleteFile', () => {
    it('deletes a file from a pool CV', async () => {
      vi.mocked(axios.delete).mockResolvedValue({} as any);

      await poolCVService.deleteFile('1', 'file1');
      expect(vi.mocked(axios.delete)).toHaveBeenCalledWith('/api/files/file1');
    });
  });

  describe('downloadFile', () => {
    it('downloads a file from a pool CV', async () => {
      const mockBlob = new Blob([], { type: 'application/pdf' });
      vi.mocked(axios.get).mockResolvedValueOnce({ 
        data: mockBlob,
        headers: { 'content-type': 'application/pdf' }
      } as any);

      const result = await poolCVService.downloadFile('1', 'file1');
      expect(result).toBeInstanceOf(Blob);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/files/download/file1', {
        responseType: 'blob',
      });
    });
  });

  describe('searchBySkills', () => {
    it('searches pool CVs by skills', async () => {
      const mockResponse: PagedResponse<PoolCV> = {
        content: [
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', isActive: true },
        ],
        pageInfo: { page: 0, size: 20, totalElements: 1, totalPages: 1 },
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await poolCVService.searchBySkills(['JavaScript', 'TypeScript']);
      expect(result).toEqual(mockResponse);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/pool-cvs', {
        params: { skills: ['JavaScript', 'TypeScript'], page: 0, size: 20 },
      });
    });
  });

  describe('searchByLanguages', () => {
    it('searches pool CVs by languages', async () => {
      const mockResponse: PagedResponse<PoolCV> = {
        content: [
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', isActive: true },
        ],
        pageInfo: { page: 0, size: 20, totalElements: 1, totalPages: 1 },
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await poolCVService.searchByLanguages(['en', 'tr']);
      expect(result).toEqual(mockResponse);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/pool-cvs', {
        params: { languages: ['en', 'tr'], page: 0, size: 20 },
      });
    });
  });

  describe('searchByTags', () => {
    it('searches pool CVs by tags', async () => {
      const mockResponse: PagedResponse<PoolCV> = {
        content: [
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', isActive: true },
        ],
        pageInfo: { page: 0, size: 20, totalElements: 1, totalPages: 1 },
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await poolCVService.searchByTags(['senior', 'frontend']);
      expect(result).toEqual(mockResponse);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/pool-cvs', {
        params: { tags: ['senior', 'frontend'], page: 0, size: 20 },
      });
    });
  });

  describe('getMyPoolCVs', () => {
    it('fetches current user pool CVs', async () => {
      const mockResponse: PagedResponse<PoolCV> = {
        content: [
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', isActive: true },
        ],
        pageInfo: { page: 0, size: 20, totalElements: 1, totalPages: 1 },
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await poolCVService.getMyPoolCVs();
      expect(result).toEqual(mockResponse);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/pool-cvs/my-cvs', {
        params: { page: 0, size: 20 },
      });
    });
  });

  describe('addTags', () => {
    it('adds tags to a pool CV', async () => {
      const mockPoolCV: PoolCV = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isActive: true,
        tags: ['senior', 'frontend'],
      };
      vi.mocked(axios.post).mockResolvedValue({ data: mockPoolCV } as any);

      const result = await poolCVService.addTags('1', ['senior', 'frontend']);
      expect(result).toEqual(mockPoolCV);
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/pool-cvs/1/tags', {
        tags: ['senior', 'frontend'],
      });
    });
  });

  describe('removeTag', () => {
    it('removes a tag from a pool CV', async () => {
      const mockPoolCV: PoolCV = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isActive: true,
        tags: ['frontend'],
      };
      vi.mocked(axios.delete).mockResolvedValue({ data: mockPoolCV } as any);

      const result = await poolCVService.removeTag('1', 'senior');
      expect(result).toEqual(mockPoolCV);
      expect(vi.mocked(axios.delete)).toHaveBeenCalledWith('/api/pool-cvs/1/tags/senior');
    });
  });

  describe('getSuggestedTags', () => {
    it('fetches suggested tags', async () => {
      const mockTags = ['senior', 'frontend', 'backend', 'fullstack'];
      vi.mocked(axios.get).mockResolvedValue({ data: mockTags } as any);

      const result = await poolCVService.getSuggestedTags();
      expect(result).toEqual(mockTags);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/pool-cvs/tags/suggestions');
    });
  });

  describe('exportPoolCVs', () => {
    it('exports pool CVs to CSV', async () => {
      const mockBlob = new Blob([], { type: 'text/csv' });
      vi.mocked(axios.get).mockResolvedValueOnce({ 
        data: mockBlob,
        headers: { 'content-type': 'text/csv' }
      } as any);

      const result = await poolCVService.exportPoolCVs();
      expect(result).toBeInstanceOf(Blob);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/pool-cvs/export', {
        params: undefined,
        responseType: 'blob',
      });
    });
  });

  describe('importPoolCVs', () => {
    it('imports pool CVs from CSV', async () => {
      const mockFile = new File(['csv content'], 'pool-cvs.csv', { type: 'text/csv' });
      const mockResponse: ApiResponse<number> = {
        success: true,
        data: 10,
      };
      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse } as any);

      const result = await poolCVService.importPoolCVs(mockFile);
      expect(result).toEqual(mockResponse);
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith(
        '/api/pool-cvs/import',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });
  });

  describe('validatePoolCVData', () => {
    it('validates pool CV data correctly', () => {
      const validData: CreatePoolCVRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        kvkkConsent: true,
      };
      const errors = poolCVService.validatePoolCVData(validData);
      expect(errors).toHaveLength(0);
    });

    it('returns errors for missing required fields', () => {
      const invalidData: Partial<CreatePoolCVRequest> = {
        firstName: '',
        lastName: '',
        email: '',
        kvkkConsent: false,
      };
      const errors = poolCVService.validatePoolCVData(invalidData as CreatePoolCVRequest);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('First name is required');
      expect(errors).toContain('Last name is required');
      expect(errors).toContain('Valid email is required');
      expect(errors).toContain('KVKK consent is required');
    });

    it('returns error for invalid email', () => {
      const invalidData: CreatePoolCVRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        kvkkConsent: true,
      };
      const errors = poolCVService.validatePoolCVData(invalidData);
      expect(errors).toContain('Valid email is required');
    });

    it('returns error for invalid TCKN', () => {
      const invalidData: CreatePoolCVRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        kvkkConsent: true,
        tckn: '12345678901', // Invalid TCKN
      };
      const errors = poolCVService.validatePoolCVData(invalidData);
      expect(errors).toContain('Invalid TCKN number');
    });

    it('returns error for negative experience years', () => {
      const invalidData: CreatePoolCVRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        kvkkConsent: true,
        experienceYears: -1,
      };
      const errors = poolCVService.validatePoolCVData(invalidData);
      expect(errors).toContain('Experience years cannot be negative');
    });
  });

  describe('getStatistics', () => {
    it('fetches pool CV statistics', async () => {
      const mockStats: PoolCVStatistics = {
        total: 100,
        active: 80,
        inactive: 20,
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockStats } as any);

      const result = await poolCVService.getStatistics();
      expect(result).toEqual(mockStats);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/pool-cvs/statistics');
    });
  });

  describe('matchWithPosition', () => {
    it('matches pool CVs with position requirements', async () => {
      const mockPoolCVs: PoolCV[] = [
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', isActive: true },
        { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', isActive: true },
      ];
      vi.mocked(axios.get).mockResolvedValue({ data: mockPoolCVs } as any);

      const result = await poolCVService.matchWithPosition('pos1', 10);
      expect(result).toEqual(mockPoolCVs);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/pool-cvs/match/pos1', {
        params: { limit: 10 },
      });
    });
  });

  describe('matchPositionsForPoolCV', () => {
    it('matches positions for a pool CV', async () => {
      const mockPositions: MatchedPosition[] = [
        { id: '1', title: 'Senior Developer', matchScore: 0.95 },
        { id: '2', title: 'Frontend Developer', matchScore: 0.85 },
      ];
      const mockResponse: PagedResponse<MatchedPosition> = {
        content: mockPositions,
        pageInfo: { page: 0, size: 10, totalElements: 2, totalPages: 1 },
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await poolCVService.matchPositionsForPoolCV('cv1');
      expect(result).toEqual(mockPositions);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/pool-cvs/cv1/match-positions', {
        params: { page: 0, size: 10 },
      });
    });
  });

  describe('matchPosition', () => {
    it('records a match decision between a pool CV and a position', async () => {
      const mockResponse = { success: true, message: 'Match recorded' };
      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse } as any);

      const result = await poolCVService.matchPosition('cv1', 'pos1', {
        matchScore: 0.95,
        comment: 'Perfect match',
      });
      expect(result).toEqual(mockResponse);
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/pool-cvs/cv1/match/pos1', {
        matchScore: 0.95,
        comment: 'Perfect match',
      });
    });

    it('records a match decision without optional data', async () => {
      const mockResponse = { success: true };
      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse } as any);

      const result = await poolCVService.matchPosition('cv1', 'pos1');
      expect(result).toEqual(mockResponse);
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/pool-cvs/cv1/match/pos1', {});
    });
  });
});

