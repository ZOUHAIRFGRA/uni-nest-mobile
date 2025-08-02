import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../utils/config';
import { Property, PaginatedResponse, SearchFilters } from '../types';

export class PropertyService {
  /**
   * Get list of properties with optional filters
   */
  async getProperties(filters?: SearchFilters, page?: number, limit?: number): Promise<PaginatedResponse<Property>> {
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

    const response: any = await apiClient.get(API_ENDPOINTS.PROPERTIES.LIST, params);
    // console.log('🏠 [PROPERTIES RESPONSE FROM SERVICE]', response);
   
    if (response && Array.isArray(response.properties)) {
      return {
        success: true,
        data: response.properties,
        pagination: {
          currentPage: response.page,
          totalPages: Math.ceil(response.total / response.limit),
          totalItems: response.total,
          itemsPerPage: response.limit,
        },
        message: 'Properties retrieved successfully',
      };
    }
    return {
      success: true,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit || 10,
      },
      message: 'No properties found',
    };
  }

  /**
   * Get property details by ID
   */
  async getPropertyById(id: string): Promise<any> {
    try {
      const response = await apiClient.get<Property>(API_ENDPOINTS.PROPERTIES.DETAILS(id));
      return {
        success: true,
        data: response, // response is the property object
        message: 'Property retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new property (for landlords)
   */
  async createProperty(propertyData: Partial<Property>): Promise<any> {
    try {
      const response = await apiClient.post<Property>(API_ENDPOINTS.PROPERTIES.CREATE, propertyData);
      return {
        success: true,
        data: response, // response is the property object
        message: 'Property created successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update property
   */
  async updateProperty(id: string, propertyData: Partial<Property>): Promise<any> {
    try {
      const response = await apiClient.put<Property>(API_ENDPOINTS.PROPERTIES.UPDATE(id), propertyData);
      return {
        success: true,
        data: response, // response is the property object
        message: 'Property updated successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete property
   */
  async deleteProperty(id: string): Promise<any> {
    try {
      await apiClient.delete<null>(API_ENDPOINTS.PROPERTIES.DELETE(id));
      return {
        success: true,
        data: null,
        message: 'Property deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search properties with text query
   */
  async searchProperties(query: string, filters?: SearchFilters): Promise<PaginatedResponse<Property>> {
    const params: Record<string, any> = { keyword: query };
    if (filters) {
      if (filters.priceRange) {
        params.priceMin = filters.priceRange.min;
        params.priceMax = filters.priceRange.max;
      }
      if (filters.location) params.location = filters.location;
      if (filters.amenities) params.utilitiesIncluded = filters.amenities.includes('utilities');
    }
    const response: any = await apiClient.get(API_ENDPOINTS.PROPERTIES.SEARCH, params);
    if (response.data && Array.isArray(response.data.properties)) {
      return {
        success: true,
        data: response.data.properties,
        pagination: {
          currentPage: response.data.page || 1,
          totalPages: 1,
          totalItems: response.data.properties.length,
          itemsPerPage: response.data.properties.length,
        },
        message: 'Properties found successfully',
      };
    }
    return {
      success: true,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 0,
      },
      message: 'No properties found',
    };
  }

  /**
   * Get nearby properties based on coordinates
   */
  async getNearbyProperties(
    latitude: number,
    longitude: number,
    radius?: number
  ): Promise<PaginatedResponse<Property>> {
    const params = {
      lat: latitude,
      lng: longitude,
      radius: radius || 5000, // Default 5km radius
    };
    const response: any = await apiClient.get(API_ENDPOINTS.PROPERTIES.NEARBY, params);
    if (response.data && Array.isArray(response.data.properties)) {
      return {
        success: true,
        data: response.data.properties,
        pagination: {
          currentPage: response.data.page || 1,
          totalPages: 1,
          totalItems: response.data.properties.length,
          itemsPerPage: response.data.properties.length,
        },
        message: 'Nearby properties found successfully',
      };
    }
    return {
      success: true,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 0,
      },
      message: 'No nearby properties found',
    };
  }

  /**
   * Add property to favorites
   */
  async addToFavorites(propertyId: string): Promise<void> {
    await apiClient.post(`/favorites/${propertyId}`);
  }

  /**
   * Remove property from favorites
   */
  async removeFromFavorites(propertyId: string): Promise<void> {
    await apiClient.delete(`/favorites/${propertyId}`);
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(propertyId: string): Promise<any> {
    try {
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
  async getFavorites(): Promise<{ favorites: Property[] }> {
    const response: any = await apiClient.get('/favorites');
    return { favorites: response.favorites || [] };
  }

  /**
   * Get property reviews
   */
  async getPropertyReviews(propertyId: string): Promise<PaginatedResponse<any>> {
    try {
      const response: any = await apiClient.get(API_ENDPOINTS.PROPERTIES.DETAILS(propertyId) + '/reviews');
      if (Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: response.data.length,
            itemsPerPage: response.data.length,
          },
          message: 'Reviews retrieved successfully',
        };
      }
      return {
        success: true,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 0,
        },
        message: 'No reviews found',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add review to property
   */
  async addReview(propertyId: string, rating: number, comment: string): Promise<any> {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.PROPERTIES.DETAILS(propertyId) + '/reviews', {
        rating,
        comment,
      });
      return {
        success: true,
        data: response.data,
        message: 'Review added successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload property images
   */
  async uploadPropertyImages(propertyId: string, images: any[]): Promise<any> {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('images', image);
      });
      const response = await apiClient.upload<string[]>(API_ENDPOINTS.PROPERTIES.DETAILS(propertyId) + '/images', formData);
      return {
        success: true,
        data: response, // response is the array of image URLs
        message: 'Images uploaded successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get properties by landlord
   */
  async getPropertiesByLandlord(landlordId: string): Promise<PaginatedResponse<Property>> {
    const response: any = await apiClient.get(API_ENDPOINTS.PROPERTIES.LIST + '/landlords/' + `${landlordId}` + '/properties');
    if (response && Array.isArray(response)) {
      return {
        success: true,
        data: response,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: response.length,
          itemsPerPage: response.length,
        },
        message: 'Landlord properties retrieved successfully',
      };
    }
    return {
      success: true,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 0,
      },
      message: 'No properties found for landlord',
    };
  }

  /**
   * Get property analytics
   */
  async getPropertyAnalytics(propertyId: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.PROPERTIES.DETAILS(propertyId) + '/analytics');
      return {
        success: true,
        data: response.data,
        message: 'Analytics retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Report a property
   */
  async reportProperty(propertyId: string, reason: string, description: string): Promise<any> {
    try {
      const response = await apiClient.post<null>(API_ENDPOINTS.PROPERTIES.DETAILS(propertyId) + '/report', {
        reason,
        description,
      });
      return {
        success: true,
        data: null,
        message: 'Property reported successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get property availability
   */
  async getPropertyAvailability(propertyId: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: Record<string, any> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await apiClient.get<any>(API_ENDPOINTS.PROPERTIES.DETAILS(propertyId) + '/availability', params);
      return {
        success: true,
        data: response.data,
        message: 'Availability retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check property availability for specific dates
   */
  async checkAvailability(propertyId: string, startDate: string, endDate: string): Promise<any> {
    try {
      const response = await apiClient.get<{ available: boolean }>(API_ENDPOINTS.PROPERTIES.DETAILS(propertyId) + '/check-availability', {
        startDate,
        endDate,
      });
      return {
        success: true,
        data: response, // response is the object { available: boolean }
        message: 'Availability checked successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}

export const propertyService = new PropertyService();
