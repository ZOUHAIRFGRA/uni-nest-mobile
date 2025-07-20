// Legacy action creators - DEPRECATED
// This file has been replaced by Redux Toolkit slices
// 
// Migration completed on: July 10, 2025
// 
// This file is kept for reference only and should not be used in the application.
// All functionality has been moved to individual Redux Toolkit slices:
// - Auth: app/store/slices/authSlice.ts
// - Properties: app/store/slices/propertiesSlice.ts  
// - Matches: app/store/slices/matchesSliceRedux.ts
// - Bookings: app/store/slices/bookingsSlice.ts
// - Chats: app/store/slices/chatsSlice.ts
// - Notifications: app/store/slices/notificationsSliceRedux.ts
// - UI: app/store/slices/uiSlice.ts
//
// TODO: Remove this file after confirming all components use Redux Toolkit slices

import type { User, Property, Match, Booking, Chat, Message, Notification } from '../types';

// Legacy ActionTypes (for compatibility only)
const ActionTypes = {
  // Auth
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  CLEAR_AUTH_ERROR: 'CLEAR_AUTH_ERROR',
  
  // Properties
  FETCH_PROPERTIES_REQUEST: 'FETCH_PROPERTIES_REQUEST',
  FETCH_PROPERTIES_SUCCESS: 'FETCH_PROPERTIES_SUCCESS',
  FETCH_PROPERTIES_FAILURE: 'FETCH_PROPERTIES_FAILURE',
  SET_CURRENT_PROPERTY: 'SET_CURRENT_PROPERTY',
  UPDATE_PROPERTY_FILTERS: 'UPDATE_PROPERTY_FILTERS',
  
  // Matches
  FETCH_MATCHES_REQUEST: 'FETCH_MATCHES_REQUEST',
  FETCH_MATCHES_SUCCESS: 'FETCH_MATCHES_SUCCESS',
  FETCH_MATCHES_FAILURE: 'FETCH_MATCHES_FAILURE',
  UPDATE_MATCH_STATUS: 'UPDATE_MATCH_STATUS',
  
  // Bookings
  FETCH_BOOKINGS_REQUEST: 'FETCH_BOOKINGS_REQUEST',
  FETCH_BOOKINGS_SUCCESS: 'FETCH_BOOKINGS_SUCCESS',
  FETCH_BOOKINGS_FAILURE: 'FETCH_BOOKINGS_FAILURE',
  CREATE_BOOKING: 'CREATE_BOOKING',
  
  // Chats
  FETCH_CHATS_REQUEST: 'FETCH_CHATS_REQUEST',
  FETCH_CHATS_SUCCESS: 'FETCH_CHATS_SUCCESS',
  FETCH_CHATS_FAILURE: 'FETCH_CHATS_FAILURE',
  SEND_MESSAGE: 'SEND_MESSAGE',
  RECEIVE_MESSAGE: 'RECEIVE_MESSAGE',
  SET_TYPING_USERS: 'SET_TYPING_USERS',
  
  // Notifications
  FETCH_NOTIFICATIONS_REQUEST: 'FETCH_NOTIFICATIONS_REQUEST',
  FETCH_NOTIFICATIONS_SUCCESS: 'FETCH_NOTIFICATIONS_SUCCESS',
  FETCH_NOTIFICATIONS_FAILURE: 'FETCH_NOTIFICATIONS_FAILURE',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  MARK_ALL_NOTIFICATIONS_READ: 'MARK_ALL_NOTIFICATIONS_READ',
  
  // UI
  SET_THEME: 'SET_THEME',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_NETWORK_STATUS: 'SET_NETWORK_STATUS',
  SET_REFRESHING: 'SET_REFRESHING',
  TOGGLE_MODAL: 'TOGGLE_MODAL',
} as const;

// Auth actions
export const authActions = {
  loginRequest: () => ({ type: ActionTypes.LOGIN_REQUEST }),
  
  loginSuccess: (user: User, token: string) => ({
    type: ActionTypes.LOGIN_SUCCESS,
    payload: { user, token },
  }),
  
  loginFailure: (error: string) => ({
    type: ActionTypes.LOGIN_FAILURE,
    payload: error,
  }),
  
  logout: () => ({ type: ActionTypes.LOGOUT }),
  
  setUser: (user: User) => ({
    type: ActionTypes.SET_USER,
    payload: user,
  }),
  
  clearAuthError: () => ({ type: ActionTypes.CLEAR_AUTH_ERROR }),
};

