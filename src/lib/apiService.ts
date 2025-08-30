import { auth } from './firebase';
import { UserData } from './userState';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export class ApiService {
  private static async getAuthToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return null;
      }
      return await currentUser.getIdToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private static async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { error: 'No authentication token available' };
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { error: errorData.detail || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: 'Network error occurred' };
    }
  }

  static async getCurrentUser(): Promise<ApiResponse<UserData>> {
    return this.makeAuthenticatedRequest<UserData>('/auth/me');
  }

  static async updateUserProfile(updates: Partial<UserData>): Promise<ApiResponse<UserData>> {
    return this.makeAuthenticatedRequest<UserData>('/auth/update-onboarding', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
}
