import { AppConfig } from '../types';

// Environment configuration - Updated for API v2
export const config: AppConfig = {
  API_BASE_URL: __DEV__ 
    ? 'https://trusted-frank-mudfish.ngrok-free.app/api' 
    : 'https://uni-nest.vercel.app/api',
  SOCKET_URL: __DEV__ 
    ? 'https://trusted-frank-mudfish.ngrok-free.app' 
    : 'https://uni-nest.vercel.app',
  PUSHER_CONFIG: {
    appId: process.env.EXPO_PUBLIC_PUSHER_APP_ID || '',
    key: process.env.EXPO_PUBLIC_PUSHER_KEY || '',
    secret: process.env.EXPO_PUBLIC_PUSHER_SECRET || '',
    cluster: process.env.EXPO_PUBLIC_PUSHER_CLUSTER || 'eu',
  },
  MAPS_CONFIG: {
    apiKey: process.env.EXPO_PUBLIC_MAPS_API_KEY,
    defaultRegion: {
      latitude: 33.9716, // Rabat, Morocco
      longitude: -6.8498,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
  },
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@match_settle_token',
  USER_DATA: '@match_settle_user',
  THEME: '@match_settle_theme',
  LANGUAGE: '@match_settle_language',
  ONBOARDING_COMPLETED: '@match_settle_onboarding',
  SEARCH_HISTORY: '@match_settle_search_history',
  PREFERENCES: '@match_settle_preferences',
} as const;

// API endpoints - Updated for API v2
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile',
  },
  
  // User endpoints
  USERS: {
    LIST: '/users',
    ME: '/users/me',
    SEARCH: '/users/search',
    LANDLORDS: '/users/landlords',
    STUDENTS: '/users/students',
    BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  
  // Property endpoints
  PROPERTIES: {
    LIST: '/properties',
    CREATE: '/properties',
    DETAILS: (id: string) => `/properties/${id}`,
    UPDATE: (id: string) => `/properties/${id}`,
    DELETE: (id: string) => `/properties/${id}`,
    SEARCH: '/properties/search',
    NEARBY: '/properties/nearby',
    FAVORITES: '/properties/favorites',
    REVIEWS: (id: string) => `/properties/${id}/reviews`,
  },
  
  // Matching endpoints
  MATCHING: {
    LIST: '/matching',
    GENERATE: (type: string) => `/matching/generate/${type}`,
    UPDATE_STATUS: (id: string) => `/matching/${id}/status`,
    DETAILS: (id: string) => `/matching/${id}`,
    COMPATIBILITY: '/matching/compatibility',
  },
  
  // Booking endpoints
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    DETAILS: (id: string) => `/bookings/${id}`,
    UPDATE_STATUS: (id: string) => `/bookings/${id}/status`,
    USER_BOOKINGS: '/bookings/user',
    LANDLORD_BOOKINGS: '/bookings/landlord',
    PAYMENT: (id: string) => `/bookings/${id}/payment`,
  },
  
  // Payment endpoints
  PAYMENTS: {
    CREATE: '/payments',
    DETAILS: (id: string) => `/payments/${id}`,
    LIST: '/payments',
    UPLOAD_PROOF: (id: string) => `/payments/${id}/proof`,
    VERIFY: (id: string) => `/payments/${id}/verify`,
    INSTRUCTIONS: (method: string) => `/payments/instructions/${method}`,
    CALCULATE_FEES: '/payments/fees/calculate',
  },
  
  // Chat endpoints
  CHATS: {
    LIST: '/chats',
    CREATE: '/chats',
    DETAILS: (id: string) => `/chats/${id}`,
    MESSAGES: (id: string) => `/chats/${id}/messages`,
    SEND_MESSAGE: (id: string) => `/chats/${id}/messages`,
    MARK_READ: (id: string) => `/chats/${id}/read`,
  },
  
  // Notification endpoints
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    SETTINGS: '/notifications/settings',
  },
  
  // Location endpoints
  LOCATION: {
    SEARCH: '/location/search',
    NEARBY: '/location/nearby',
    CONFIG: '/location/config',
    UNIVERSITIES: '/location/universities',
  },
  
  // Admin endpoints (if user is admin)
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    PROPERTIES: '/admin/properties',
    BOOKINGS: '/admin/bookings',
    PAYMENTS: '/admin/payments',
    ANALYTICS: '/admin/analytics',
  },
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PROPERTY_CREATED: 'Property listed successfully!',
  BOOKING_CREATED: 'Booking request sent!',
  MESSAGE_SENT: 'Message sent successfully!',
  PAYMENT_INITIATED: 'Payment initiated successfully!',
  PREFERENCES_SAVED: 'Preferences saved successfully!',
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PHONE: /^(\+212|0)[5-7]\d{8}$/,
  MOROCCAN_BANK_ACCOUNT: /^\d{12,24}$/,
  RIB: /^\d{24}$/,
} as const;

