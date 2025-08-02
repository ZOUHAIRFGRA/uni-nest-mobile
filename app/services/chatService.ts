// Chat service for managing chat operations
import { apiClient } from './apiClient';
import type {  Chat, Message } from '../types';

export const chatService = {
  // Get all chats for the current user
  getChats: async (): Promise<Chat[]> => {
    const response = await apiClient.get<{ data: Chat[] }>('/chats');
    console.log("[RES GET CHATS].data",response.data)
    return response.data || [];
  },

  // Get a specific chat by ID
  /* '
  {
    "success": true,
    "data": {
        "_id": "6882a7eed0652e1461bac0fd",
        "participants": [
            "687d5f996f17d7c7f0e21828",
            "6870623bfcdf3ef0d2843a43"
        ],
        "unreadCounts": {},
        "createdAt": "2025-07-24T21:38:54.552Z",
        "updatedAt": "2025-07-24T21:38:54.552Z",
        "__v": 0
    }
  }
   */
  getChatById: async (chatId: string): Promise<Chat> => {
    const response = await apiClient.get<{ data: Chat }>(`/chats/${chatId}`);
    console.log("[RES GET CHAT BY ID]",response.data)
    return response.data; // Cast to Chat, assuming API returns a single Chat object or null/undefined
  },

  // Get messages for a specific chat
  getMessages: async (chatId: string, page = 1, limit = 50): Promise<Message[]> => {
    const response = await apiClient.get<{ data: Message[] }>(`/chats/${chatId}/messages`, {
      params: { page, limit }
    });
    return response.data || [];
  },

  // Send a message in a chat
  sendMessage: async (chatId: string, content: string): Promise<Message> => {
    const response = await apiClient.post<Message>(`/chats/${chatId}/messages`, {
      content
    }); 
    console.log("[RES SEND MSG]",response)
    return response as Message; // Cast to Message, assuming API returns a single Message object or null/undefined
  },

  // Create a new chat
  createChat: async (participantId: string): Promise<Chat> => {
    const response = await apiClient.post<Chat>('/chats', {
      participantId
    }); 
    return response as Chat; // Cast to Chat, assuming API returns a single Chat object or null/undefined
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

  // Search users by name or email
  searchUsers: async (query: string): Promise<any[]> => {
    const response = await apiClient.get<any[]>(`/users/search?name=${encodeURIComponent(query)}`);
    return response || [];
  },

  // Start or open a chat with a user
  startChat: async (userId: string): Promise<any> => {
    const response = await apiClient.post<any>('/chats', { participantIds: [userId] });
    return response;
  },
};
