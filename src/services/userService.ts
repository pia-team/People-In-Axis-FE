import { apiClient } from './api';
import type { KeycloakUser } from '@/types/user';

export interface InviteUserRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  companyId?: number;
}

class UserService {
  async searchKeycloakUsers(q: string, max = 20): Promise<KeycloakUser[]> {
    const response = await apiClient.get<KeycloakUser[]>('/keycloak/users', {
      params: { q: q?.trim() || undefined, max }
    });
    return response.data;
  }

  async inviteUser(request: InviteUserRequest): Promise<KeycloakUser> {
    const response = await apiClient.post<KeycloakUser>('/keycloak/users/invite', request);
    return response.data;
  }
}

export const userService = new UserService();