// Properties actions
export const propertiesActions = {
  fetchPropertiesRequest: () => ({ type: ActionTypes.FETCH_PROPERTIES_REQUEST }),
  
  fetchPropertiesSuccess: (data: Property[], pagination: any) => ({
    type: ActionTypes.FETCH_PROPERTIES_SUCCESS,
    payload: { data, pagination },
  }),
  
  fetchPropertiesFailure: (error: string) => ({
    type: ActionTypes.FETCH_PROPERTIES_FAILURE,
    payload: error,
  }),
  
  setCurrentProperty: (property: Property | null) => ({
    type: ActionTypes.SET_CURRENT_PROPERTY,
    payload: property,
  }),
  
  updatePropertyFilters: (filters: any) => ({
    type: ActionTypes.UPDATE_PROPERTY_FILTERS,
    payload: filters,
  }),
};

// Matches actions
export const matchesActions = {
  fetchMatchesRequest: () => ({ type: ActionTypes.FETCH_MATCHES_REQUEST }),
  
  fetchMatchesSuccess: (matches: Match[]) => ({
    type: ActionTypes.FETCH_MATCHES_SUCCESS,
    payload: matches,
  }),
  
  fetchMatchesFailure: (error: string) => ({
    type: ActionTypes.FETCH_MATCHES_FAILURE,
    payload: error,
  }),
  
  updateMatchStatus: (id: string, status: string) => ({
    type: ActionTypes.UPDATE_MATCH_STATUS,
    payload: { id, status },
  }),
};

// Bookings actions
export const bookingsActions = {
  fetchBookingsRequest: () => ({ type: ActionTypes.FETCH_BOOKINGS_REQUEST }),
  
  fetchBookingsSuccess: (bookings: Booking[]) => ({
    type: ActionTypes.FETCH_BOOKINGS_SUCCESS,
    payload: bookings,
  }),
  
  fetchBookingsFailure: (error: string) => ({
    type: ActionTypes.FETCH_BOOKINGS_FAILURE,
    payload: error,
  }),
  
  createBooking: (booking: Booking) => ({
    type: ActionTypes.CREATE_BOOKING,
    payload: booking,
  }),
};

// Chats actions
export const chatsActions = {
  fetchChatsRequest: () => ({ type: ActionTypes.FETCH_CHATS_REQUEST }),
  
  fetchChatsSuccess: (chats: Chat[]) => ({
    type: ActionTypes.FETCH_CHATS_SUCCESS,
    payload: chats,
  }),
  
  fetchChatsFailure: (error: string) => ({
    type: ActionTypes.FETCH_CHATS_FAILURE,
    payload: error,
  }),
  
  sendMessage: (message: Message) => ({
    type: ActionTypes.SEND_MESSAGE,
    payload: message,
  }),
  
  receiveMessage: (message: Message) => ({
    type: ActionTypes.RECEIVE_MESSAGE,
    payload: message,
  }),
  
  setTypingUsers: (userIds: string[]) => ({
    type: ActionTypes.SET_TYPING_USERS,
    payload: userIds,
  }),
};

// Notifications actions
export const notificationsActions = {
  fetchNotificationsRequest: () => ({ type: ActionTypes.FETCH_NOTIFICATIONS_REQUEST }),
  
  fetchNotificationsSuccess: (notifications: Notification[]) => ({
    type: ActionTypes.FETCH_NOTIFICATIONS_SUCCESS,
    payload: notifications,
  }),
  
  fetchNotificationsFailure: (error: string) => ({
    type: ActionTypes.FETCH_NOTIFICATIONS_FAILURE,
    payload: error,
  }),
  
  markNotificationRead: (id: string) => ({
    type: ActionTypes.MARK_NOTIFICATION_READ,
    payload: id,
  }),
  
  markAllNotificationsRead: () => ({ type: ActionTypes.MARK_ALL_NOTIFICATIONS_READ }),
};

// UI actions
export const uiActions = {
  setTheme: (theme: 'light' | 'dark') => ({
    type: ActionTypes.SET_THEME,
    payload: theme,
  }),
  
  setActiveTab: (tab: string) => ({
    type: ActionTypes.SET_ACTIVE_TAB,
    payload: tab,
  }),
  
  setNetworkStatus: (isConnected: boolean) => ({
    type: ActionTypes.SET_NETWORK_STATUS,
    payload: isConnected,
  }),
  
  setRefreshing: (refreshing: boolean) => ({
    type: ActionTypes.SET_REFRESHING,
    payload: refreshing,
  }),
  
  toggleModal: (modalName: string, isOpen: boolean) => ({
    type: ActionTypes.TOGGLE_MODAL,
    payload: { modalName, isOpen },
  }),
};

// Combined actions
export const actions = {
  auth: authActions,
  properties: propertiesActions,
  matches: matchesActions,
  bookings: bookingsActions,
  chats: chatsActions,
  notifications: notificationsActions,
  ui: uiActions,
};

export default actions;
