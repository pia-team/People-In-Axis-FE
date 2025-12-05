import { apiClient } from './api';

export interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string | null;
  userId: string | null;
  username: string | null;
  companyId: string | null;
  details: string | null;
  changesJson: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditLogPage {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface FieldChange {
  field: string;
  fieldLabel: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface ParsedChanges {
  changes: FieldChange[];
}

/**
 * Parse changesJson string into structured changes
 */
export const parseChanges = (changesJson: string | null): FieldChange[] => {
  if (!changesJson) return [];
  try {
    const parsed: ParsedChanges = JSON.parse(changesJson);
    return parsed.changes || [];
  } catch {
    return [];
  }
};

/**
 * Get human-readable action label
 */
export const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    // PoolCV
    POOL_CV_CREATED: 'CV Oluşturuldu',
    POOL_CV_UPDATED: 'CV Güncellendi',
    POOL_CV_DELETED: 'CV Silindi',
    POOL_CV_STATUS_CHANGED: 'CV Durumu Değişti',
    // Position
    POSITION_CREATED: 'Pozisyon Oluşturuldu',
    POSITION_UPDATED: 'Pozisyon Güncellendi',
    POSITION_DELETED: 'Pozisyon Silindi',
    POSITION_STATUS_CHANGED: 'Pozisyon Durumu Değişti',
    // Application
    APPLICATION_CREATED: 'Başvuru Oluşturuldu',
    APPLICATION_STATUS_CHANGED: 'Başvuru Durumu Değişti',
    APPLICATION_FORWARDED: 'Başvuru İletildi',
    // Meeting
    MEETING_CREATED: 'Görüşme Planlandı',
    MEETING_UPDATED: 'Görüşme Güncellendi',
    MEETING_CANCELLED: 'Görüşme İptal Edildi',
    // Matching
    MATCHING_CONFIG_UPDATED: 'Eşleştirme Ayarları Güncellendi',
    SKILL_ALIAS_UPSERT: 'Yetenek Eşleştirmesi Eklendi',
    SKILL_ALIAS_UPDATED: 'Yetenek Eşleştirmesi Güncellendi',
    SKILL_ALIAS_DELETED: 'Yetenek Eşleştirmesi Silindi',
  };
  return labels[action] || action;
};

/**
 * Get entity type label
 */
export const getEntityTypeLabel = (entityType: string): string => {
  const labels: Record<string, string> = {
    PoolCV: 'CV',
    Position: 'Pozisyon',
    Application: 'Başvuru',
    Meeting: 'Görüşme',
    MatchingConfig: 'Eşleştirme Ayarları',
    SkillAlias: 'Yetenek Eşleştirmesi',
  };
  return labels[entityType] || entityType;
};

/**
 * Get action color for badges
 */
export const getActionColor = (action: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  if (action.includes('CREATED')) return 'success';
  if (action.includes('UPDATED') || action.includes('CHANGED')) return 'warning';
  if (action.includes('DELETED') || action.includes('CANCELLED')) return 'error';
  if (action.includes('FORWARDED')) return 'info';
  return 'default';
};

export const auditLogService = {
  /**
   * Get audit logs (paginated)
   */
  getAll: async (params: {
    companyId?: string;
    page?: number;
    size?: number;
  }): Promise<AuditLogPage> => {
    const response = await apiClient.get<AuditLogPage>('/admin/audit-logs', {
      params: {
        companyId: params.companyId,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    });
    return response.data;
  },

  /**
   * Get logs for a specific entity
   */
  getByEntity: async (entityType: string, entityId: string): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>(`/admin/audit-logs/entity/${entityType}/${entityId}`);
    return response.data;
  },

  /**
   * Get logs for a specific user
   */
  getByUser: async (userId: string, params?: { page?: number; size?: number }): Promise<AuditLogPage> => {
    const response = await apiClient.get<AuditLogPage>(`/admin/audit-logs/user/${userId}`, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    });
    return response.data;
  },

  /**
   * Manually trigger cleanup
   */
  cleanup: async (retentionDays: number = 90): Promise<{ deletedCount: number; retentionDays: number }> => {
    const response = await apiClient.delete<{ deletedCount: number; retentionDays: number }>('/admin/audit-logs/cleanup', {
      params: { retentionDays },
    });
    return response.data;
  },
};

export default auditLogService;

