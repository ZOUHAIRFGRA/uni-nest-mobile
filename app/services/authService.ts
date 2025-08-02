import { apiClient } from './apiClient';
import { StorageService } from './storageService';
import { API_ENDPOINTS } from '../utils/config';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  ApiResponse 
} from '../types';

export class AuthService {
  /**
   * Login user with email and password - Updated for API v2
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; message: string }> {
    try {
      const response = await apiClient.post<{ user: User; message: string }>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // API client returns data directly, cast to expected type
      const loginData = response as unknown as { user: User; message: string };

      if (loginData && loginData.user) {
        // Note: API v2 uses HTTP-only cookies for JWT, no token in response
        await StorageService.saveUserData(loginData.user);
      }

      return loginData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register new user - Updated for API v2 with enhanced student fields
   */
  async register(userData: RegisterData): Promise<{ user: User; message: string }> {
    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('firstName', userData.firstName);
      formData.append('lastName', userData.lastName);
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('phone', userData.phone);
      formData.append('cin', userData.cin);
      formData.append('address', userData.address);
      formData.append('dob', userData.dob);
      formData.append('gender', userData.gender);
      
      // Add role (defaults to Student)
      if (userData.role) {
        formData.append('role', userData.role);
      }
      
      // Add student-specific fields if provided
      if (userData.university) {
        formData.append('university', userData.university);
      }
      if (userData.studyField) {
        formData.append('studyField', userData.studyField);
      }
      if (userData.yearOfStudy) {
        formData.append('yearOfStudy', userData.yearOfStudy.toString());
      }
      
      if (userData.profileImage) {
        formData.append('profileImage', userData.profileImage);
      }
      console.log('Registering user with data:', userData);

      const response = await apiClient.post<{ user: User; message: string }>(
        API_ENDPOINTS.AUTH.REGISTER,
        formData
      );

      // API client returns data directly, cast to expected type
      const registerData = response as unknown as { user: User; message: string };

      console.log('Registration response:', registerData);

      if (registerData && registerData.user) {
        // Note: API v2 uses HTTP-only cookies for JWT, no token in response
        await StorageService.saveUserData(registerData.user);
      }

      return registerData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user - Updated for API v2
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      // Since API v2 uses HTTP-only cookies, we just clear local storage
      await apiClient.clearToken();
      await StorageService.removeAuthToken();
      await StorageService.removeUserData();
      
      return {
        success: true,
        data: null,
        message: 'Logged out successfully'
      };
    } catch (error) {
      // Clear token even if logout API fails
      await apiClient.clearToken();
      throw error;
    }
  }

  /**
   * Get current user profile - Updated for API v2
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const user = await apiClient.get<User>(API_ENDPOINTS.USERS.ME);
      return {
        success: true,
        data: user,
        message: 'User retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user data from local storage
   */
  async getStoredUserData(): Promise<User | null> {
    try {
      return await StorageService.getUserData();
    } catch (error) {
      console.error('Error getting stored user data:', error);
      return null;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/auth/refresh');
      
      if ((response as any).data && (response as any).data.token) {
        // Save the new token
        await apiClient.saveToken((response as any).data.token);
        
        return {
          success: true,
          data: (response as any).data,
          message: 'Token refreshed successfully'
        };
      }
      
      return {
        success: false,
        message: 'Failed to refresh token'
      };
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error);
      return {
        success: false,
        message: error?.message || 'Failed to refresh token'
      };
    }
  }

  /**
   * Send password reset email - Not implemented in API v2 yet
   */
  // async forgotPassword(email: string): Promise<ApiResponse<null>> {
  //   // TODO: Implement when API v2 adds this endpoint
  //   throw new Error('Password reset not available yet');
  // }

  /**
   * Reset password with token - Not implemented in API v2 yet
   */
  // async resetPassword(token: string, newPassword: string): Promise<ApiResponse<null>> {
  //   // TODO: Implement when API v2 adds this endpoint
  //   throw new Error('Password reset not available yet');
  // }

  /**
   * Verify email address - Not implemented in API v2 yet
   */
  // async verifyEmail(token: string): Promise<ApiResponse<null>> {
  //   // TODO: Implement when API v2 adds this endpoint
  //   throw new Error('Email verification not available yet');
  // }

  /**
   * Check if user is authenticated by checking stored token
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await StorageService.getAuthToken();
      return !!token;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  /**
   * Social login (Google, Facebook, etc.)
   */
  async socialLogin(provider: string, token: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await apiClient.post<{ user: User; token: string }>(
        `/auth/social/${provider}`,
        { token }
      );

      if (response.user && response.token) {
        // Save token and user data to storage
        await apiClient.saveToken(response.token);
        await StorageService.saveAuthToken(response.token);
        await StorageService.saveUserData(response.user);
      }

      return {
        success: true,
        data: response,
        message: 'Social login successful'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update password
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    try {
      await apiClient.put<null>('/auth/password', {
        currentPassword,
        newPassword
      });
      
      return {
        success: true,
        data: null,
        message: 'Password updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<ApiResponse<null>> {
    try {
      await apiClient.delete<null>('/auth/account');
      
      // Clear token and user data after successful account deletion
      await apiClient.clearToken();
      await StorageService.removeAuthToken();
      await StorageService.removeUserData();
      
      return {
        success: true,
        data: null,
        message: 'Account deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update local user data in storage
   */
  async updateStoredUserData(userData: Partial<User>): Promise<void> {
    try {
      const currentUser = await StorageService.getUserData();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        await StorageService.saveUserData(updatedUser);
      }
    } catch (error) {
      console.error('Error updating stored user data:', error);
    }
  }

  /**
   * Save user preferences
   */
  async saveUserPreferences(preferences: Record<string, any>): Promise<void> {
    try {
      await StorageService.savePreferences(preferences);
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(): Promise<Record<string, any> | null> {
    try {
      return await StorageService.getPreferences();
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  /**
   * Update preferences and lifestyle on backend and local storage
   */
  async updatePreferencesOnBackend(preferences: Record<string, any>, lifestyle: Record<string, any>): Promise<void> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, { preferences, lifestyle });
      // Optionally update local storage
      await this.saveUserPreferences({ ...preferences, ...lifestyle });
    } catch (error) {
      console.error('Error updating preferences on backend:', error);
      throw error;
    }
  }

  /**
   * Initialize auth state from storage on app start
   */
  /**
   * Initialize auth state - Updated for API v2 (no token, uses HTTP-only cookies)
   */
  async initializeAuthState(): Promise<{ user: User | null }> {
    try {
      const user = await StorageService.getUserData();
      
      return { user };
    } catch (error) {
      console.error('Error initializing auth state:', error);
      return { user: null };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
