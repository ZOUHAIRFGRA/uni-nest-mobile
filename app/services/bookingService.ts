// Booking service for managing booking operations
import { apiClient } from './apiClient';
import type { Booking } from '../types';
import { store } from '../store/store';

export const bookingService = {
  // Get all bookings for the current user
  getBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get<{ success: boolean; data: { bookings: Booking[] } }>('/bookings/user');
    if (response?.success && response?.data?.bookings) {
      return response.data.bookings;
    }
    return [];
  },

  // Get a specific booking by ID
  getBookingById: async (bookingId: string): Promise<Booking> => {
    const response = await apiClient.get<{ success: boolean; data: Booking }>(`/bookings/${bookingId}`);
    if (response?.success && response?.data) {
      return response.data;
    }
    throw new Error('Booking not found');
  },

  // Create a new booking
  createBooking: async (bookingData: {
    propertyId: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    securityDeposit: number;
    roommates?: string[];
  }): Promise<Booking> => {
    const response = await apiClient.post<{ success: boolean; data: Booking }>('/bookings', bookingData);
    if (response?.success && response?.data) {
      return response.data;
    }
    throw new Error('Failed to create booking');
  },

  // Update booking status
  updateBookingStatus: async (bookingId: string, status: string): Promise<Booking> => {
    const response = await apiClient.patch<{ success: boolean; data: Booking }>(`/bookings/${bookingId}/status`, {
      status
    });
    if (response?.success && response?.data) {
      return response.data;
    }
    throw new Error('Failed to update booking status');
  },

  // Cancel a booking
  cancelBooking: async (bookingId: string, reason?: string): Promise<void> => {
    await apiClient.delete(`/bookings/${bookingId}`);
  },

  // Get booking history with pagination
  getBookingHistory: async (page = 1, limit = 20): Promise<{
    bookings: Booking[];
    pagination: {
      currentPage: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> => {
    const response = await apiClient.get<{ 
      success: boolean; 
      data: { 
        bookings: Booking[]; 
        totalCount: number; 
        currentPage: number; 
        totalPages: number; 
      } 
    }>('/bookings/user', {
      params: { page, limit }
    });
    
    if (response?.success && response?.data) {
      return {
        bookings: response.data.bookings,
        pagination: {
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          hasMore: response.data.currentPage < response.data.totalPages,
        },
      };
    }
    
    return {
      bookings: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        hasMore: false,
      },
    };
  },

  // Process payment for booking
  processPayment: async (bookingId: string, paymentData: {
    amount: number;
    paymentMethod: string;
    transactionDetails: any;
  }): Promise<any> => {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/bookings/${bookingId}/payment`, paymentData);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to process payment');
  },

  // Search users by name or email (filtered for students only, excluding current user)
  searchUsers: async (query: string): Promise<any[]> => {
    const response = await apiClient.get<any[]>(`/users/search?name=${encodeURIComponent(query)}`);
    console.log('[RESPONSE]', response);
    
    if (!response || !Array.isArray(response)) {
      return [];
    }

    // Get current user from store
    const currentUser = store.getState().auth.user;
    const currentUserId = currentUser?.id;

    // Filter out current user and landlords, only keep students
    const filteredUsers = response.filter((user: any) => {
      // Exclude current user
      if (currentUserId && user._id === currentUserId) {
        return false;
      }
      
      // Only include students (exclude landlords)
      if (user.role !== 'Student') {
        return false;
      }
      
      return true;
    });

    return filteredUsers;
  },

};
