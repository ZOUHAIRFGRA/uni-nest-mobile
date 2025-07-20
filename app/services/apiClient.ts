import { config, HTTP_STATUS, ERROR_MESSAGES, STORAGE_KEYS } from '../utils/config';
import { ApiResponse, PaginatedResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API client configuration
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = config.API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Get auth token from storage
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Set auth token in storage
  private async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  // Remove auth token from storage
  private async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  // Public method to save token (used by auth service)
  async saveToken(token: string): Promise<void> {
    return this.setAuthToken(token);
  }

  // Public method to clear token (used by auth service)
  async clearToken(): Promise<void> {
    return this.removeAuthToken();
  }

  // Build headers with auth token
  private async buildHeaders(customHeaders?: Record<string, string>): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    const headers = { ...this.defaultHeaders };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  // Handle API response
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
      console.log('API Response:', {
        status: response.status,
        ok: response.ok,
        contentType,
        data
      });
    } catch {
      throw new Error('Failed to parse response');
    }

    if (!response.ok) {
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      // Handle specific HTTP status codes
      switch (response.status) {
        case HTTP_STATUS.UNAUTHORIZED:
          // Clear auth token on 401
          await this.removeAuthToken();
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        case HTTP_STATUS.FORBIDDEN:
          throw new Error(ERROR_MESSAGES.FORBIDDEN);
        case HTTP_STATUS.NOT_FOUND:
          throw new Error(ERROR_MESSAGES.NOT_FOUND);
        case HTTP_STATUS.UNPROCESSABLE_ENTITY:
          throw new Error(data.message || ERROR_MESSAGES.VALIDATION_ERROR);
        case HTTP_STATUS.TOO_MANY_REQUESTS:
          throw new Error('Too many requests. Please try again later.');
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        case HTTP_STATUS.SERVICE_UNAVAILABLE:
          throw new Error(ERROR_MESSAGES.SERVER_ERROR);
        default:
          throw new Error(data.message || ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    }

    return data;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      // For FormData, don't set Content-Type header (let browser set it with boundary)
      const isFormData = options.body instanceof FormData;
      const headers = await this.buildHeaders(
        isFormData ? {} : (options.headers as Record<string, string>)
      );
      
      // Remove Content-Type for FormData to let browser set it with boundary
      if (isFormData && headers['Content-Type']) {
        delete headers['Content-Type'];
      }

      const config: RequestInit = {
        ...options,
        headers,
      };

      console.log('API Request:', url, config);
      const response = await fetch(url, config);
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('API Request Error:', error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      throw error;
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload file method
  async upload<T>(
    endpoint: string, 
    file: any, 
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      
      // Add file to form data
      formData.append('file', file);
      
      // Add additional data if provided
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }

      const token = await this.getAuthToken();
      const headers: Record<string, string> = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      throw error;
    }
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Helper function for paginated requests
export async function getPaginatedData<T>(
  endpoint: string,
  params?: Record<string, any>
): Promise<PaginatedResponse<T>> {
  return apiClient.get<T[]>(endpoint, params) as Promise<PaginatedResponse<T>>;
}

// Helper function to handle file uploads
export async function uploadFile<T>(
  endpoint: string,
  file: any,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<T>> {
  // Note: For upload progress, you might want to use a library like react-native-blob-util
  return apiClient.upload<T>(endpoint, file);
}

// Retry mechanism for failed requests
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}

export default apiClient;
