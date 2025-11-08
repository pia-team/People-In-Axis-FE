import axios from '@/services/api';
import { apiPath } from '@/config/apiPaths';
import {
  PoolCV,
  PoolCVDetail,
  CreatePoolCVRequest,
  UpdatePoolCVRequest,
  PoolCVFilter,
  PagedResponse,
  ApiResponse
} from '@/types/cv-sharing';
import { MatchedPosition } from '@/types/cv-sharing/matched-position';

class PoolCVService {
  private baseUrl = apiPath('pool-cvs');

  /**
   * Get paginated list of pool CVs
   */
  async getPoolCVs(filter?: PoolCVFilter): Promise<PagedResponse<PoolCV>> {
    const response = await axios.get<PagedResponse<PoolCV>>(this.baseUrl, {
      params: filter
    });
    return response.data;
  }

  /**
   * Get pool CV details by ID
   */
  async getPoolCVById(id: string): Promise<PoolCVDetail> {
    const response = await axios.get<PoolCVDetail>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Create new pool CV
   */
  async createPoolCV(data: CreatePoolCVRequest): Promise<PoolCV> {
    const response = await axios.post<PoolCV>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Update pool CV
   */
  async updatePoolCV(id: string, data: UpdatePoolCVRequest): Promise<PoolCV> {
    const response = await axios.put<PoolCV>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Delete pool CV
   */
  async deletePoolCV(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Activate/Deactivate pool CV
   */
  async togglePoolCVStatus(id: string, isActive: boolean): Promise<PoolCV> {
    const response = await axios.patch<PoolCV>(`${this.baseUrl}/${id}/status`, null, {
      params: { active: isActive }
    });
    return response.data;
  }

  /**
   * Upload files to pool CV
   */
  async uploadFiles(poolCvId: string, files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await axios.post<any>(
      `${apiPath('files')}/upload/multiple/pool-cv/${poolCvId}`,
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
   * Delete file from pool CV
   */
  async deleteFile(_poolCvId: string, fileId: string): Promise<void> {
    await axios.delete(`${apiPath('files')}/${fileId}`);
  }

  /**
   * Download file from pool CV
   */
  async downloadFile(_poolCvId: string, fileId: string): Promise<Blob> {
    const response = await axios.get(`${apiPath('files')}/download/${fileId}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Search pool CVs by skills
   */
  async searchBySkills(skills: string[], page = 0, size = 20): Promise<PagedResponse<PoolCV>> {
    return this.getPoolCVs({
      skills,
      page,
      size
    });
  }

  /**
   * Search pool CVs by languages
   */
  async searchByLanguages(languages: string[], page = 0, size = 20): Promise<PagedResponse<PoolCV>> {
    return this.getPoolCVs({
      languages,
      page,
      size
    });
  }

  /**
   * Search pool CVs by tags
   */
  async searchByTags(tags: string[], page = 0, size = 20): Promise<PagedResponse<PoolCV>> {
    return this.getPoolCVs({
      tags,
      page,
      size
    });
  }

  /**
   * Get my pool CVs (for company users)
   */
  async getMyPoolCVs(page = 0, size = 20): Promise<PagedResponse<PoolCV>> {
    const response = await axios.get<PagedResponse<PoolCV>>(`${this.baseUrl}/my-cvs`, {
      params: { page, size }
    });
    return response.data;
  }

  /**
   * Add tags to pool CV
   */
  async addTags(poolCvId: string, tags: string[]): Promise<PoolCV> {
    const response = await axios.post<PoolCV>(`${this.baseUrl}/${poolCvId}/tags`, { tags });
    return response.data;
  }

  /**
   * Remove tag from pool CV
   */
  async removeTag(poolCvId: string, tag: string): Promise<PoolCV> {
    const response = await axios.delete<PoolCV>(`${this.baseUrl}/${poolCvId}/tags/${encodeURIComponent(tag)}`);
    return response.data;
  }

  /**
   * Get suggested tags
   */
  async getSuggestedTags(): Promise<string[]> {
    const response = await axios.get<string[]>(`${this.baseUrl}/tags/suggestions`);
    return response.data;
  }

  /**
   * Export pool CVs to CSV
   */
  async exportPoolCVs(filter?: PoolCVFilter): Promise<Blob> {
    const response = await axios.get(`${this.baseUrl}/export`, {
      params: filter,
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Import pool CVs from CSV
   */
  async importPoolCVs(file: File): Promise<ApiResponse<number>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<ApiResponse<number>>(
      `${this.baseUrl}/import`,
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
   * Validate pool CV data
   */
  validatePoolCVData(data: CreatePoolCVRequest): string[] {
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

    if (!data.kvkkConsent) {
      errors.push('KVKK consent is required');
    }

    if (data.tckn && !this.isValidTCKN(data.tckn)) {
      errors.push('Invalid TCKN number');
    }

    if (data.experienceYears && data.experienceYears < 0) {
      errors.push('Experience years cannot be negative');
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

  /**
   * Get pool CV statistics
   */
  async getStatistics(): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/statistics`);
    return response.data;
  }

  /**
   * Match pool CVs with position requirements
   */
  async matchWithPosition(positionId: string, limit = 10): Promise<PoolCV[]> {
    const response = await axios.get<PoolCV[]>(`${this.baseUrl}/match/${positionId}`, {
      params: { limit }
    });
    return response.data;
  }

  /**
   * Match positions for a specific Pool CV
   */
  async matchPositionsForPoolCV(poolCvId: string, page = 0, size = 10): Promise<MatchedPosition[]> {
    const response = await axios.get<PagedResponse<MatchedPosition>>(`${this.baseUrl}/${poolCvId}/match-positions`, {
      params: { page, size }
    });
    return response.data.content;
  }
}

export const poolCVService = new PoolCVService();
