// Notification service for managing notifications
import { apiClient } from './apiClient';
import type { Notification } from '../types';

export const notificationService = {
  // Get all notifications for the current user
  getNotifications: async (page = 1, limit = 50): Promise<{
    notifications: Notification[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    unreadCount: number;
  }> => {
    const response = await apiClient.get<{ 
      success: boolean; 
      data: { 
        notifications: Notification[]; 
        totalCount: number; 
        currentPage: number; 
        totalPages: number; 
        unreadCount: number; 
      } 
    }>('/notifications', {
      params: { page, limit }
    });
    console.log('🔍 [NOTIFICATIONS RESPONSE]', response);
    if (response?.success && response?.data) {
      return {
        notifications: response.data.notifications,
        totalCount: response.data.totalCount,
        currentPage: response.data.currentPage, 
        totalPages: response.data.totalPages,
        unreadCount: response.data.unreadCount
      };
    }
    
    return {
      notifications: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
      unreadCount: 0,
    };
  },

  // Get unread notifications count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ success: boolean; data: { unreadCount: number } }>('/notifications');
    return response.data?.unreadCount || 0;
  },

  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
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
  getPreferences: async () => {
    const response = await apiClient.get('/users/notification-preferences');
    return response;
  },
  updatePreferences: async (prefs: any) => {
    await apiClient.patch('/users/notification-preferences', prefs);
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
