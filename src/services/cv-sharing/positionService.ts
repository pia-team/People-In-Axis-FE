import axios from '@/services/api';
import { apiPath } from '@/config/apiPaths';
import {
  Position,
  CreatePositionRequest,
  UpdatePositionRequest,
  PositionFilter,
  PagedResponse,
  PositionTemplate,
  ApiResponse,
  PositionStatus,
  PositionStatistics,
  PositionMatch,
  MatchedCVResponse,
  Skill,
  Language
} from '@/types/cv-sharing';
import type { SpringPageResponse } from '@/types/api';
import { isSpringPageResponse } from '@/types/api';

class PositionService {
  private baseUrl = apiPath('positions');

  private normalizePosition = (raw: Partial<Position> & Record<string, unknown>): Position => {
    if (!raw) {
      throw new Error('Position data is required');
    }
    const normalized: Position = {
      ...raw as Position,
      createdBy: (raw.createdByName as string | undefined) ?? (raw.createdBy as string | undefined),
      skills: Array.isArray(raw.skills)
        ? (raw.skills as unknown[]).map((s: unknown) => {
            const skill = s as Partial<Skill> & Record<string, unknown>;
            return {
              id: skill.id as string | undefined,
              name: (skill.skillName as string | undefined) ?? (skill.name as string | undefined) ?? '',
              isRequired: skill.isRequired as boolean | undefined,
              proficiencyLevel: skill.proficiencyLevel as string | undefined,
              yearsOfExperience: skill.yearsOfExperience as number | undefined
            };
          })
        : (raw.skills as Skill[] | undefined) ?? [],
      languages: Array.isArray(raw.languages)
        ? (raw.languages as unknown[]).map((l: unknown) => {
            const lang = l as Partial<Language> & Record<string, unknown>;
            return {
              id: lang.id as string | undefined,
              code: (lang.languageCode as string | undefined) ?? (lang.code as string | undefined) ?? '',
              proficiencyLevel: (lang.proficiencyLevel as Language['proficiencyLevel']) ?? 'A1'
            };
          })
        : (raw.languages as Language[] | undefined) ?? [],
    };
    return normalized;
  };

  /**
   * Get paginated list of positions
   */
  async getPositions(filter?: PositionFilter): Promise<PagedResponse<Position>> {
    const response = await axios.get<SpringPageResponse<Position> | Position[]>(this.baseUrl, {
      params: filter
    });
    const data = response.data;
    
    let content: Position[];
    let pageInfo: PagedResponse<Position>["pageInfo"];
    
    if (isSpringPageResponse<Position>(data)) {
      content = data.content.map((item) => this.normalizePosition(item as Partial<Position> & Record<string, unknown>));
      pageInfo = {
        page: data.number ?? filter?.page ?? 0,
        size: data.size ?? filter?.size ?? 10,
        totalElements: data.totalElements ?? content.length,
        totalPages: data.totalPages ?? 1,
      };
    } else if (Array.isArray(data)) {
      content = data.map((item) => this.normalizePosition(item as Partial<Position> & Record<string, unknown>));
      pageInfo = {
        page: filter?.page ?? 0,
        size: filter?.size ?? 10,
        totalElements: content.length,
        totalPages: 1,
      };
    } else {
      content = [];
      pageInfo = {
        page: filter?.page ?? 0,
        size: filter?.size ?? 10,
        totalElements: 0,
        totalPages: 1,
      };
    }
    
    return { content, pageInfo };
  }

  /**
   * Get position by ID
   */
  async getPositionById(id: string): Promise<Position> {
    const response = await axios.get<Position>(`${this.baseUrl}/${id}`);
    return this.normalizePosition(response.data as Partial<Position> & Record<string, unknown>) as Position;
  }

  /**
   * Create new position
   */
  async createPosition(data: CreatePositionRequest): Promise<Position> {
    const response = await axios.post<Position>(this.baseUrl, data);
    return this.normalizePosition(response.data as Partial<Position> & Record<string, unknown>) as Position;
  }

  /**
   * Update existing position
   */
  async updatePosition(id: string, data: UpdatePositionRequest): Promise<Position> {
    const response = await axios.patch<Position>(`${this.baseUrl}/${id}`, data);
    return this.normalizePosition(response.data as Partial<Position> & Record<string, unknown>) as Position;
  }

