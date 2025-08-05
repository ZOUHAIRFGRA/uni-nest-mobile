import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../utils/config';
import type { Match, PaginatedResponse } from '../types';

export const matchingService = {
  // Get user matches (property or roommate)
  getMatches: async (
    type: 'Property' | 'Roommate' = 'Property',
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<{ matches: Match[] }>> => {
    const params = { type, page, limit };
    const response: any = await apiClient.get(API_ENDPOINTS.MATCHING.LIST, params);
    console.log('🔍 [MATCHES RESPONSE FROM API]', response);
    if (response && response.data && Array.isArray(response.data.matches)) {
      return {
        success: true,
        data: {
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1,
          totalCount: response.data.totalCount || response.data.matches.length,
          matches: response.data.matches,
        },
        message: 'Matches retrieved successfully',
      };
    }
    return {
      success: true,
      data: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        matches: [],
      },
      message: 'No matches found',
    };
  },

  // Generate new recommendations (property or roommate)
  generateRecommendations: async (type: 'property' | 'roommate', limit = 5) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      API_ENDPOINTS.MATCHING.GENERATE(type),
      { limit }
    );
    console.log('🔍 [RECOMMENDATIONS RESPONSE]', response);
    if (response?.success && response.data?.recommendations) {
      return response.data.recommendations;
    }
    return [];
  },

  // Get specific match details
  getMatchDetails: async (id: string): Promise<any> => {
    const response: any = await apiClient.get(API_ENDPOINTS.MATCHING.DETAILS(id));
    if (response && response.data) {
      return response.data;
    }
    return null;
  },

  // Update match status
  updateMatchStatus: async (id: string, status: 'Liked' | 'Passed'): Promise<any> => {
    const response: any = await apiClient.patch(API_ENDPOINTS.MATCHING.UPDATE_STATUS(id), { status });
    if (response && response.data) {
      return response.data;
    }
    return null;
  },
}; 