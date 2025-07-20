// Legacy thunk actions - PARTIALLY DEPRECATED
// 
// NOTE: Auth thunks have been replaced by Redux Toolkit thunks in authSlice.ts
// The modern auth thunks include:
// - loginUser (replaces authThunks.login)
// - registerUser (replaces authThunks.register) 
// - logoutUser (replaces authThunks.logout)
// - initializeAuth (new - session restoration)
// - saveUserPreferences (new)
// - updateStoredUserData (new)
//
// Use these imports instead:
// import { loginUser, registerUser, logoutUser, initializeAuth } from './slices/authSlice';

// import { authService } from '../services/authService'; // ← Not needed for deprecated auth thunks
import { propertyService } from '../services/propertyService';
import { bookingService } from '../services/bookingService';
import { notificationService } from '../services/notificationService';
import { logoutUser } from './slices/authSlice';
import { SessionHandler } from '../utils/sessionHandler';

// Import action creators (DEPRECATED: Use authSlice.ts for auth actions)
// import { authActions } from './slices/simpleAuthSlice'; // ← DEPRECATED
import { propertiesActions } from './slices/propertiesSlice';
import { matchesActions } from './slices/matchesSlice';
import { bookingsActions } from './slices/bookingsSlice';
import { notificationsActions } from './slices/notificationsSlice';
import { uiActions } from './slices/uiSlice';

import type { SearchFilters } from '../types'; // Removed unused: LoginCredentials, RegisterData

/**
 * Check if error is session expiration and handle logout
 */
const handleSessionExpiration = async (error: any, dispatch: any): Promise<boolean> => {
  if (SessionHandler.isSessionExpired(error)) {
    console.log('🔐 Session expired detected in thunk - handling logout');
    SessionHandler.initialize(dispatch);
    await SessionHandler.handleSessionExpiration(error);
    return true;
  }
  return false;
};

