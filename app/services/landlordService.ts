import { config } from '../utils/config';

class LandlordService {
  private getAuthHeaders() {
    // This would get the token from secure storage in a real app
    const token = ''; // Get from AsyncStorage or secure storage
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Property Management APIs
  async getMyProperties(page = 1, limit = 10) {
    try {
      const response = await fetch(`${config.API_BASE_URL}/landlord/properties?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching landlord properties:', error);
      throw error;
    }
  }

  async getPropertyStats(propertyId: string) {
    try {
      const response = await fetch(`${config.API_BASE_URL}/landlord/properties/${propertyId}/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching property stats:', error);
      throw error;
    }
  }

  async updatePropertyStatus(propertyId: string, isAvailable: boolean) {
    try {
      const response = await fetch(`${config.API_BASE_URL}/landlord/properties/${propertyId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isAvailable }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating property status:', error);
      throw error;
    }
  }

  // Booking Management APIs
  async getMyBookings(status?: string, page = 1, limit = 10) {
    try {
      let url = `${config.API_BASE_URL}/landlord/bookings?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching landlord bookings:', error);
      throw error;
    }
  }

  async approveBooking(bookingId: string, notes?: string) {
    try {
      const response = await fetch(`${config.API_BASE_URL}/landlord/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ notes }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error approving booking:', error);
      throw error;
    }
  }

  async rejectBooking(bookingId: string, reason: string) {
    try {
      const response = await fetch(`${config.API_BASE_URL}/landlord/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      throw error;
    }
  }

  // Payment Management APIs
  async verifyPayment(bookingId: string, isValid: boolean, notes?: string) {
    try {
      const response = await fetch(`${config.API_BASE_URL}/landlord/bookings/${bookingId}/verify-payment`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isValid, notes }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  async getPaymentHistory(propertyId?: string, page = 1, limit = 10) {
    try {
      let url = `${config.API_BASE_URL}/landlord/payments?page=${page}&limit=${limit}`;
      if (propertyId) {
        url += `&propertyId=${propertyId}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  // Analytics APIs
  async getDashboardStats() {
    try {
      const response = await fetch(`${config.API_BASE_URL}/landlord/dashboard/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async getRevenueAnalytics(period: 'month' | 'quarter' | 'year' = 'month') {
    try {
      const response = await fetch(`${config.API_BASE_URL}/landlord/analytics/revenue?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  }

  async getOccupancyAnalytics(propertyId?: string) {
    try {
      let url = `${config.API_BASE_URL}/landlord/analytics/occupancy`;
      if (propertyId) {
        url += `?propertyId=${propertyId}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching occupancy analytics:', error);
      throw error;
    }
  }

  // Tenant Management APIs
  async getMyTenants(propertyId?: string) {
    try {
      let url = `${config.API_BASE_URL}/landlord/tenants`;
      if (propertyId) {
        url += `?propertyId=${propertyId}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  }

  async sendNotificationToTenant(tenantId: string, title: string, message: string) {
    try {
      const response = await fetch(`${config.API_BASE_URL}/landlord/tenants/${tenantId}/notify`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ title, message }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending tenant notification:', error);
      throw error;
    }
  }

  // Maintenance Management APIs
  async getMaintenanceRequests(propertyId?: string, status?: string) {
    try {
      let url = `${config.API_BASE_URL}/landlord/maintenance`;
      const params = new URLSearchParams();
      if (propertyId) params.append('propertyId', propertyId);
      if (status) params.append('status', status);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      throw error;
    }
  }

  async updateMaintenanceStatus(requestId: string, status: string, notes?: string) {
    try {
      const response = await fetch(`${config.API_BASE_URL}/landlord/maintenance/${requestId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status, notes }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      throw error;
    }
  }

  // Document Management APIs
  async uploadDocument(file: File, type: string, bookingId?: string, propertyId?: string) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);
      if (bookingId) formData.append('bookingId', bookingId);
      if (propertyId) formData.append('propertyId', propertyId);

      const response = await fetch(`${config.API_BASE_URL}/landlord/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${''}`  // Token would come from storage
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async getDocuments(type?: string, bookingId?: string, propertyId?: string) {
    try {
      let url = `${config.API_BASE_URL}/landlord/documents`;
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (bookingId) params.append('bookingId', bookingId);
      if (propertyId) params.append('propertyId', propertyId);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }
}

export const landlordService = new LandlordService();
