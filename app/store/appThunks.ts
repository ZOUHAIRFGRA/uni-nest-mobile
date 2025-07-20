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
import { chatService } from '../services/chatService';
import { bookingService } from '../services/bookingService';
import { notificationService } from '../services/notificationService';
import { logoutUser } from './slices/authSlice';
import { SessionHandler } from '../utils/sessionHandler';

// Import action creators (DEPRECATED: Use authSlice.ts for auth actions)
// import { authActions } from './slices/simpleAuthSlice'; // ← DEPRECATED
import { propertiesActions } from './slices/propertiesSlice';
import { matchesActions } from './slices/matchesSlice';
import { bookingsActions } from './slices/bookingsSlice';
import { chatsActions } from './slices/chatsSlice';
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

// DEPRECATED: Auth thunks have been moved to authSlice.ts
// Use these modern Redux Toolkit thunks instead:
// import { loginUser, registerUser, logoutUser, initializeAuth } from './slices/authSlice';
/*
// Auth thunks - DEPRECATED
export const authThunks = {
  // These have been replaced by Redux Toolkit thunks in authSlice.ts
  // login: use loginUser from authSlice.ts
  // register: use registerUser from authSlice.ts  
  // logout: use logoutUser from authSlice.ts
  // NEW: initializeAuth for session restoration
  // NEW: saveUserPreferences for user preferences
  // NEW: updateStoredUserData for cached user data
};
*/

// Properties thunks
export const propertiesThunks = {
  fetchProperties: (params: { filters?: SearchFilters; page?: number; limit?: number } = {}) => async (dispatch: any, getState: any) => {
    try {
      dispatch(propertiesActions.fetchPropertiesRequest());
      const response = await propertyService.getProperties(params.filters, params.page, params.limit);
      if (response.success && response.data) {
        dispatch(propertiesActions.fetchPropertiesSuccess(response.data, response.pagination));
        return response;
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

  searchProperties: (query: string, filters?: SearchFilters) => async (dispatch: any, getState: any) => {
    try {
      dispatch(propertiesActions.searchPropertiesRequest());
      const response = await propertyService.searchProperties(query, filters);
      if (response.success && response.data) {
        dispatch(propertiesActions.searchPropertiesSuccess(response.data, response.pagination));
        return response;
      } else {
        throw new Error(response.message || 'Search failed');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Search failed';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      dispatch(propertiesActions.searchPropertiesFailure(errorMessage));
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

  createBooking: (bookingData: {
    propertyId: string;
    startDate: string;
    endDate: string;
    message?: string;
  }) => async (dispatch: any, getState: any) => {
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
      dispatch(bookingsActions.updateBookingRequest());
      const booking = await bookingService.updateBookingStatus(bookingId, status);
      dispatch(bookingsActions.updateBookingSuccess(booking));
      return booking;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update booking';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      dispatch(bookingsActions.updateBookingFailure(errorMessage));
      throw error;
    }
  },
};

// Chats thunks
export const chatsThunks = {
  fetchChats: () => async (dispatch: any, getState: any) => {
    try {
      dispatch(chatsActions.fetchChatsRequest());
      const chats = await chatService.getChats();
      dispatch(chatsActions.fetchChatsSuccess(chats));
      return chats;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to fetch chats';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      dispatch(chatsActions.fetchChatsFailure(errorMessage));
      throw error;
    }
  },

  fetchMessages: (chatId: string) => async (dispatch: any, getState: any) => {
    try {
      dispatch(chatsActions.fetchMessagesRequest());
      const messages = await chatService.getMessages(chatId);
      dispatch(chatsActions.fetchMessagesSuccess(messages));
      return messages;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to fetch messages';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      dispatch(chatsActions.fetchMessagesFailure(errorMessage));
      throw error;
    }
  },

  sendMessage: (chatId: string, content: string) => async (dispatch: any, getState: any) => {
    try {
      dispatch(chatsActions.sendMessageRequest());
      const message = await chatService.sendMessage(chatId, content);
      dispatch(chatsActions.sendMessageSuccess(message));
      return message;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to send message';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      dispatch(chatsActions.sendMessageFailure(errorMessage));
      throw error;
    }
  },

  createChat: (participantId: string) => async (dispatch: any, getState: any) => {
    try {
      const chat = await chatService.createChat(participantId);
      dispatch(chatsActions.createChatSuccess(chat));
      return chat;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create chat';
      
      // Check for session expiration and handle logout
      if (await handleSessionExpiration(error, dispatch)) {
        return; // Don't dispatch failure action if session expired
      }
      
      dispatch(chatsActions.fetchChatsFailure(errorMessage));
      throw error;
    }
  },
};

// Notifications thunks
export const notificationsThunks = {
  fetchNotifications: () => async (dispatch: any, getState: any) => {
    try {
      dispatch(notificationsActions.fetchNotificationsRequest());
      const notifications = await notificationService.getNotifications();
      dispatch(notificationsActions.fetchNotificationsSuccess(notifications));
      return notifications;
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
  chats: chatsThunks,
  notifications: notificationsThunks,
  matches: matchesThunks,
};

// Also export actions for direct use
export const actions = {
  // auth: authActions, // ← DEPRECATED: Use actions from authSlice.ts
  properties: propertiesActions,
  matches: matchesActions,
  bookings: bookingsActions,
  chats: chatsActions,
  notifications: notificationsActions,
  ui: uiActions,
};

export default thunks;
