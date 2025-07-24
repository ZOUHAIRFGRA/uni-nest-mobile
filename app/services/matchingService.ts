import { apiClient } from './apiClient';
import type { Match } from '../types';

export const matchingService = {
  // Get user matches (property or roommate)
  getMatches: async (type: 'Property' | 'Roommate' = 'Property', page = 1, limit = 5) => {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `/matching`,
      { type, page, limit }
    );
    if (response.data?.success && response.data?.data) {
      // Prefer matches key if present
      if (response.data.data.matches) {
        return response.data.data.matches;
      }
      return response.data.data;
    }
    return [];
  },

  // Generate new recommendations (property or roommate)
  generateRecommendations: async (type: 'property' | 'roommate', limit = 5) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      `/matching/generate/${type}`,
      { limit }
    );
    if (response.data?.success && response.data?.data?.recommendations) {
      return response.data.data.recommendations;
    }
    return [];
  },
}; 