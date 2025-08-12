import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../utils/config';
import { Property, PaginatedResponse, SearchFilters } from '../types';

export class PropertyService {
  /**
   * Get list of properties with optional filters - OPTIMIZED
   */
  async getProperties(filters?: SearchFilters, page?: number, limit?: number): Promise<PaginatedResponse<{ properties: Property[] }>> {
    const params: Record<string, any> = {};
    
    // Basic pagination
    if (page) params.page = page;
    if (limit) params.limit = limit;
    
    // Enhanced filtering for optimized endpoint
    if (filters) {
      if (filters.query) params.q = filters.query; // Text search using database indexes
      if (filters.priceRange) {
        params.minPrice = filters.priceRange.min;
        params.maxPrice = filters.priceRange.max;
      }
      if (filters.location) {
        // Enhanced location search with geospatial support
        if (typeof filters.location === 'object' && 'coordinates' in filters.location) {
          const coords = (filters.location as any).coordinates;
          params.lat = coords[1];
          params.lng = coords[0];
          if (filters.distance) params.radius = filters.distance * 1000; // Convert km to meters
        } else {
          params.city = filters.location;
        }
      }
      if (filters.roomType) params.roomType = Array.isArray(filters.roomType) ? filters.roomType.join(',') : filters.roomType;
      if (filters.amenities) params.amenities = Array.isArray(filters.amenities) ? filters.amenities.join(',') : filters.amenities;
      if (filters.rating) params.minRating = filters.rating;
      if (filters.available !== undefined) params.isAvailable = filters.available;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;
      
      // Additional optimized filters (using any to handle potential new properties)
      const extendedFilters = filters as any;
      if (extendedFilters.propertyType) params.propertyType = extendedFilters.propertyType;
      if (extendedFilters.bedrooms) params.bedrooms = extendedFilters.bedrooms;
      if (extendedFilters.bathrooms) params.bathrooms = extendedFilters.bathrooms;
    }

    try {
      // Use optimized endpoint that leverages database indexes and caching
      const response: any = await apiClient.get(API_ENDPOINTS.PROPERTIES.LIST, params);
      // console.log('🏠 [OPTIMIZED PROPERTIES RESPONSE]', response);
     
      if (response && Array.isArray(response.properties)) {
        return {
          success: true,
          data: {
            currentPage: response.pagination?.currentPage || response.page || 1,
            totalPages: response.pagination?.totalPages || Math.ceil((response.total || 0) / (limit || 10)),
            totalCount: response.pagination?.totalProperties || response.total || 0,
            properties: response.properties,
          },
          message: 'Properties retrieved successfully',
        };
      }
      return {
        success: true,
        data: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          properties: [],
        },
        message: 'No properties found',
      };
    } catch (error) {
      console.error('Error fetching optimized properties:', error);
      throw error;
    }
  }

  /**
   * Get property details by ID - OPTIMIZED with caching
   */
  async getPropertyById(id: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.PROPERTIES.DETAILS(id));
      
      // Handle both old and new response formats
      let propertyData;
      if (response.property) {
        // New optimized format
        propertyData = response.property;
      } else if (response.data) {
        // Alternative format
        propertyData = response.data;
      } else {
        // Direct property object
        propertyData = response;
      }
      
      return {
        success: true,
        data: propertyData,
        message: response.message || 'Property retrieved successfully',
        fromCache: response.fromCache || false,
      };
    } catch (error: any) {
      console.error('Error fetching property details:', error);
      
      // Handle specific error cases
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        throw new Error('Property not found');
      } else if (error.message?.includes('Invalid property ID')) {
        throw new Error('Invalid property ID format');
      }
      
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
   * Search properties with text query - OPTIMIZED with rate limiting awareness
   */
  async searchProperties(query: string, filters?: SearchFilters): Promise<PaginatedResponse<{ properties: Property[] }>> {
    const params: Record<string, any> = { q: query }; // Using 'q' for optimized text search
    
    if (filters) {
      if (filters.priceRange) {
        params.minPrice = filters.priceRange.min;
        params.maxPrice = filters.priceRange.max;
      }
      if (filters.location) {
        if (typeof filters.location === 'object' && 'coordinates' in filters.location) {
          const coords = (filters.location as any).coordinates;
          params.lat = coords[1];
          params.lng = coords[0];
          if (filters.distance) params.radius = filters.distance * 1000; // Convert km to meters
        } else {
          params.city = filters.location;
        }
      }
      if (filters.amenities) params.amenities = Array.isArray(filters.amenities) ? filters.amenities.join(',') : filters.amenities;
      if (filters.roomType) params.roomType = Array.isArray(filters.roomType) ? filters.roomType.join(',') : filters.roomType;
      if (filters.available !== undefined) params.isAvailable = filters.available;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;
      
      // Additional optimized filters
      const extendedFilters = filters as any;
      if (extendedFilters.propertyType) params.propertyType = extendedFilters.propertyType;
      if (extendedFilters.bedrooms) params.bedrooms = extendedFilters.bedrooms;
      if (extendedFilters.bathrooms) params.bathrooms = extendedFilters.bathrooms;
    }
    
    try {
      // Use optimized search endpoint with rate limiting (20 req/min)
      const response: any = await apiClient.get(API_ENDPOINTS.PROPERTIES.SEARCH, params);
      
      if (response && Array.isArray(response.properties)) {
        return {
          success: true,
          data: {
            currentPage: response.pagination?.currentPage || response.page || 1,
            totalPages: response.pagination?.totalPages || 1,
            totalCount: response.pagination?.totalProperties || response.properties.length,
            properties: response.properties,
          },
          message: 'Properties found successfully',
        };
      }
      return {
        success: true,
        data: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          properties: [],
        },
        message: 'No properties found',
      };
    } catch (error: any) {
      // Handle rate limiting gracefully
      if (error.message?.includes('Too many search requests')) {
        throw new Error('Search rate limit exceeded. Please wait a moment before searching again.');
      }
      console.error('Error in optimized property search:', error);
      throw error;
    }
  }

  /**
   * Get nearby properties based on coordinates - OPTIMIZED with geospatial indexes
   */
  async getNearbyProperties(
    latitude: number,
    longitude: number,
    radius?: number
  ): Promise<PaginatedResponse<{ properties: Property[] }>> {
    const params = {
      lat: latitude,
      lng: longitude,
      radius: radius || 5000, // Default 5km radius in meters
      // Use the optimized search endpoint for geospatial queries
    };
    
    try {
      // Use optimized search endpoint which now supports geospatial queries with 2dsphere indexes
      const response: any = await apiClient.get(API_ENDPOINTS.PROPERTIES.SEARCH, params);
      
      if (response && Array.isArray(response.properties)) {
        return {
          success: true,
          data: {
            currentPage: response.pagination?.currentPage || response.page || 1,
            totalPages: response.pagination?.totalPages || 1,
            totalCount: response.pagination?.totalProperties || response.properties.length,
            properties: response.properties,
          },
          message: 'Nearby properties found successfully',
        };
      }
      return {
        success: true,
        data: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          properties: [],
        },
        message: 'No nearby properties found',
      };
    } catch (error) {
      console.error('Error fetching nearby properties:', error);
      throw error;
    }
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
      } catch {
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
  async getPropertyReviews(propertyId: string): Promise<PaginatedResponse<{ reviews: any[] }>> {
    try {
      const response: any = await apiClient.get(API_ENDPOINTS.PROPERTIES.DETAILS(propertyId) + '/reviews');
      if (Array.isArray(response.data)) {
        return {
          success: true,
          data: {
            currentPage: 1,
            totalPages: 1,
            totalCount: response.data.length,
            reviews: response.data,
          },
          message: 'Reviews retrieved successfully',
        };
      }
      return {
        success: true,
        data: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          reviews: [],
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
  async getPropertiesByLandlord(landlordId: string): Promise<PaginatedResponse<{ properties: Property[] }>> {
    const response: any = await apiClient.get(API_ENDPOINTS.PROPERTIES.LIST + '/landlords/' + `${landlordId}` + '/properties');
    if (response && Array.isArray(response)) {
      return {
        success: true,
        data: {
          currentPage: 1,
          totalPages: 1,
          totalCount: response.length,
          properties: response,
        },
        message: 'Landlord properties retrieved successfully',
      };
    }
    return {
      success: true,
      data: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        properties: [],
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
      await apiClient.post<null>(API_ENDPOINTS.PROPERTIES.DETAILS(propertyId) + '/report', {
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
