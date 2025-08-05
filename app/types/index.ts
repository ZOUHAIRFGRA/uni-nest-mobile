// User types - Updated to match API v2
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cin: string; // National ID
  address: string;
  dob: string; // Date of birth
  gender: 'Male' | 'Female' | 'Other';
  role: 'Student' | 'Landlord' | 'Admin';
  profileImage: string;
  // Student-specific fields
  university?: string;
  studyField?: string;
  yearOfStudy?: number;
  studentId?: string;
  // User preferences and lifestyle
  preferences?: UserPreferences;
  lifestyle?: LifestylePreferences;
  subscriptionPlan?: 'Free' | 'Premium' | 'Pro';
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface UserPreferences {
  budget: {
    min: number;
    max: number;
  };
  preferredAreas: string[];
  maxCommuteTime: number;
  amenities: {
    wifi: boolean;
    parking: boolean;
    laundry: boolean;
    gym: boolean;
    security: boolean;
    furnished: boolean;
  };
  roomType: string;
}

export interface LifestylePreferences {
  smokingHabits: string;
  alcoholConsumption: string;
  petFriendly: boolean;
  sleepSchedule: string;
  socialLevel: string;
  cleanlinessLevel: string;
  noiseLevel: string;
  guestPolicy: string;
}

export interface Location {
  address: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  nearbyUniversities: string[];
}

// Property types
export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: Location;
  address: string;
  maxTenants: number;
  distanceToUniversity: number;
  distanceToBusStop: number;
  roomType: 'single' | 'shared' | 'studio' | 'apartment' | 'Private';
  amenities: string[] | any;
  images: string[];
  landlordId: string;
  landlord?: User;
  available: boolean;
  availableFrom: string;
  rating: number;
  reviews: Review[];
  features: PropertyFeatures;
  aiScore?: number;
  utilitiesIncluded?: boolean;
  isAvailable?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFeatures {
  furnished: boolean;
  wifi: boolean;
  parking: boolean;
  laundry: boolean;
  kitchen: boolean;
  balcony: boolean;
  airConditioning: boolean;
  heating: boolean;
  securitySystem: boolean;
  nearPublicTransport: boolean;
}

export interface Review {
  _id: string;
  userId: string;
  user?: User;
  rating: number;
  comment: string;
  createdAt: string;
}

