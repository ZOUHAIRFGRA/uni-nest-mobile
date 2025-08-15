// Roommate invitation service
import { apiClient } from './apiClient';

export interface RoommateInvitation {
  _id: string;
  fromUser: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    university?: string;
    studyField?: string;
  };
  toUser: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    university?: string;
    studyField?: string;
  };
  propertyId: {
    _id: string;
    title: string;
    location: {
      address?: string;
      city?: string;
    };
    images: string[];
    price: number;
  };
  bookingData: {
    startDate: string;
    endDate: string;
    monthlyRent: number;
    securityDeposit: number;
    totalAmount: number;
  };
  status: 'Pending' | 'Accepted' | 'Declined' | 'Expired' | 'Cancelled';
  message: string;
  responseMessage?: string;
  createdAt: string;
  respondedAt?: string;
  expiresAt: string;
}

export interface InvitationResponse {
  success: boolean;
  data: RoommateInvitation | RoommateInvitation[];
  message?: string;
  totalCount?: number;
  pendingCount?: number;
  currentPage?: number;
  totalPages?: number;
}

export const roommateService = {
  // Send roommate invitation
  sendInvitation: async (invitationData: {
    toUserId: string;
    propertyId: string;
    bookingData: {
      startDate: string;
      endDate: string;
      monthlyRent: number;
      securityDeposit: number;
      totalAmount: number;
    };
    message?: string;
  }): Promise<RoommateInvitation> => {
    const response = await apiClient.post<InvitationResponse>('/roommates/invite', invitationData);
    if (response?.success && response?.data) {
      return response.data as RoommateInvitation;
    }
    throw new Error('Failed to send invitation');
  },

  // Get received invitations
  getReceivedInvitations: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    invitations: RoommateInvitation[];
    totalCount: number;
    pendingCount: number;
    currentPage: number;
    totalPages: number;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<InvitationResponse>(
      `/roommates/invitations/received?${queryParams.toString()}`
    );
    
    if (response?.success && response?.data) {
      return {
        invitations: response.data as RoommateInvitation[],
        totalCount: response.totalCount || 0,
        pendingCount: response.pendingCount || 0,
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
      };
    }
    
    return {
      invitations: [],
      totalCount: 0,
      pendingCount: 0,
      currentPage: 1,
      totalPages: 1,
    };
  },

  // Get sent invitations
  getSentInvitations: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    invitations: RoommateInvitation[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<InvitationResponse>(
      `/roommates/invitations/sent?${queryParams.toString()}`
    );
    
    if (response?.success && response?.data) {
      return {
        invitations: response.data as RoommateInvitation[],
        totalCount: response.totalCount || 0,
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
      };
    }
    
    return {
      invitations: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
    };
  },

  // Get invitation details
  getInvitationDetails: async (invitationId: string): Promise<RoommateInvitation> => {
    const response = await apiClient.get<InvitationResponse>(`/roommates/invitations/${invitationId}`);
    if (response?.success && response?.data) {
      return response.data as RoommateInvitation;
    }
    throw new Error('Invitation not found');
  },

  // Respond to invitation
  respondToInvitation: async (
    invitationId: string,
    response: 'accept' | 'decline',
    responseMessage?: string
  ): Promise<RoommateInvitation> => {
    const result = await apiClient.post<InvitationResponse>(
      `/roommates/invitations/${invitationId}/respond`,
      {
        response,
        responseMessage: responseMessage || ''
      }
    );
    
    if (result?.success && result?.data) {
      return result.data as RoommateInvitation;
    }
    throw new Error('Failed to respond to invitation');
  },

  // Cancel invitation
  cancelInvitation: async (invitationId: string): Promise<void> => {
    await apiClient.delete(`/roommates/invitations/${invitationId}/cancel`);
  },

  // Get pending invitations count (for badge notifications)
  getPendingCount: async (): Promise<number> => {
    try {
      const result = await roommateService.getReceivedInvitations({ 
        status: 'Pending', 
        limit: 1 
      });
      return result.pendingCount;
    } catch (error) {
      console.error('Error getting pending count:', error);
      return 0;
    }
  },
};