  /**
   * Delete position (only allowed for drafts on backend)
   */
  async deletePosition(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Duplicate position from existing or template
   */
  async duplicatePosition(id: string): Promise<Position> {
    const response = await axios.post<Position>(`${this.baseUrl}/${id}/duplicate`);
    return this.normalizePosition(response.data as Partial<Position> & Record<string, unknown>) as Position;
  }

  /**
   * Change position status
   */
  async updatePositionStatus(id: string, status: string): Promise<Position> {
    const response = await axios.post<Position>(`${this.baseUrl}/${id}/status`, null, {
      params: { status }
    });
    return this.normalizePosition(response.data as Partial<Position> & Record<string, unknown>) as Position;
  }

  /**
   * Archive position
   */
  async archivePosition(id: string): Promise<void> {
    await axios.post(`${this.baseUrl}/${id}/archive`);
  }

  /**
   * Get position templates
   */
  async getPositionTemplates(): Promise<PositionTemplate[]> {
    const response = await axios.get<PositionTemplate[]>(`${this.baseUrl}/templates`);
    return response.data;
  }

  /**
   * Create position from template
   */
  async createFromTemplate(templateId: string, data: Partial<CreatePositionRequest>): Promise<Position> {
    const response = await axios.post<Position>(`${this.baseUrl}/templates/${templateId}/create`, data);
    return response.data;
  }

  /**
   * Get position statistics
   */
  async getPositionStatistics(positionId: string): Promise<PositionStatistics> {
    const response = await axios.get<PositionStatistics>(`${this.baseUrl}/${positionId}/statistics`);
    return response.data;
  }

  /**
   * Get recorded matches for a position (from cv_position_match)
   */
  async getMatchesForPosition(positionId: string, page = 0, size = 10): Promise<PagedResponse<PositionMatch>> {
    const response = await axios.get<SpringPageResponse<PositionMatch> | PositionMatch[]>(`${this.baseUrl}/${positionId}/matches`, {
      params: { page, size }
    });
    const data = response.data;
    
    let content: PositionMatch[];
    let pageInfo: PagedResponse<PositionMatch>["pageInfo"];
    
    if (isSpringPageResponse<PositionMatch>(data)) {
      content = data.content;
      pageInfo = {
        page: data.number ?? page,
        size: data.size ?? size,
        totalElements: data.totalElements ?? content.length,
        totalPages: data.totalPages ?? 1,
      };
    } else if (Array.isArray(data)) {
      content = data;
      pageInfo = {
        page,
        size,
        totalElements: content.length,
        totalPages: 1,
      };
    } else {
      content = [];
      pageInfo = {
        page,
        size,
        totalElements: 0,
        totalPages: 1,
      };
    }
    
    return { content, pageInfo };
  }

  /**
   * Remove recorded Pool CV match & application from a position
   */
  async removeMatch(positionId: string, poolCvId: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${positionId}/matches/${poolCvId}`);
  }

  /**
   * Match all Pool CVs with a position and return detailed matching results
   * Only accessible by HR and MANAGER roles
   */
  async matchAllCVsForPosition(positionId: string, page = 0, size = 20): Promise<PagedResponse<MatchedCVResponse>> {
    const response = await axios.get<SpringPageResponse<MatchedCVResponse> | MatchedCVResponse[]>(
      `${this.baseUrl}/${positionId}/match-all-cvs`,
      {
        params: { page, size }
      }
    );
    const data = response.data;
    
    let content: MatchedCVResponse[];
    let pageInfo: PagedResponse<MatchedCVResponse>["pageInfo"];
    
    if (isSpringPageResponse<MatchedCVResponse>(data)) {
      content = data.content;
      pageInfo = {
        page: data.number ?? page,
        size: data.size ?? size,
        totalElements: data.totalElements ?? content.length,
        totalPages: data.totalPages ?? 1,
      };
    } else if (Array.isArray(data)) {
      content = data;
      pageInfo = {
        page,
        size,
        totalElements: content.length,
        totalPages: 1,
      };
    } else {
      content = [];
      pageInfo = {
        page,
        size,
        totalElements: 0,
        totalPages: 1,
      };
    }
    
    return { content, pageInfo };
  }

  /**
   * Export positions to CSV
   */
  async exportPositions(filter?: PositionFilter): Promise<Blob> {
    const response = await axios.get(`${this.baseUrl}/export`, {
      params: filter,
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Validate position data before submission
   */
  validatePositionData(data: CreatePositionRequest): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Position name is required');
    }

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Position title is required');
    }

    if (data.applicationDeadline) {
      const deadline = new Date(data.applicationDeadline);
      if (deadline < new Date()) {
        errors.push('Application deadline must be in the future');
      }
    }

    if (data.salaryRangeMin && data.salaryRangeMax) {
      if (data.salaryRangeMin > data.salaryRangeMax) {
        errors.push('Minimum salary cannot be greater than maximum salary');
      }
    }

    return errors;
  }

  /**
   * Search positions with advanced filters
   */
  async searchPositions(query: string, filters?: Partial<PositionFilter>): Promise<PagedResponse<Position>> {
    return this.getPositions({
      ...filters,
      q: query
    });
  }

  /**
   * Get active positions for applicants
   */
  async getActivePositions(page = 0, size = 20): Promise<PagedResponse<Position>> {
    return this.getPositions({
      status: PositionStatus.ACTIVE,
      page,
      size
    });
  }

  /**
   * Bulk update positions
   */
  async bulkUpdatePositions(ids: string[], updates: Partial<UpdatePositionRequest>): Promise<ApiResponse<number>> {
    const response = await axios.patch<ApiResponse<number>>(`${this.baseUrl}/bulk`, {
      ids,
      updates
    });
    return response.data;
  }
}

export const positionService = new PositionService();