// App constants
export const APP_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Search
  MIN_SEARCH_QUERY_LENGTH: 2,
  SEARCH_DEBOUNCE_MS: 500,
  
  // Upload limits
  MAX_IMAGE_SIZE_MB: 10,
  MAX_IMAGES_PER_PROPERTY: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  
  // Chat
  MAX_MESSAGE_LENGTH: 1000,
  TYPING_TIMEOUT_MS: 3000,
  
  // Matching
  MIN_COMPATIBILITY_SCORE: 60,
  AI_MATCH_THRESHOLD: 70,
  
  // Booking
  MIN_BOOKING_DURATION_DAYS: 30,
  MAX_BOOKING_DURATION_DAYS: 365,
  
  // Notifications
  NOTIFICATION_BATCH_SIZE: 50,
  
  // Cache
  CACHE_EXPIRY_MS: 5 * 60 * 1000, // 5 minutes
  
  // Retry
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
} as const;

// Moroccan cities for location picker
export const MOROCCAN_CITIES = [
  'Agadir',
  'Al Hoceima',
  'Beni Mellal',
  'Casablanca',
  'Chefchaouen',
  'El Jadida',
  'Errachidia',
  'Essaouira',
  'Fes',
  'Ifrane',
  'Kenitra',
  'Khouribga',
  'Laayoune',
  'Larache',
  'Marrakech',
  'Meknes',
  'Mohammedia',
  'Nador',
  'Ouarzazate',
  'Oujda',
  'Rabat',
  'Safi',
  'Sale',
  'Tanger',
  'Tetouan',
  'Tiznit',
] as const;

// Universities in Morocco
export const MOROCCAN_UNIVERSITIES = [
  'Hassan II University of Casablanca',
  'Mohammed V University of Rabat',
  'Cadi Ayyad University',
  'Sidi Mohamed Ben Abdellah University',
  'Mohammed First University',
  'Abdelmalek Essaadi University',
  'Ibn Tofail University',
  'Hassan I University',
  'Sultan Moulay Slimane University',
  'Ibn Zohr University',
  'Al Akhawayn University',
  'International University of Rabat',
  'ENSAM Casablanca',
  'ENSAM Meknes',
  'INSEA',
  'EMI',
  'ENCG',
] as const;

// Payment methods available in Morocco
export const PAYMENT_METHODS = [
  {
    id: 'wafacash',
    name: 'WafaCash',
    icon: '💳',
    description: 'Mobile money transfer',
    fees: 0.02, // 2%
    minAmount: 10,
    maxAmount: 50000,
  },
  {
    id: 'cashplus',
    name: 'CashPlus',
    icon: '💰',
    description: 'Mobile payment service',
    fees: 0.015, // 1.5%
    minAmount: 10,
    maxAmount: 30000,
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: '🏦',
    description: 'Direct bank transfer',
    fees: 0.01, // 1%
    minAmount: 100,
    maxAmount: 100000,
  },
  {
    id: 'cash',
    name: 'Cash',
    icon: '💵',
    description: 'Pay in cash on delivery',
    fees: 0,
    minAmount: 0,
    maxAmount: 10000,
  },
] as const;

// Export configuration for easy access
export default config;