// Properties thunks
export const propertiesThunks = {
  fetchProperties: (params: { filters?: SearchFilters; page?: number; limit?: number } = {}) => async (dispatch: any, getState: any) => {
    try {
      dispatch(propertiesActions.fetchPropertiesRequest());
      const response = await propertyService.getProperties(params.filters, params.page, params.limit);
      if (response.success && response.data) {
        dispatch(propertiesActions.fetchPropertiesSuccess(response.data.data, response.data.pagination));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch properties');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to fetch properties';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      dispatch(propertiesActions.fetchPropertiesFailure(errorMessage));
      throw error;
    }
  },

  fetchRecentProperties: () => async (dispatch: any, getState: any) => {
    try {
      dispatch(propertiesActions.fetchPropertiesRequest());
      const response = await propertyService.getProperties({}, 1, 10); // Get first 10 properties
      if (response.success && response.data) {
        dispatch(propertiesActions.fetchPropertiesSuccess(response.data.data, response.data.pagination));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch recent properties');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to fetch recent properties';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      dispatch(propertiesActions.fetchPropertiesFailure(errorMessage));
      throw error;
    }
  },

  fetchPropertyById: (propertyId: string) => async (dispatch: any, getState: any) => {
    try {
      dispatch(propertiesActions.fetchPropertyByIdRequest());
      const response = await propertyService.getPropertyById(propertyId);
      if (response.success && response.data) {
        dispatch(propertiesActions.fetchPropertyByIdSuccess(response.data));
        return response.data;
      } else {
        throw new Error(response.message || 'Property not found');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Property not found';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      dispatch(propertiesActions.fetchPropertyByIdFailure(errorMessage));
      throw error;
    }
  },

  toggleFavorite: (propertyId: string) => async (dispatch: any, getState: any) => {
    try {
      const response = await propertyService.toggleFavorite(propertyId);
      if (response.success) {
        dispatch(propertiesActions.toggleFavorite(propertyId));
        return response;
      } else {
        throw new Error(response.message || 'Failed to toggle favorite');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to toggle favorite';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      throw error;
    }
  },
};

// Bookings thunks
export const bookingsThunks = {
  fetchBookings: () => async (dispatch: any, getState: any) => {
    try {
      dispatch(bookingsActions.fetchBookingsRequest());
      const bookings = await bookingService.getBookings();
      dispatch(bookingsActions.fetchBookingsSuccess(bookings));
      return bookings;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to fetch bookings';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      dispatch(bookingsActions.fetchBookingsFailure(errorMessage));
      throw error;
    }
  },

  createBooking: (bookingData: any) => async (dispatch: any, getState: any) => {
    try {
      dispatch(bookingsActions.createBookingRequest());
      const booking = await bookingService.createBooking(bookingData);
      dispatch(bookingsActions.createBookingSuccess(booking));
      return booking;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create booking';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      dispatch(bookingsActions.createBookingFailure(errorMessage));
      throw error;
    }
  },

  updateBookingStatus: (bookingId: string, status: string) => async (dispatch: any, getState: any) => {
    try {
      const booking = await bookingService.updateBookingStatus(bookingId, status);
      dispatch(bookingsActions.updateBookingStatus(bookingId, status));
      return booking;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update booking status';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      throw error;
    }
  },

  cancelBooking: (bookingId: string) => async (dispatch: any, getState: any) => {
    try {
      await bookingService.cancelBooking(bookingId);
      dispatch(bookingsActions.cancelBooking(bookingId));
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to cancel booking';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      throw error;
    }
  },
};

// Notifications thunks
export const notificationsThunks = {
  fetchNotifications: () => async (dispatch: any, getState: any) => {
    try {
      dispatch(notificationsActions.fetchNotificationsRequest());
      const result = await notificationService.getNotifications();
      dispatch(notificationsActions.fetchNotificationsSuccess(result.notifications));
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to fetch notifications';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      dispatch(notificationsActions.fetchNotificationsFailure(errorMessage));
      throw error;
    }
  },

  markNotificationAsRead: (notificationId: string) => async (dispatch: any, getState: any) => {
    try {
      await notificationService.markAsRead(notificationId);
      dispatch(notificationsActions.markNotificationRead(notificationId));
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to mark notification as read';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      dispatch(notificationsActions.fetchNotificationsFailure(errorMessage));
      throw error;
    }
  },

  markAllNotificationsAsRead: () => async (dispatch: any, getState: any) => {
    try {
      await notificationService.markAllAsRead();
      dispatch(notificationsActions.markAllNotificationsRead());
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to mark all notifications as read';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      dispatch(notificationsActions.fetchNotificationsFailure(errorMessage));
      throw error;
    }
  },
};

// Mock matches thunks (since we don't have a match service yet)
export const matchesThunks = {
  fetchMatches: (type: 'property' | 'roommate' | 'all' = 'all') => async (dispatch: any, getState: any) => {
    try {
      dispatch(matchesActions.fetchMatchesRequest());
      dispatch(matchesActions.setMatchType(type));
      
      // Mock matches data for now
      const mockMatches: any[] = [];
      dispatch(matchesActions.fetchMatchesSuccess(mockMatches));
      return mockMatches;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to fetch matches';
      dispatch(matchesActions.fetchMatchesFailure(errorMessage));
      throw error;
    }
  },

  updateMatchStatus: (matchId: string, status: string) => async (dispatch: any, getState: any) => {
    try {
      // Mock update for now
      dispatch(matchesActions.updateMatchStatus(matchId, status));
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update match status';
      dispatch(matchesActions.fetchMatchesFailure(errorMessage));
      throw error;
    }
  },
};

// Combine all thunks
export const thunks = {
  // auth: authThunks, // ← DEPRECATED: Use Redux Toolkit thunks from authSlice.ts
  properties: propertiesThunks,
  bookings: bookingsThunks,
  notifications: notificationsThunks,
  matches: matchesThunks,
};

// Also export actions for direct use
export const actions = {
  // auth: authActions, // ← DEPRECATED: Use actions from authSlice.ts
  properties: propertiesActions,
  matches: matchesActions,
  bookings: bookingsActions,
  notifications: notificationsActions,
  ui: uiActions,
};

export default thunks;