// Matching types
export interface Match {
  _id: string;
  type: 'property' | 'roommate';
  userId: string;
  targetId: string; // Property ID or User ID
  target?: Property | User;
  compatibilityScore: number;
  reasons: string[];
  status: 'pending' | 'liked' | 'disliked' | 'matched' | 'expired';
  aiRecommendationData: {
    budgetMatch: number;
    locationMatch: number;
    amenitiesMatch: number;
    personalityMatch?: number;
    overallScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Booking types
export interface Booking {
  _id: string;
  propertyId: Property; // Populated Property object
  property?: Property;
  tenantId: string;
  tenant?: User;
  studentId: User; // Populated User object (student tenant)
  landlordId: User; // Populated User object (landlord)
  landlord?: User;
  startDate: string;
  endDate: string;
  totalAmount: number;
  monthlyRent: number;
  securityDeposit: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'WafaCash' | 'CashPlus' | 'Bank Transfer' | 'Cash';
  paymentDetails?: PaymentDetails;
  paymentVerification?: {
    status: 'Pending' | 'Verified' | 'Rejected';
    verifiedAt?: string;
    verifiedBy?: string;
    notes?: string;
  };
  paymentProof?: string; // URL to payment proof image/document
  roommates?: User[]; // Array of roommate User objects
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  landlordId: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  currency: string;
  method: 'bank_transfer' | 'cash' | 'check' | 'online' | 'WafaCash' | 'CashPlus';
  status: 'pending' | 'verified' | 'rejected' | 'overdue' | 'cancelled' | 'paid' | 'failed' | 'refunded';
  proofUrl?: string;
  verificationNotes?: string;
  dueDate: Date;
  paidAt?: Date;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentSummary {
  total: number;
  verified: number;
  pending: number;
  overdue: number;
  cancelled?: number;
  rejected?: number;
}

export interface PaymentDetails {
  method: string;
  transactionId?: string;
  proofUrl?: string;
  instructions?: string;
  fees: number;
  status: 'pending' | 'verified' | 'failed';
}

// Chat types
export interface Chat {
  _id: string;
  participants: string[];
  participantDetails?: User[];
  lastMessage?: Message;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  sender?: User;
  message: string;
  messageType: 'text' | 'image' | 'file' | 'location';
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

// Notification types
export interface Notification {
  _id: string;
  userId: string;
  type: 'match' | 'message' | 'booking' | 'payment' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  } & T;
  message?: string;
  error?: string;
}

// Analytics types for landlord dashboard
export interface RevenueData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  growth: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  revenueData: RevenueData[];
  paymentMethodBreakdown: {
    method: string;
    amount: number;
    percentage: number;
  }[];
}

export interface ExpenseBreakdown {
  totalExpenses: number;
  categories: {
    category: string;
    amount: number;
    percentage: number;
    color?: string;
  }[];
  monthlyTrend: {
    month: string;
    amount: number;
  }[];
}

export interface PropertyPerformance {
  propertyId: string;
  propertyName: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  occupancyRate: number;
  averageRating: number;
  bookingCount: number;
  roi: number;
}

export interface DashboardOverview {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalProperties: number;
  occupiedProperties: number;
  totalBookings: number;
  pendingPayments: number;
  recentActivity: {
    type: 'booking' | 'payment' | 'maintenance' | 'document';
    message: string;
    timestamp: Date;
  }[];
}

// Maintenance types for landlord management
export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliances' | 'general' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  images: string[];
  estimatedCost?: number;
  actualCost?: number;
  contractor?: {
    id?: string;
    name: string;
    phone: string;
    email?: string;
    specialty: string;
  };
  notes?: string;
  timeline: {
    status: string;
    timestamp: Date;
    notes?: string;
    updatedBy: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Document types for landlord document management
export interface Document {
  id: string;
  landlordId: string;
  propertyId?: string;
  tenantId?: string;
  title: string;
  description?: string;
  category: 'lease_agreement' | 'insurance_policy' | 'property_deed' | 'inspection_report' | 
           'financial_statement' | 'tax_document' | 'maintenance_record' | 'legal_document' | 'other';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  expiryDate?: Date;
  tags: string[];
  accessLevel: 'private' | 'tenant_shared' | 'public';
  version: number;
  isActive: boolean;
  sharedWith: {
    userId: string;
    permissions: 'view' | 'download' | 'edit';
    sharedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Expense types for landlord expense tracking
export interface Expense {
  id: string;
  landlordId: string;
  propertyId?: string;
  category: 'maintenance' | 'utilities' | 'insurance' | 'taxes' | 'marketing' | 
           'legal' | 'management' | 'repairs' | 'supplies' | 'other';
  subcategory?: string;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  vendor?: {
    name: string;
    contact?: string;
    email?: string;
  };
  receiptUrl?: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'online';
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  maintenanceRequestId?: string;
  tags: string[];
  notes?: string;
  isDeductible: boolean;
  taxCategory?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Property stats for analytics
export interface PropertyStats {
  totalViews: number;
  totalBookings: number;
  currentOccupancy: number;
  averageRating: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  occupancyRate: number;
}

// Specific API response types for landlord service
export type PaymentHistoryResponse = PaginatedResponse<{
  payments: Payment[];
}>;

export type PropertiesResponse = PaginatedResponse<{
  properties: Property[];
}>;

export type BookingsResponse = PaginatedResponse<{
  bookings: Booking[];
}>;

export type MaintenanceRequestsResponse = PaginatedResponse<{
  requests: MaintenanceRequest[];
}>;

export type DocumentsResponse = PaginatedResponse<{
  documents: Document[];
}>;

export type ExpensesResponse = PaginatedResponse<{
  expenses: Expense[];
}>;

export type TenantsResponse = PaginatedResponse<{
  tenants: User[];
}>;

// Property service response types
export type PropertiesListResponse = PaginatedResponse<{
  properties: Property[];
}>;

export type PropertySearchResponse = PaginatedResponse<{
  properties: Property[];
}>;

export type PropertyReviewsResponse = PaginatedResponse<{
  reviews: any[];
}>;

// Matching service response types
export type MatchesResponse = PaginatedResponse<{
  matches: Match[];
}>;

// Analytics response types
export type RevenueAnalyticsResponse = ApiResponse<RevenueAnalytics>;
export type ExpenseBreakdownResponse = ApiResponse<ExpenseBreakdown>;
export type PropertyPerformanceResponse = ApiResponse<PropertyPerformance[]>;
export type DashboardOverviewResponse = ApiResponse<DashboardOverview>;

// Dashboard stats response
export type DashboardStatsResponse = ApiResponse<{
  totalProperties: number;
  occupiedProperties: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  pendingBookings: number;
  totalTenants: number;
  activeTenants: number;
  pendingPayments: number;
  overduePayments: number;
  maintenanceRequests: number;
  urgentMaintenance: number;
}>;

// Search and Filter types
export interface SearchFilters {
  query?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  location?: string;
  roomType?: string[];
  amenities?: string[];
  distance?: number;
  rating?: number;
  available?: boolean;
  sortBy?: 'price' | 'rating' | 'distance' | 'date' | 'aiScore';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Property filters (alias for SearchFilters for backward compatibility)
export type PropertyFilters = SearchFilters;

// Auth types - Updated to match API v2
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  cin: string;
  address: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  role?: 'Student' | 'Landlord' | 'Admin'; // defaults to Student
  // Required for Students
  university?: string;
  studyField?: string;
  yearOfStudy?: number;
  profileImage?: File;
  preferences?: {
    budget: { min: number; max: number };
    preferredAreas: string[];
    maxCommuteTime: number;
    amenities: { [key: string]: boolean };
    roomType: string;
  };
  lifestyle?: {
    smokingHabits: string;
    alcoholConsumption: string;
    petFriendly: boolean;
    sleepSchedule: string;
    socialLevel: string;
    cleanlinessLevel: string;
    noiseLevel: string;
    guestPolicy: string;
  };
}

export interface AuthState {
  user: User | null;
  // API v2 uses HTTP-only cookies, no client-side token
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Redux State types
export interface RootState {
  auth: AuthState;
  properties: PropertiesState;
  matches: MatchesState;
  bookings: BookingsState;
  chats: ChatsState;
  notifications: NotificationsState;
  ui: UIState;
}

export interface PropertiesState {
  properties: Property[];
  currentProperty: Property | null;
  loading: boolean;
  error: string | null;
  filters: SearchFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface MatchesState {
  matches: Match[];
  currentMatch: Match | null;
  loading: boolean;
  error: string | null;
  type: 'property' | 'roommate' | 'all';
}

export interface BookingsState {
  bookings: Booking[];
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;
}

export interface ChatsState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  typingUsers: string[];
}

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export interface UIState {
  theme: 'light' | 'dark';
  activeTab: string;
  isNetworkConnected: boolean;
  refreshing: boolean;
  modals: {
    [key: string]: boolean;
  };
}

// Utility types
export type LoadingState = 'idle' | 'pending' | 'succeeded' | 'failed';

export interface AsyncState<T> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Socket.IO types for real-time features
export interface SocketEvents {
  'user_online': (userId: string) => void;
  'user_offline': (userId: string) => void;
  'new_message': (message: Message) => void;
  'user_typing': (data: { chatId: string; userId: string }) => void;
  'user_stop_typing': (data: { chatId: string; userId: string }) => void;
  'new_match': (match: Match) => void;
  'booking_update': (booking: Booking) => void;
  'notification': (notification: Notification) => void;
}

// Environment configuration
export interface AppConfig {
  API_BASE_URL: string;
  SOCKET_URL: string;
  PUSHER_CONFIG: {
    appId: string;
    key: string;
    secret: string;
    cluster: string;
  };
  MAPS_CONFIG: {
    apiKey?: string;
    defaultRegion: {
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    };
  };
}
