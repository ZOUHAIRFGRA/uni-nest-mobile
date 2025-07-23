// User types - Updated to match API v2
export interface User {
  _id: string;
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
  roomType: 'single' | 'shared' | 'studio' | 'apartment';
  amenities: string[];
  images: string[];
  landlordId: string;
  landlord?: User;
  available: boolean;
  availableFrom: string;
  rating: number;
  reviews: Review[];
  features: PropertyFeatures;
  aiScore?: number;
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
  propertyId: string;
  property?: Property;
  tenantId: string;
  tenant?: User;
  landlordId: string;
  landlord?: User;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'WafaCash' | 'CashPlus' | 'Bank Transfer' | 'Cash';
  paymentDetails?: PaymentDetails;
  createdAt: string;
  updatedAt: string;
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

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  message: string;
}

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
