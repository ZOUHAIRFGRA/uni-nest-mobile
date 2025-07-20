import { apiClient, getPaginatedData } from './apiClient';
import { API_ENDPOINTS } from '../utils/config';
import { 
  Property, 
  ApiResponse, 
  PaginatedResponse,
  SearchFilters,
  Review
} from '../types';

export class PropertyService {
  /**
   * Get list of properties with optional filters
   */
  async getProperties(filters?: SearchFilters, page?: number, limit?: number): Promise<PaginatedResponse<Property>> {
    try {
      const params: Record<string, any> = {};
      
      if (filters) {
        if (filters.query) params.q = filters.query;
        if (filters.priceRange) {
          params.minPrice = filters.priceRange.min;
          params.maxPrice = filters.priceRange.max;
        }
        if (filters.location) params.location = filters.location;
        if (filters.roomType) params.roomType = filters.roomType.join(',');
        if (filters.amenities) params.amenities = filters.amenities.join(',');
        if (filters.distance) params.distance = filters.distance;
        if (filters.rating) params.minRating = filters.rating;
        if (filters.available !== undefined) params.available = filters.available;
        if (filters.sortBy) params.sortBy = filters.sortBy;
        if (filters.sortOrder) params.sortOrder = filters.sortOrder;
      }
      
      if (page) params.page = page;
      if (limit) params.limit = limit;

      return await getPaginatedData<Property>(API_ENDPOINTS.PROPERTIES.LIST, params);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get property details by ID
   */
  async getPropertyById(id: string): Promise<ApiResponse<Property>> {
    try {
      return await apiClient.get<Property>(API_ENDPOINTS.PROPERTIES.DETAILS(id));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new property (for landlords)
   */
  async createProperty(propertyData: Partial<Property>): Promise<ApiResponse<Property>> {
    try {
      return await apiClient.post<Property>(API_ENDPOINTS.PROPERTIES.CREATE, propertyData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update property
   */
  async updateProperty(id: string, propertyData: Partial<Property>): Promise<ApiResponse<Property>> {
    try {
      return await apiClient.put<Property>(API_ENDPOINTS.PROPERTIES.UPDATE(id), propertyData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete property
   */
  async deleteProperty(id: string): Promise<ApiResponse<null>> {
    try {
      return await apiClient.delete<null>(API_ENDPOINTS.PROPERTIES.DELETE(id));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search properties with text query
   */
  async searchProperties(query: string, filters?: SearchFilters): Promise<PaginatedResponse<Property>> {
    try {
      const params: Record<string, any> = { q: query };
      
      if (filters) {
        if (filters.priceRange) {
          params.minPrice = filters.priceRange.min;
          params.maxPrice = filters.priceRange.max;
        }
        if (filters.location) params.location = filters.location;
        if (filters.roomType) params.roomType = filters.roomType.join(',');
        if (filters.amenities) params.amenities = filters.amenities.join(',');
        if (filters.distance) params.distance = filters.distance;
        if (filters.rating) params.minRating = filters.rating;
      }

      return await getPaginatedData<Property>(API_ENDPOINTS.PROPERTIES.SEARCH, params);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get nearby properties based on coordinates
   */
  async getNearbyProperties(
    latitude: number, 
    longitude: number, 
    radius?: number
  ): Promise<PaginatedResponse<Property>> {
    try {
      const params = {
        lat: latitude,
        lng: longitude,
        radius: radius || 10, // Default 10km radius
      };

      return await getPaginatedData<Property>(API_ENDPOINTS.PROPERTIES.NEARBY, params);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add property to favorites
   */
  async addToFavorites(propertyId: string): Promise<ApiResponse<null>> {
    try {
      return await apiClient.post<null>(`${API_ENDPOINTS.PROPERTIES.FAVORITES}/${propertyId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove property from favorites
   */
  async removeFromFavorites(propertyId: string): Promise<ApiResponse<null>> {
    try {
      return await apiClient.delete<null>(`${API_ENDPOINTS.PROPERTIES.FAVORITES}/${propertyId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's favorite properties
   */
  async getFavorites(): Promise<PaginatedResponse<Property>> {
    try {
      return await getPaginatedData<Property>(API_ENDPOINTS.PROPERTIES.FAVORITES);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get property reviews
   */
  async getPropertyReviews(propertyId: string): Promise<PaginatedResponse<Review>> {
    try {
      return await getPaginatedData<Review>(API_ENDPOINTS.PROPERTIES.REVIEWS(propertyId));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add review for property
   */
  async addReview(propertyId: string, rating: number, comment: string): Promise<ApiResponse<Review>> {
    try {
      return await apiClient.post<Review>(API_ENDPOINTS.PROPERTIES.REVIEWS(propertyId), {
        rating,
        comment
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload property images
   */
  async uploadPropertyImages(propertyId: string, images: any[]): Promise<ApiResponse<string[]>> {
    try {
      const formData = new FormData();
      
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      return await apiClient.upload<string[]>(`/properties/${propertyId}/images`, formData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get properties by landlord ID
   */
  async getPropertiesByLandlord(landlordId: string): Promise<PaginatedResponse<Property>> {
    try {
      return await getPaginatedData<Property>(`/properties/landlord/${landlordId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get property analytics (for landlords)
   */
  async getPropertyAnalytics(propertyId: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get<any>(`/properties/${propertyId}/analytics`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Report property
   */
  async reportProperty(propertyId: string, reason: string, description: string): Promise<ApiResponse<null>> {
    try {
      return await apiClient.post<null>(`/properties/${propertyId}/report`, {
        reason,
        description
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get property availability calendar
   */
  async getPropertyAvailability(propertyId: string, startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    try {
      const params: Record<string, any> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      return await apiClient.get<any>(`/properties/${propertyId}/availability`, params);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check property availability for specific dates
   */
  async checkAvailability(propertyId: string, startDate: string, endDate: string): Promise<ApiResponse<{ available: boolean }>> {
    try {
      return await apiClient.post<{ available: boolean }>(`/properties/${propertyId}/check-availability`, {
        startDate,
        endDate
      });
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const propertyService = new PropertyService();
