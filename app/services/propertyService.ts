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
  async getProperties(filters?: SearchFilters, page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<Property>>> {
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

      const response = await apiClient.get<{ 
        properties: Property[]; 
        total: number; 
        page: number; 
        limit: number; 
      }>('/properties', params);

      if (response.data) {
        const paginatedData: PaginatedResponse<Property> = {
          data: response.data.properties,
          pagination: {
            currentPage: response.data.page,
            totalPages: Math.ceil(response.data.total / response.data.limit),
            totalItems: response.data.total,
            hasMore: response.data.page < Math.ceil(response.data.total / response.data.limit),
            itemsPerPage: response.data.limit,
          }
        };

        return {
          success: true,
          data: paginatedData,
          message: 'Properties retrieved successfully'
        };
      }

      const emptyData: PaginatedResponse<Property> = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          hasMore: false,
          itemsPerPage: limit || 10,
        }
      };

      return {
        success: true,
        data: emptyData,
        message: 'No properties found'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get property details by ID
   */
  async getPropertyById(id: string): Promise<ApiResponse<Property>> {
    try {
      const response = await apiClient.get<Property>(`/properties/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Property retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new property (for landlords)
   */
  async createProperty(propertyData: Partial<Property>): Promise<ApiResponse<Property>> {
    try {
      const response = await apiClient.post<Property>('/properties', propertyData);
      return {
        success: true,
        data: response.data,
        message: 'Property created successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update property
   */
  async updateProperty(id: string, propertyData: Partial<Property>): Promise<ApiResponse<Property>> {
    try {
      const response = await apiClient.put<Property>(`/properties/${id}`, propertyData);
      return {
        success: true,
        data: response.data,
        message: 'Property updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete property
   */
  async deleteProperty(id: string): Promise<ApiResponse<null>> {
    try {
      await apiClient.delete<null>(`/properties/${id}`);
      return {
        success: true,
        data: null,
        message: 'Property deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search properties with text query
   */
  async searchProperties(query: string, filters?: SearchFilters): Promise<ApiResponse<PaginatedResponse<Property>>> {
    try {
      const params: Record<string, any> = { keyword: query };
      
      if (filters) {
        if (filters.priceRange) {
          params.priceMin = filters.priceRange.min;
          params.priceMax = filters.priceRange.max;
        }
        if (filters.location) params.location = filters.location;
        if (filters.amenities) params.utilitiesIncluded = filters.amenities.includes('utilities');
      }

      const response = await apiClient.get<Property[]>('/properties/search', params);
      
      if (response.data) {
        const paginatedData: PaginatedResponse<Property> = {
          data: response.data,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: response.data.length,
            hasMore: false,
            itemsPerPage: response.data.length,
          }
        };

        return {
          success: true,
          data: paginatedData,
          message: 'Properties found successfully'
        };
      }

      const emptyData: PaginatedResponse<Property> = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          hasMore: false,
          itemsPerPage: 0,
        }
      };

      return {
        success: true,
        data: emptyData,
        message: 'No properties found'
      };
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
  ): Promise<ApiResponse<PaginatedResponse<Property>>> {
    try {
      const params = {
        lat: latitude,
        lng: longitude,
        radius: radius || 5000 // Default 5km radius
      };

      const response = await apiClient.get<Property[]>('/properties/nearby', params);
      
      if (response.data) {
        const paginatedData: PaginatedResponse<Property> = {
          data: response.data,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: response.data.length,
            hasMore: false,
            itemsPerPage: response.data.length,
          }
        };

        return {
          success: true,
          data: paginatedData,
          message: 'Nearby properties found successfully'
        };
      }

      const emptyData: PaginatedResponse<Property> = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          hasMore: false,
          itemsPerPage: 0,
        }
      };

      return {
        success: true,
        data: emptyData,
        message: 'No nearby properties found'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add property to favorites
   */
  async addToFavorites(propertyId: string): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<null>(`/properties/${propertyId}/favorite`);
      return {
        success: true,
        data: null,
        message: 'Property added to favorites'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove property from favorites
   */
  async removeFromFavorites(propertyId: string): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.delete<null>(`/properties/${propertyId}/favorite`);
      return {
        success: true,
        data: null,
        message: 'Property removed from favorites'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(propertyId: string): Promise<ApiResponse<null>> {
    try {
      // Try to add first, if it fails, try to remove
      try {
        return await this.addToFavorites(propertyId);
      } catch (error) {
        return await this.removeFromFavorites(propertyId);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's favorite properties
   */
  async getFavorites(): Promise<ApiResponse<PaginatedResponse<Property>>> {
    try {
      const response = await apiClient.get<Property[]>('/properties/favorites');
      
      if (response.data) {
        const paginatedData: PaginatedResponse<Property> = {
          data: response.data,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: response.data.length,
            hasMore: false,
            itemsPerPage: response.data.length,
          }
        };

        return {
          success: true,
          data: paginatedData,
          message: 'Favorites retrieved successfully'
        };
      }

      const emptyData: PaginatedResponse<Property> = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          hasMore: false,
          itemsPerPage: 0,
        }
      };

      return {
        success: true,
        data: emptyData,
        message: 'No favorite properties found'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get property reviews
   */
  async getPropertyReviews(propertyId: string): Promise<PaginatedResponse<Review>> {
    try {
      const response = await apiClient.get<Review[]>(`/properties/${propertyId}/reviews`);
      
      if (response.data) {
        return {
          data: response.data,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: response.data.length,
            hasMore: false,
            itemsPerPage: response.data.length,
          }
        };
      }

      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          hasMore: false,
          itemsPerPage: 0,
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add review to property
   */
  async addReview(propertyId: string, rating: number, comment: string): Promise<ApiResponse<Review>> {
    try {
      const response = await apiClient.post<Review>(`/properties/${propertyId}/reviews`, {
        rating,
        comment
      });
      return {
        success: true,
        data: response.data,
        message: 'Review added successfully'
      };
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
        formData.append('images', image);
      });

      const response = await apiClient.upload<string[]>(`/properties/${propertyId}/images`, formData);
      return {
        success: true,
        data: response.data,
        message: 'Images uploaded successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get properties by landlord
   */
  async getPropertiesByLandlord(landlordId: string): Promise<ApiResponse<PaginatedResponse<Property>>> {
    try {
      const response = await apiClient.get<Property[]>(`/landlord/properties`);
      
      if (response.data) {
        const paginatedData: PaginatedResponse<Property> = {
          data: response.data,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: response.data.length,
            hasMore: false,
            itemsPerPage: response.data.length,
          }
        };

        return {
          success: true,
          data: paginatedData,
          message: 'Landlord properties retrieved successfully'
        };
      }

      const emptyData: PaginatedResponse<Property> = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          hasMore: false,
          itemsPerPage: 0,
        }
      };

      return {
        success: true,
        data: emptyData,
        message: 'No landlord properties found'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get property analytics
   */
  async getPropertyAnalytics(propertyId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<any>(`/properties/${propertyId}/analytics`);
      return {
        success: true,
        data: response.data,
        message: 'Analytics retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Report a property
   */
  async reportProperty(propertyId: string, reason: string, description: string): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<null>(`/properties/${propertyId}/report`, {
        reason,
        description
      });
      return {
        success: true,
        data: null,
        message: 'Property reported successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get property availability
   */
  async getPropertyAvailability(propertyId: string, startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    try {
      const params: Record<string, any> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get<any>(`/properties/${propertyId}/availability`, params);
      return {
        success: true,
        data: response.data,
        message: 'Availability retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check property availability for specific dates
   */
  async checkAvailability(propertyId: string, startDate: string, endDate: string): Promise<ApiResponse<{ available: boolean }>> {
    try {
      const response = await apiClient.get<{ available: boolean }>(`/properties/${propertyId}/check-availability`, {
        startDate,
        endDate
      });
      return {
        success: true,
        data: response.data,
        message: 'Availability checked successfully'
      };
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const propertyService = new PropertyService();
