import { apiClient } from "./apiClient";
import {
  PropertiesResponse,
  PaymentHistoryResponse,
  RevenueAnalyticsResponse,
  MaintenanceRequestsResponse,
  BookingsResponse
} from "../types";

class LandlordService {

  // Property Management APIs
  async getMyProperties(page = 1, limit = 10): Promise<PropertiesResponse> {
    return await apiClient.get('/landlord/properties', { page, limit });
  }

  async getPropertyStats(propertyId: string) {
    return await apiClient.get(`/landlord/properties/${propertyId}/stats`);
  }

  async updatePropertyStatus(propertyId: string, isAvailable: boolean) {
    return await apiClient.patch(`/landlord/properties/${propertyId}/status`, { isAvailable });
  }

  // Booking Management APIs
  async getMyBookings(status?: string, page = 1, limit = 10): Promise<BookingsResponse> {
    const params: Record<string, any> = { page, limit };
    if (status) params.status = status;
    return await apiClient.get('/landlord/bookings', params);
  }

  async approveBooking(bookingId: string, notes?: string) {
    return await apiClient.post(`/landlord/bookings/${bookingId}/approve`, { notes });
  }

  async rejectBooking(bookingId: string, reason: string) {
    return await apiClient.post(`/landlord/bookings/${bookingId}/reject`, { reason });
  }

  // Booking Payment Management APIs
  async processBookingPayment(bookingId: string, paymentData: {
    method: string;
    amount: number;
    currency?: string;
    proofUrl?: string;
  }) {
    return await apiClient.post(`/bookings/${bookingId}/payment`, paymentData);
  }

  async getBookingDetails(bookingId: string) {
    return await apiClient.get(`/bookings/${bookingId}`);
  }

  async updateBookingStatus(bookingId: string, status: string, notes?: string) {
    return await apiClient.patch(`/bookings/${bookingId}/status`, { status, notes });
  }

