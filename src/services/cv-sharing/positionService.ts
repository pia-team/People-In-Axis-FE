import axios from '@/services/api';
import { apiPath } from '@/config/apiPaths';
import {
  Position,
  CreatePositionRequest,
  UpdatePositionRequest,
  PositionFilter,
  PagedResponse,
  PositionTemplate,
  ApiResponse
} from '@/types/cv-sharing';

class PositionService {
  private baseUrl = apiPath('positions');

  private normalizePosition = (raw: any) => {
    if (!raw) return raw;
    const normalized = {
      ...raw,
      createdBy: raw.createdByName ?? raw.createdBy,
      skills: Array.isArray(raw.skills)
        ? raw.skills.map((s: any) => ({ id: s.id, name: s.skillName ?? s.name, isRequired: s.isRequired }))
        : raw.skills,
      languages: Array.isArray(raw.languages)
        ? raw.languages.map((l: any) => ({ id: l.id, code: l.languageCode ?? l.code, proficiencyLevel: l.proficiencyLevel }))
        : raw.languages,
    } as any;
    return normalized;
  };

  /**
   * Get paginated list of positions
   */
  async getPositions(filter?: PositionFilter): Promise<PagedResponse<Position>> {
    const response = await axios.get(this.baseUrl, {
      params: filter
    });
    const d: any = response.data;
    const rawContent: any[] = Array.isArray(d?.content) ? d.content : (Array.isArray(d) ? d : []);
    const content: Position[] = rawContent.map(this.normalizePosition) as Position[];
    const pageInfo = {
      page: d?.number ?? d?.pageInfo?.page ?? filter?.page ?? 0,
      size: d?.size ?? d?.pageInfo?.size ?? filter?.size ?? 10,
      totalElements: d?.totalElements ?? d?.pageInfo?.totalElements ?? content.length ?? 0,
      totalPages: d?.totalPages ?? d?.pageInfo?.totalPages ?? 1,
    } as PagedResponse<Position>["pageInfo"];
    return { content, pageInfo } as PagedResponse<Position>;
  }

  /**
   * Get position by ID
   */
  async getPositionById(id: string): Promise<Position> {
    const response = await axios.get<Position>(`${this.baseUrl}/${id}`);
    return this.normalizePosition(response.data) as Position;
  }

  /**
   * Create new position
   */
  async createPosition(data: CreatePositionRequest): Promise<Position> {
    const response = await axios.post<Position>(this.baseUrl, data);
    return this.normalizePosition(response.data) as Position;
  }

  /**
   * Update existing position
   */
  async updatePosition(id: string, data: UpdatePositionRequest): Promise<Position> {
    const response = await axios.patch<Position>(`${this.baseUrl}/${id}`, data);
    return this.normalizePosition(response.data) as Position;
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
    return this.normalizePosition(response.data) as Position;
  }

  /**
   * Change position status
   */
  async updatePositionStatus(id: string, status: string): Promise<Position> {
    const response = await axios.post<Position>(`${this.baseUrl}/${id}/status`, null, {
      params: { status }
    });
    return this.normalizePosition(response.data) as Position;
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
  async getPositionStatistics(positionId: string): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/${positionId}/statistics`);
    return response.data;
  }

  /**
   * Get recorded matches for a position (from cv_position_match)
   */
  async getMatchesForPosition(positionId: string, page = 0, size = 10): Promise<PagedResponse<any>> {
    const response = await axios.get(`${this.baseUrl}/${positionId}/matches`, {
      params: { page, size }
    });
    const d: any = response.data;
    const content: any[] = Array.isArray(d?.content) ? d.content : (Array.isArray(d) ? d : []);
    const pageInfo = {
      page: d?.number ?? page,
      size: d?.size ?? size,
      totalElements: d?.totalElements ?? content.length ?? 0,
      totalPages: d?.totalPages ?? 1,
    } as PagedResponse<any>["pageInfo"];
    return { content, pageInfo } as PagedResponse<any>;
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
      status: 'ACTIVE' as any,
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
