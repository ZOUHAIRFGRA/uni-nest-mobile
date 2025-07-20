// Booking service for managing booking operations
import { apiClient } from './apiClient';
import type { Booking } from '../types';

export const bookingService = {
  // Get all bookings for the current user
  getBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>('/bookings');
    return response.data || [];
  },

  // Get a specific booking by ID
  getBookingById: async (bookingId: string): Promise<Booking> => {
    const response = await apiClient.get<Booking>(`/bookings/${bookingId}`);
    if (!response.data) {
      throw new Error('Booking not found');
    }
    return response.data;
  },

  // Create a new booking
  createBooking: async (bookingData: {
    propertyId: string;
    startDate: string;
    endDate: string;
    message?: string;
  }): Promise<Booking> => {
    const response = await apiClient.post<Booking>('/bookings', bookingData);
    if (!response.data) {
      throw new Error('Failed to create booking');
    }
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (bookingId: string, status: string): Promise<Booking> => {
    const response = await apiClient.put<Booking>(`/bookings/${bookingId}/status`, {
      status
    });
    if (!response.data) {
      throw new Error('Failed to update booking status');
    }
    return response.data;
  },

  // Cancel a booking
  cancelBooking: async (bookingId: string, reason?: string): Promise<void> => {
    await apiClient.delete(`/bookings/${bookingId}`);
  },

  // Get booking history
  getBookingHistory: async (page = 1, limit = 20): Promise<{
    bookings: Booking[];
    pagination: {
      currentPage: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> => {
    const response = await apiClient.get<{
      data: Booking[];
      pagination: any;
    }>('/bookings/history', {
      params: { page, limit }
    });
    
    return {
      bookings: response.data?.data || [],
      pagination: response.data?.pagination || {
        currentPage: 1,
        totalPages: 1,
        hasMore: false,
      },
    };
  },

  // Confirm a booking (for property owners)
  confirmBooking: async (bookingId: string): Promise<Booking> => {
    const response = await apiClient.put<Booking>(`/bookings/${bookingId}/confirm`);
    if (!response.data) {
      throw new Error('Failed to confirm booking');
    }
    return response.data;
  },

  // Reject a booking (for property owners)
  rejectBooking: async (bookingId: string, reason?: string): Promise<Booking> => {
    const response = await apiClient.put<Booking>(`/bookings/${bookingId}/reject`, {
      reason
    });
    if (!response.data) {
      throw new Error('Failed to reject booking');
    }
    return response.data;
  },
};
