import { describe, it, expect, vi, beforeEach } from 'vitest';
import { positionService } from '@/services/cv-sharing/positionService';
import axios from '@/services/api';
import type {
  Position,
  CreatePositionRequest,
  UpdatePositionRequest,
  PositionFilter,
  PagedResponse,
  PositionTemplate,
  ApiResponse,
  PositionStatistics,
  PositionMatch,
} from '@/types/cv-sharing';
import { PositionStatus } from '@/types/cv-sharing';
import { SpringPageResponse } from '@/types/api';

vi.mock('@/services/api');
vi.mock('@/config/apiPaths', () => ({
  apiPath: (path: string) => `/api/${path}`,
}));

describe('positionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPositions', () => {
    it('fetches paginated positions with Spring page response', async () => {
      const mockResponse: SpringPageResponse<Position> = {
        content: [
          { id: '1', name: 'Software Engineer', title: 'Senior Developer', status: PositionStatus.ACTIVE },
          { id: '2', name: 'Product Manager', title: 'Product Manager', status: PositionStatus.ACTIVE },
        ],
        number: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await positionService.getPositions();
      expect(result.content).toHaveLength(2);
      expect(result.pageInfo.totalElements).toBe(2);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/positions', { params: undefined });
    });

    it('fetches positions with filter', async () => {
      const filter: PositionFilter = { status: PositionStatus.ACTIVE, page: 0, size: 10 };
      const mockResponse: SpringPageResponse<Position> = {
        content: [],
        number: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await positionService.getPositions(filter);
      expect(result.content).toHaveLength(0);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/positions', { params: filter });
    });

    it('handles array response', async () => {
      const mockPositions: Position[] = [
        { id: '1', name: 'Software Engineer', title: 'Senior Developer', status: PositionStatus.ACTIVE },
      ];
      vi.mocked(axios.get).mockResolvedValue({ data: mockPositions } as any);

      const result = await positionService.getPositions();
      expect(result.content).toHaveLength(1);
      expect(result.pageInfo.totalElements).toBe(1);
    });

    it('normalizes position data with skills and languages', async () => {
      const mockResponse: SpringPageResponse<any> = {
        content: [
          {
            id: '1',
            name: 'Software Engineer',
            title: 'Senior Developer',
            status: PositionStatus.ACTIVE,
            skills: [
              { skillName: 'JavaScript', isRequired: true },
              { name: 'TypeScript', isRequired: false },
            ],
            languages: [
              { languageCode: 'en', proficiencyLevel: 'C1' },
              { code: 'tr', proficiencyLevel: 'B2' },
            ],
          },
        ],
        number: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await positionService.getPositions();
      expect(result.content[0].skills).toHaveLength(2);
      expect(result.content[0].skills[0].name).toBe('JavaScript');
      expect(result.content[0].languages).toHaveLength(2);
      expect(result.content[0].languages[0].code).toBe('en');
    });
  });

  describe('getPositionById', () => {
    it('fetches position by ID', async () => {
      const mockPosition: Position = {
        id: '1',
        name: 'Software Engineer',
        title: 'Senior Developer',
        status: PositionStatus.ACTIVE,
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockPosition } as any);

      const result = await positionService.getPositionById('1');
      expect(result).toBeDefined();
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/positions/1');
    });
  });

  describe('createPosition', () => {
    it('creates a new position', async () => {
      const createRequest: CreatePositionRequest = {
        name: 'Software Engineer',
        title: 'Senior Developer',
        description: 'Job description',
      };
      const mockPosition: Position = {
        id: '1',
        ...createRequest,
        status: PositionStatus.DRAFT,
      };
      vi.mocked(axios.post).mockResolvedValue({ data: mockPosition } as any);

      const result = await positionService.createPosition(createRequest);
      expect(result).toBeDefined();
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/positions', createRequest);
    });
  });

  describe('updatePosition', () => {
    it('updates a position', async () => {
      const updateRequest: UpdatePositionRequest = {
        title: 'Senior Developer Updated',
      };
      const mockPosition: Position = {
        id: '1',
        name: 'Software Engineer',
        title: 'Senior Developer Updated',
        status: PositionStatus.ACTIVE,
      };
      vi.mocked(axios.patch).mockResolvedValue({ data: mockPosition } as any);

      const result = await positionService.updatePosition('1', updateRequest);
      expect(result).toBeDefined();
      expect(vi.mocked(axios.patch)).toHaveBeenCalledWith('/api/positions/1', updateRequest);
    });
  });

  describe('deletePosition', () => {
    it('deletes a position', async () => {
      vi.mocked(axios.delete).mockResolvedValue({} as any);

      await positionService.deletePosition('1');
      expect(vi.mocked(axios.delete)).toHaveBeenCalledWith('/api/positions/1');
    });
  });

  describe('duplicatePosition', () => {
    it('duplicates a position', async () => {
      const mockPosition: Position = {
        id: '2',
        name: 'Software Engineer',
        title: 'Senior Developer',
        status: PositionStatus.DRAFT,
      };
      vi.mocked(axios.post).mockResolvedValue({ data: mockPosition } as any);

      const result = await positionService.duplicatePosition('1');
      expect(result).toBeDefined();
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/positions/1/duplicate');
    });
  });

  describe('updatePositionStatus', () => {
    it('updates position status', async () => {
      const mockPosition: Position = {
        id: '1',
        name: 'Software Engineer',
        title: 'Senior Developer',
        status: PositionStatus.ACTIVE,
      };
      vi.mocked(axios.post).mockResolvedValue({ data: mockPosition } as any);

      const result = await positionService.updatePositionStatus('1', PositionStatus.ACTIVE);
      expect(result).toBeDefined();
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/positions/1/status', null, {
        params: { status: PositionStatus.ACTIVE },
      });
    });
  });

  describe('archivePosition', () => {
    it('archives a position', async () => {
      vi.mocked(axios.post).mockResolvedValue({} as any);

      await positionService.archivePosition('1');
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/positions/1/archive');
    });
  });

  describe('getPositionTemplates', () => {
    it('fetches position templates', async () => {
      const mockTemplates: PositionTemplate[] = [
        { id: '1', name: 'Software Engineer Template', title: 'Software Engineer' },
        { id: '2', name: 'Product Manager Template', title: 'Product Manager' },
      ];
      vi.mocked(axios.get).mockResolvedValue({ data: mockTemplates } as any);

      const result = await positionService.getPositionTemplates();
      expect(result).toEqual(mockTemplates);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/positions/templates');
    });
  });

  describe('createFromTemplate', () => {
    it('creates a position from template', async () => {
      const templateData: Partial<CreatePositionRequest> = {
        name: 'Software Engineer',
        title: 'Senior Developer',
      };
      const mockPosition: Position = {
        id: '1',
        name: 'Software Engineer',
        title: 'Senior Developer',
        status: PositionStatus.DRAFT,
      };
      vi.mocked(axios.post).mockResolvedValue({ data: mockPosition } as any);

      const result = await positionService.createFromTemplate('template1', templateData);
      expect(result).toEqual(mockPosition);
      expect(vi.mocked(axios.post)).toHaveBeenCalledWith(
        '/api/positions/templates/template1/create',
        templateData
      );
    });
  });

  describe('getPositionStatistics', () => {
    it('fetches position statistics', async () => {
      const mockStats: PositionStatistics = {
        totalApplications: 50,
        pendingApplications: 10,
        approvedApplications: 30,
        rejectedApplications: 10,
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockStats } as any);

      const result = await positionService.getPositionStatistics('pos1');
      expect(result).toEqual(mockStats);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/positions/pos1/statistics');
    });
  });

  describe('getMatchesForPosition', () => {
    it('fetches matches for a position with Spring page response', async () => {
      const mockResponse: SpringPageResponse<PositionMatch> = {
        content: [
          { id: '1', poolCvId: 'cv1', positionId: 'pos1', matchScore: 0.95 },
          { id: '2', poolCvId: 'cv2', positionId: 'pos1', matchScore: 0.85 },
        ],
        number: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await positionService.getMatchesForPosition('pos1');
      expect(result.content).toHaveLength(2);
      expect(result.pageInfo.totalElements).toBe(2);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/positions/pos1/matches', {
        params: { page: 0, size: 10 },
      });
    });

    it('fetches matches for a position with array response', async () => {
      const mockMatches: PositionMatch[] = [
        { id: '1', poolCvId: 'cv1', positionId: 'pos1', matchScore: 0.95 },
      ];
      vi.mocked(axios.get).mockResolvedValue({ data: mockMatches } as any);

      const result = await positionService.getMatchesForPosition('pos1');
      expect(result.content).toHaveLength(1);
      expect(result.pageInfo.totalElements).toBe(1);
    });
  });

  describe('exportPositions', () => {
    it('exports positions to CSV', async () => {
      const mockBlob = new Blob([], { type: 'text/csv' });
      vi.mocked(axios.get).mockResolvedValueOnce({ 
        data: mockBlob,
        headers: { 'content-type': 'text/csv' }
      } as any);

      const result = await positionService.exportPositions();
      expect(result).toBeInstanceOf(Blob);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/positions/export', {
        params: undefined,
        responseType: 'blob',
      });
    });

    it('exports positions with filter', async () => {
      const filter: PositionFilter = { status: PositionStatus.ACTIVE };
      const mockBlob = new Blob([], { type: 'text/csv' });
      vi.mocked(axios.get).mockResolvedValueOnce({ 
        data: mockBlob,
        headers: { 'content-type': 'text/csv' }
      } as any);

      const result = await positionService.exportPositions(filter);
      expect(result).toBeInstanceOf(Blob);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/positions/export', {
        params: filter,
        responseType: 'blob',
      });
    });
  });

  describe('validatePositionData', () => {
    it('validates position data correctly', () => {
      const validData: CreatePositionRequest = {
        name: 'Software Engineer',
        title: 'Senior Developer',
        description: 'Job description',
      };
      const errors = positionService.validatePositionData(validData);
      expect(errors).toHaveLength(0);
    });

    it('returns errors for missing required fields', () => {
      const invalidData: Partial<CreatePositionRequest> = {
        name: '',
        title: '',
      };
      const errors = positionService.validatePositionData(invalidData as CreatePositionRequest);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Position name is required');
      expect(errors).toContain('Position title is required');
    });

    it('returns error for past application deadline', () => {
      const pastDate = new Date('2020-01-01');
      const invalidData: CreatePositionRequest = {
        name: 'Software Engineer',
        title: 'Senior Developer',
        applicationDeadline: pastDate.toISOString(),
      };
      const errors = positionService.validatePositionData(invalidData);
      expect(errors).toContain('Application deadline must be in the future');
    });

    it('returns error when minimum salary is greater than maximum salary', () => {
      const invalidData: CreatePositionRequest = {
        name: 'Software Engineer',
        title: 'Senior Developer',
        salaryRangeMin: 10000,
        salaryRangeMax: 5000,
      };
      const errors = positionService.validatePositionData(invalidData);
      expect(errors).toContain('Minimum salary cannot be greater than maximum salary');
    });
  });

  describe('searchPositions', () => {
    it('searches positions with query and filters', async () => {
      const mockResponse: SpringPageResponse<Position> = {
        content: [
          { id: '1', name: 'Software Engineer', title: 'Senior Developer', status: PositionStatus.ACTIVE },
        ],
        number: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await positionService.searchPositions('developer', { status: PositionStatus.ACTIVE });
      expect(result.content).toHaveLength(1);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/positions', {
        params: { q: 'developer', status: PositionStatus.ACTIVE },
      });
    });
  });

  describe('getActivePositions', () => {
    it('fetches active positions', async () => {
      const mockResponse: SpringPageResponse<Position> = {
        content: [
          { id: '1', name: 'Software Engineer', title: 'Senior Developer', status: PositionStatus.ACTIVE },
        ],
        number: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await positionService.getActivePositions();
      expect(result.content).toHaveLength(1);
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/positions', {
        params: { status: PositionStatus.ACTIVE, page: 0, size: 20 },
      });
    });
  });

  describe('bulkUpdatePositions', () => {
    it('bulk updates positions', async () => {
      const updates: Partial<UpdatePositionRequest> = {
        status: PositionStatus.ACTIVE,
      };
      const mockResponse: ApiResponse<number> = {
        success: true,
        data: 5,
      };
      vi.mocked(axios.patch).mockResolvedValue({ data: mockResponse } as any);

      const result = await positionService.bulkUpdatePositions(['1', '2', '3'], updates);
      expect(result).toEqual(mockResponse);
      expect(vi.mocked(axios.patch)).toHaveBeenCalledWith('/api/positions/bulk', {
        ids: ['1', '2', '3'],
        updates,
      });
    });
  });
});

