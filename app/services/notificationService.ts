// Notification service for managing notifications
import { apiClient } from './apiClient';
import type { Notification } from '../types';

export const notificationService = {
  // Get all notifications for the current user
  getNotifications: async (page = 1, limit = 50): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/notifications', {
      params: { page, limit }
    });
    return response.data || [];
  },

  // Get unread notifications count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data?.count || 0;
  },

  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.put(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },

  // Delete a notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
  },

  // Delete all notifications
  deleteAllNotifications: async (): Promise<void> => {
    await apiClient.delete('/notifications/all');
  },

  // Get notification preferences
  getPreferences: async (): Promise<{
    email: boolean;
    push: boolean;
    sms: boolean;
    types: {
      bookings: boolean;
      messages: boolean;
      matches: boolean;
      payments: boolean;
      reviews: boolean;
    };
  }> => {
    const response = await apiClient.get<any>('/notifications/preferences');
    return response.data || {
      email: true,
      push: true,
      sms: false,
      types: {
        bookings: true,
        messages: true,
        matches: true,
        payments: true,
        reviews: true,
      },
    };
  },

  // Update notification preferences
  updatePreferences: async (preferences: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    types?: {
      bookings?: boolean;
      messages?: boolean;
      matches?: boolean;
      payments?: boolean;
      reviews?: boolean;
    };
  }): Promise<void> => {
    await apiClient.put('/notifications/preferences', preferences);
  },

  // Create a test notification (for development)
  createTestNotification: async (type: string, title: string, message: string): Promise<Notification> => {
    const response = await apiClient.post<Notification>('/notifications/test', {
      type,
      title,
      message,
    });
    if (!response.data) {
      throw new Error('Failed to create test notification');
    }
    return response.data;
  },
};