  async cancelBooking(bookingId: string, reason?: string) {
    // Note: DELETE requests typically don't have body, reason could be sent as query param
    return await apiClient.delete(`/bookings/${bookingId}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
  }

  // Payment Management APIs  
  async verifyPayment(paymentId: string, isValid: boolean, notes?: string) {
    return await apiClient.patch(`/payments/${paymentId}/verify`, { isValid, notes });
  }

  async getPaymentHistory(propertyId?: string, page = 1, limit = 10): Promise<PaymentHistoryResponse> {
    const params: Record<string, any> = { page, limit };
    if (propertyId) params.propertyId = propertyId;
    return await apiClient.get('/payments', params);
  }

  async getPaymentDetails(paymentId: string) {
    return await apiClient.get(`/payments/${paymentId}`);
  }

  async getPaymentInstructions(method: string) {
    return await apiClient.get(`/payments/instructions/${method}`);
  }

  async calculatePaymentFees(amount: number, method: string) {
    return await apiClient.get('/payments/fees/calculate', { amount, method });
  }

  async getAdminPaymentDashboard() {
    return await apiClient.get('/payments/admin/dashboard');
  }

  // Additional Payment Analytics for Landlords
  async getPaymentsByProperty(propertyId: string, status?: string, page = 1, limit = 10) {
    const params: Record<string, any> = { propertyId, page, limit };
    if (status) params.status = status;
    return await apiClient.get('/payments', params);
  }

  async getPaymentStats(propertyIds?: string[], period = 'monthly') {
    const params: Record<string, any> = { period };
    if (propertyIds?.length) params.propertyIds = propertyIds.join(',');
    return await apiClient.get('/payments/stats', params);
  }

  // Analytics APIs - OPTIMIZED with caching
  async getDashboardStats() {
    // This endpoint now uses 5-minute caching for faster response
    return await apiClient.get('/landlord/dashboard/stats');
  }

  async getRevenueAnalytics(period = 'monthly', propertyIds?: string[], startDate?: string, endDate?: string): Promise<RevenueAnalyticsResponse> {
    const params: Record<string, any> = { period };
    if (propertyIds?.length) params.propertyIds = propertyIds.join(',');
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    // This endpoint now uses 30-minute caching and optimized aggregation pipelines
    return await apiClient.get('/landlord/analytics/revenue', params);
  }

  async getOccupancyAnalytics(propertyId?: string) {
    const params: Record<string, any> = {};
    if (propertyId) params.propertyId = propertyId;
    // This endpoint now uses 30-minute caching for better performance
    return await apiClient.get('/landlord/analytics/occupancy', params);
  }

  // Tenant Management APIs
  async getMyTenants(propertyId?: string) {
    const params: Record<string, any> = {};
    if (propertyId) params.propertyId = propertyId;
    return await apiClient.get('/landlord/tenants', params);
  }

  async sendNotificationToTenant(tenantId: string, title: string, message: string) {
    return await apiClient.post(`/landlord/tenants/${tenantId}/notify`, { title, message });
  }

  // Financial Analytics APIs - OPTIMIZED
  async getExpenseBreakdown(period = 'monthly', categories?: string[], propertyIds?: string[], startDate?: string, endDate?: string) {
    const params: Record<string, any> = { period };
    if (categories?.length) params.categories = categories.join(',');
    if (propertyIds?.length) params.propertyIds = propertyIds.join(',');
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    // Uses optimized aggregation with caching
    return await apiClient.get('/landlord/analytics/expenses', params);
  }

  async getPropertyPerformance(propertyIds?: string[], period = 'monthly') {
    const params: Record<string, any> = { period };
    if (propertyIds?.length) params.propertyIds = propertyIds.join(',');
    // Uses database indexes and caching for faster analytics
    return await apiClient.get('/landlord/analytics/properties', params);
  }

  async getDashboardOverview() {
    // Uses 5-minute caching for dashboard overview
    return await apiClient.get('/landlord/analytics/dashboard');
  }

  // Maintenance Management APIs
  async getMaintenanceRequests(propertyId?: string, status?: string, priority?: string, category?: string, page = 1, limit = 10): Promise<MaintenanceRequestsResponse> {
    const params: Record<string, any> = { page, limit };
    if (propertyId) params.propertyId = propertyId;
    if (status) params.status = status;
    if (priority) params.priority = priority;
    if (category) params.category = category;
    return await apiClient.get('/landlord/maintenance', params);
  }

  async createMaintenanceRequest(requestData: {
    propertyId: string;
    tenantId: string;
    title: string;
    description: string;
    category: string;
    priority?: string;
    images?: string[];
    notes?: string;
  }) {
    return await apiClient.post('/landlord/maintenance', requestData);
  }

  async updateMaintenanceStatus(requestId: string, status: string, notes?: string, estimatedCost?: number, actualCost?: number) {
    return await apiClient.put(`/landlord/maintenance/${requestId}`, { status, notes, estimatedCost, actualCost });
  }

  async assignContractor(requestId: string, contractorId?: string, contractorInfo?: {
    name: string;
    phone: string;
    email?: string;
    specialty?: string;
  }) {
    return await apiClient.post(`/landlord/maintenance/${requestId}/assign`, { contractorId, contractorInfo });
  }

  async getMaintenanceHistory(requestId: string) {
    return await apiClient.get(`/landlord/maintenance/${requestId}/history`);
  }

  // Document Management APIs
  async getDocuments(category?: string, propertyId?: string, tenantId?: string, tags?: string[], search?: string, page = 1, limit = 20) {
    const params: Record<string, any> = { page, limit };
    if (category) params.category = category;
    if (propertyId) params.propertyId = propertyId;
    if (tenantId) params.tenantId = tenantId;
    if (tags?.length) params.tags = tags.join(',');
    if (search) params.search = search;
    return await apiClient.get('/landlord/documents', params);
  }

  async uploadDocument(documentData: {
    propertyId?: string;
    tenantId?: string;
    title: string;
    description?: string;
    category: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    expiryDate?: string;
    tags?: string[];
    accessLevel?: string;
  }) {
    return await apiClient.post('/landlord/documents', documentData);
  }

  async updateDocument(documentId: string, updates: {
    title?: string;
    description?: string;
    category?: string;
    expiryDate?: string;
    tags?: string[];
    accessLevel?: string;
  }) {
    return await apiClient.put(`/landlord/documents/${documentId}`, updates);
  }

  async deleteDocument(documentId: string) {
    return await apiClient.delete(`/landlord/documents/${documentId}`);
  }

  async getExpiringDocuments(daysAhead = 30) {
    return await apiClient.get('/landlord/documents/expiring', { daysAhead });
  }

  async downloadDocument(documentId: string) {
    return await apiClient.get(`/landlord/documents/${documentId}/download`);
  }

  async shareDocument(documentId: string, userId: string, permissions = 'view') {
    return await apiClient.post(`/landlord/documents/${documentId}/share`, { userId, permissions });
  }

  // Expense Management APIs
  async getExpenses(category?: string, propertyId?: string, startDate?: string, endDate?: string, page = 1, limit = 20) {
    const params: Record<string, any> = { page, limit };
    if (category) params.category = category;
    if (propertyId) params.propertyId = propertyId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return await apiClient.get('/landlord/expenses', params);
  }

  async createExpense(expenseData: {
    propertyId?: string;
    category: string;
    subcategory?: string;
    amount: number;
    currency?: string;
    description: string;
    date?: string;
    vendor?: {
      name: string;
      contact?: string;
      email?: string;
    };
    receiptUrl?: string;
    paymentMethod?: string;
    isRecurring?: boolean;
    recurringPattern?: {
      frequency: string;
      interval?: number;
      endDate?: string;
    };
    maintenanceRequestId?: string;
    tags?: string[];
    notes?: string;
    isDeductible?: boolean;
    taxCategory?: string;
  }) {
    return await apiClient.post('/landlord/expenses', expenseData);
  }

  async updateExpense(expenseId: string, updates: any) {
    return await apiClient.put(`/landlord/expenses/${expenseId}`, updates);
  }

  async deleteExpense(expenseId: string) {
    return await apiClient.delete(`/landlord/expenses/${expenseId}`);
  }

  async getCategorizedExpenses(propertyId?: string, startDate?: string, endDate?: string) {
    const params: Record<string, any> = {};
    if (propertyId) params.propertyId = propertyId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return await apiClient.get('/landlord/expenses/categorized', params);
  }

  async getExpenseTrends(months = 12, propertyId?: string) {
    const params: Record<string, any> = { months };
    if (propertyId) params.propertyId = propertyId;
    return await apiClient.get('/landlord/expenses/trends', params);
  }

  // Property Analytics APIs
  async getPropertyAnalytics(propertyId: string, period = 'monthly') {
    return await apiClient.get(`/landlord/properties/${propertyId}/analytics`, { period });
  }

  async getOccupancyStats(propertyId: string) {
    return await apiClient.get(`/landlord/properties/${propertyId}/occupancy`);
  }

  async getRevenueByProperty(propertyId: string, period = 'monthly', startDate?: string, endDate?: string) {
    const params: Record<string, any> = { period };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return await apiClient.get(`/landlord/properties/${propertyId}/revenue`, params);
  }
}

export const landlordService = new LandlordService();
