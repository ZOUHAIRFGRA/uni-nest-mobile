// Chat service for managing chat operations
import { apiClient } from './apiClient';
import type {  Chat, Message } from '../types';

export const chatService = {
  // Get all chats for the current user
  getChats: async (): Promise<Chat[]> => {
    const response = await apiClient.get<Chat[]>('/chats');
    return response.data || []; // Ensure response.data is an array, or default to empty array
  },

  // Get a specific chat by ID
  getChatById: async (chatId: string): Promise<Chat> => {
    const response = await apiClient.get<Chat>(`/chats/${chatId}`);
    return response.data as Chat; // Cast to Chat, assuming API returns a single Chat object or null/undefined
  },

  // Get messages for a specific chat
  getMessages: async (chatId: string, page = 1, limit = 50): Promise<Message[]> => {
    const response = await apiClient.get<Message[]>(`/chats/${chatId}/messages`, {
      params: { page, limit }
    });
    return response.data || [];
  },

  // Send a message in a chat
  sendMessage: async (chatId: string, content: string): Promise<Message> => {
    const response = await apiClient.post<Message>(`/chats/${chatId}/messages`, {
      content
    }); 
    return response.data as Message; // Cast to Message, assuming API returns a single Message object or null/undefined
  },

  // Create a new chat
  createChat: async (participantId: string): Promise<Chat> => {
    const response = await apiClient.post<Chat>('/chats', {
      participantId
    }); 
    return response.data as Chat; // Cast to Chat, assuming API returns a single Chat object or null/undefined
  },

  // Mark messages as read
  markMessagesAsRead: async (chatId: string, messageIds: string[]): Promise<void> => {
    await apiClient.put(`/chats/${chatId}/read`, {
      messageIds
    });
  },

  // Set typing status
  setTypingStatus: async (chatId: string, isTyping: boolean): Promise<void> => {
    await apiClient.post(`/chats/${chatId}/typing`, {
      isTyping
    });
  },

  // Delete a message
  deleteMessage: async (chatId: string, messageId: string): Promise<void> => {
    await apiClient.delete(`/chats/${chatId}/messages/${messageId}`);
  },

  // Leave a chat
  leaveChat: async (chatId: string): Promise<void> => {
    await apiClient.delete(`/chats/${chatId}/leave`);
  },
};
