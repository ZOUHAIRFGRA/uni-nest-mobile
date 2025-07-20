// Notifications slice for simple store with Redux Toolkit style
import type { Notification, NotificationsState } from '../../types';

// Initial state
export const initialNotificationsState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Action types
export const NOTIFICATIONS_ACTION_TYPES = {
  FETCH_NOTIFICATIONS_REQUEST: 'FETCH_NOTIFICATIONS_REQUEST',
  FETCH_NOTIFICATIONS_SUCCESS: 'FETCH_NOTIFICATIONS_SUCCESS',
  FETCH_NOTIFICATIONS_FAILURE: 'FETCH_NOTIFICATIONS_FAILURE',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  MARK_ALL_NOTIFICATIONS_READ: 'MARK_ALL_NOTIFICATIONS_READ',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
  DELETE_ALL_NOTIFICATIONS: 'DELETE_ALL_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  UPDATE_UNREAD_COUNT: 'UPDATE_UNREAD_COUNT',
  CLEAR_NOTIFICATIONS_ERROR: 'CLEAR_NOTIFICATIONS_ERROR',
} as const;

// Action creators
export const notificationsActions = {
  fetchNotificationsRequest: () => ({
    type: NOTIFICATIONS_ACTION_TYPES.FETCH_NOTIFICATIONS_REQUEST,
  }),

  fetchNotificationsSuccess: (notifications: Notification[]) => ({
    type: NOTIFICATIONS_ACTION_TYPES.FETCH_NOTIFICATIONS_SUCCESS,
    payload: notifications,
  }),

  fetchNotificationsFailure: (error: string) => ({
    type: NOTIFICATIONS_ACTION_TYPES.FETCH_NOTIFICATIONS_FAILURE,
    payload: error,
  }),

  markNotificationRead: (notificationId: string) => ({
    type: NOTIFICATIONS_ACTION_TYPES.MARK_NOTIFICATION_READ,
    payload: notificationId,
  }),

  markAllNotificationsRead: () => ({
    type: NOTIFICATIONS_ACTION_TYPES.MARK_ALL_NOTIFICATIONS_READ,
  }),

  deleteNotification: (notificationId: string) => ({
    type: NOTIFICATIONS_ACTION_TYPES.DELETE_NOTIFICATION,
    payload: notificationId,
  }),

  deleteAllNotifications: () => ({
    type: NOTIFICATIONS_ACTION_TYPES.DELETE_ALL_NOTIFICATIONS,
  }),

  addNotification: (notification: Notification) => ({
    type: NOTIFICATIONS_ACTION_TYPES.ADD_NOTIFICATION,
    payload: notification,
  }),

  updateUnreadCount: (count: number) => ({
    type: NOTIFICATIONS_ACTION_TYPES.UPDATE_UNREAD_COUNT,
    payload: count,
  }),

  clearNotificationsError: () => ({
    type: NOTIFICATIONS_ACTION_TYPES.CLEAR_NOTIFICATIONS_ERROR,
  }),
};

// Reducer
export const notificationsReducer = (
  state: NotificationsState = initialNotificationsState,
  action: any
): NotificationsState => {
  switch (action.type) {
    case NOTIFICATIONS_ACTION_TYPES.FETCH_NOTIFICATIONS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case NOTIFICATIONS_ACTION_TYPES.FETCH_NOTIFICATIONS_SUCCESS:
      const notifications = action.payload;
      const unreadCount = notifications.filter((n: Notification) => !n.read).length;
      return {
        ...state,
        loading: false,
        notifications,
        unreadCount,
        error: null,
      };

    case NOTIFICATIONS_ACTION_TYPES.FETCH_NOTIFICATIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case NOTIFICATIONS_ACTION_TYPES.MARK_NOTIFICATION_READ:
      const updatedNotifications = state.notifications.map((notification: Notification) =>
        notification._id === action.payload
          ? { ...notification, read: true }
          : notification
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: Math.max(0, state.unreadCount - 1),
      };

    case NOTIFICATIONS_ACTION_TYPES.MARK_ALL_NOTIFICATIONS_READ:
      return {
        ...state,
        notifications: state.notifications.map((notification: Notification) => ({
          ...notification,
          read: true,
        })),
        unreadCount: 0,
      };

    case NOTIFICATIONS_ACTION_TYPES.DELETE_NOTIFICATION:
      const filteredNotifications = state.notifications.filter(
        (notification: Notification) => notification._id !== action.payload
      );
      const deletedNotification = state.notifications.find(
        (notification: Notification) => notification._id === action.payload
      );
      const newUnreadCount = deletedNotification && !deletedNotification.read 
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount;
      
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: newUnreadCount,
      };

    case NOTIFICATIONS_ACTION_TYPES.DELETE_ALL_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };

    case NOTIFICATIONS_ACTION_TYPES.ADD_NOTIFICATION:
      const newNotification = action.payload;
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: newNotification.read ? state.unreadCount : state.unreadCount + 1,
      };

    case NOTIFICATIONS_ACTION_TYPES.UPDATE_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload,
      };

    case NOTIFICATIONS_ACTION_TYPES.CLEAR_NOTIFICATIONS_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Selectors
export const selectNotifications = (state: { notifications: NotificationsState }) => state.notifications;
export const selectNotificationsList = (state: { notifications: NotificationsState }) => state.notifications.notifications;
export const selectUnreadNotifications = (state: { notifications: NotificationsState }) => 
  state.notifications.notifications.filter(notification => !notification.read);
export const selectUnreadCount = (state: { notifications: NotificationsState }) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state: { notifications: NotificationsState }) => state.notifications.loading;
export const selectNotificationsError = (state: { notifications: NotificationsState }) => state.notifications.error;

// Notification type selectors
export const selectNotificationsByType = (type: string) => (state: { notifications: NotificationsState }) =>
  state.notifications.notifications.filter(notification => notification.type === type);

export const selectMatchNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.notifications.filter(notification => notification.type === 'match');

export const selectBookingNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.notifications.filter(notification => notification.type === 'booking');

export const selectMessageNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.notifications.filter(notification => notification.type === 'message');

export const selectSystemNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.notifications.filter(notification => notification.type === 'system');

export const selectPaymentNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.notifications.filter(notification => notification.type === 'payment');

export default notificationsReducer;
