# Match & Settle Mobile App - Frontend Development Guide

## 🏠 Project Overview

**Match & Settle** is an AI-powered student housing and roommate matching platform that helps students find suitable accommodation and compatible roommates through intelligent matching algorithms. This mobile app serves both **Students** and **Landlords** with role-specific functionality.

## 📱 App Structure

### Target Users
- **Students**: Search for properties, find roommates, book accommodations, make payments
- **Landlords**: Manage property listings, handle bookings, verify payments, communicate with tenants

## 🎯 Core Features to Implement

### 🔐 Authentication & User Management

#### Registration Flow
- **Multi-role registration** (Student/Landlord selection)
- **Student-specific fields**: University, Study Field, Year of Study (1-7)
- **Profile image upload** with Cloudinary integration
- **Real-time validation** and error handling
- **Comprehensive user preferences** setup

#### Login & Profile
- **JWT-based authentication** with secure cookie storage
- **Cross-platform session management**
- **Profile management** with preference updates
- **Image upload and optimization**

### 📍 Property Management

#### For Students
- **Smart property search** with AI-powered recommendations
- **Advanced filtering**:
  - Price range (budget matching)
  - Location-based search with radius
  - Amenities (WiFi, Parking, Laundry, Gym, Security, Furnished)
  - Room type (Private, Shared, Studio)
  - Distance to university/transport
- **Interactive map integration** with Leaflet/OpenStreetMap
- **Property details view** with image gallery
- **Save favorites** and property comparisons
- **AI compatibility scoring** for each property

#### For Landlords
- **Property listing creation** with multiple image upload
- **Geolocation picker** for accurate property placement
- **Property analytics** and performance insights
- **Listing management** (edit, update, delete)
- **Booking request management**
- **Revenue tracking and analytics**

### 🤖 AI Matching System

#### Property Matching
- **Personalized recommendations** based on:
  - Budget preferences
  - Location preferences (commute time)
  - Lifestyle compatibility
  - Amenity requirements
  - Past behavior patterns
- **Compatibility scores** (0-100%)
- **Match explanations** showing why properties were recommended
- **Like/Pass functionality** to improve recommendations

#### Roommate Matching
- **Personality-based matching** using Big Five model:
  - Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- **Lifestyle compatibility**:
  - Sleep schedule (Early Bird, Night Owl, Flexible)
  - Social level (Very Social, Moderately Social, Prefers Quiet)
  - Cleanliness preferences
  - Study habits
  - Smoking/pets/guests preferences
- **Swipe interface** for roommate discovery
- **Mutual matching** system

### 📋 Booking System

#### Booking Flow
- **Property booking requests** with calendar integration
- **Roommate integration** during booking process
- **Multi-step booking wizard**:
  1. Date selection (start/end dates)
  2. Roommate matching (optional)
  3. Payment method selection
  4. Booking confirmation
- **Security deposit calculations**
- **Booking status tracking** (Pending, Confirmed, Cancelled, Completed, Disputed)

#### Roommate Coordination
- **Group booking functionality** for shared accommodations
- **Roommate confirmation system**
- **Split payment coordination**
- **Group communication features**

### 💰 Payment System (Morocco Local Methods)

#### Supported Payment Methods
1. **WafaCash** 📱
   - Mobile money transfer
   - QR code integration
   - Instant processing

2. **CashPlus** 📱
   - Mobile payment service
   - USSD integration
   - Real-time verification

3. **Bank Transfer** 🏦
   - RIB-based transfers
   - Account verification
   - Bank statement upload

4. **Cash** 💵
   - In-person payments
   - Receipt verification
   - Meeting coordination

#### Payment Flow
- **Payment method selection** with fee calculation
- **Payment instructions** display
- **Proof upload** with camera integration
- **Real-time status tracking**
- **Payment verification** workflow
- **Refund management**

### 📱 Real-time Features

#### Notifications
- **Push notifications** via Pusher
- **In-app notification center**
- **Notification types**:
  - New matches (property/roommate)
  - Booking updates
  - Payment confirmations
  - Message alerts
  - Property updates
  - Verification status changes

#### Real-time Updates
- **Live booking status** changes
- **Payment verification** updates
- **New match** alerts
- **Message delivery** status

### 🗺️ Location Features

#### Map Integration
- **Interactive property maps** using Leaflet
- **Location-based search** with radius selection
- **Nearby amenities** display (universities, transport, shops)
- **Commute time calculation**
- **Street view integration** (if available)
- **Offline map support**

#### Geocoding
- **Address to coordinates** conversion
- **Reverse geocoding** for location names
- **Morocco-specific** location services
- **University proximity** calculations

### 📊 User Experience Features

#### Personalization
- **AI-powered dashboard** with personalized content
- **Smart recommendations** based on user behavior
- **Preference learning** from user interactions
- **Customizable interface** themes

#### Accessibility
- **Multi-language support** (Arabic, French, English)
- **Right-to-left (RTL)** language support
- **Voice search** capabilities
- **Accessibility compliance** (screen readers, high contrast)

## 🛠️ Technical Implementation Guide

### 🏗️ Architecture

#### State Management
```typescript
// Recommended: Redux Toolkit + RTK Query for API calls
interface AppState {
  auth: AuthState;
  properties: PropertyState;
  matching: MatchingState;
  bookings: BookingState;
  payments: PaymentState;
  notifications: NotificationState;
  location: LocationState;
}
```

#### Navigation Structure
```typescript
// Bottom Tab Navigation (Main)
- Home (Dashboard)
- Search (Properties)
- Matches (AI Recommendations)
- Bookings (Management)
- Profile (Settings)

// Stack Navigators
- AuthStack (Login, Register, Forgot Password)
- PropertyStack (Details, Gallery, Booking)
- MatchingStack (Roommate Discovery, Match Details)
- BookingStack (Create, Manage, Payment)
- PaymentStack (Methods, Proof Upload, Status)
```

### 📡 API Integration

#### Base Configuration
```typescript
const API_CONFIG = {
  baseURL: 'https://uni-nest.vercel.app/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};
```

#### Authentication Headers
```typescript
// JWT token management
const authInterceptor = {
  request: (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
};
```

### 🔄 Key API Endpoints

#### Authentication
```typescript
POST /api/auth/register     // User registration
POST /api/auth/login        // User login
GET  /api/auth/profile      // Get user profile
PUT  /api/auth/profile      // Update profile
PUT  /api/auth/preferences  // Update preferences
PUT  /api/auth/lifestyle    // Update lifestyle
```

#### Properties
```typescript
GET    /api/properties/properties          // List properties
GET    /api/properties/properties/search   // Search properties
GET    /api/properties/properties/:id      // Property details
POST   /api/properties/properties          // Create property (Landlord)
PUT    /api/properties/properties/:id      // Update property (Landlord)
DELETE /api/properties/properties/:id      // Delete property (Landlord)
GET    /api/properties/landlord/properties // Landlord's properties
```

#### AI Matching
```typescript
GET  /api/matching/                    // Get user matches
POST /api/matching/generate/:type      // Generate recommendations
PATCH /api/matching/:id/status         // Update match status (like/pass)
GET  /api/matching/:id                 // Match details
```

#### Bookings
```typescript
POST   /api/bookings/              // Create booking
GET    /api/bookings/user          // User bookings
GET    /api/bookings/:id           // Booking details
PATCH  /api/bookings/:id/status    // Update booking status
POST   /api/bookings/:id/payment   // Process payment
DELETE /api/bookings/:id           // Cancel booking
```

#### Payments
```typescript
POST /api/payments/                    // Initiate payment
POST /api/payments/:id/proof           // Upload payment proof
GET  /api/payments/:id                 // Payment details
GET  /api/payments/                    // User payments
GET  /api/payments/instructions/:method // Payment instructions
GET  /api/payments/fees/calculate      // Calculate fees
```

#### Notifications
```typescript
GET   /api/notifications/           // Get notifications
PATCH /api/notifications/:id/read   // Mark as read
PATCH /api/notifications/read-all   // Mark all as read
```

#### Location Services
```typescript
GET  /api/location/config           // Map configuration
POST /api/location/geocode          // Address to coordinates
POST /api/location/reverse-geocode  // Coordinates to address
GET  /api/location/nearby           // Find nearby properties
```

### 📱 UI/UX Implementation

#### Design System
Follow the provided **React Native UI Guidelines**:
- **Color Palette**: Primary `#6C63FF`, Secondary `#00C4B4`
- **Typography**: Inter font family
- **Component Library**: Create reusable components
- **Theme System**: Support light/dark modes

#### Key Screens

#### 1. **Authentication Screens**
```typescript
// Registration Screen
interface RegistrationForm {
  personalInfo: PersonalInfoStep;
  universityInfo: UniversityInfoStep;  // Students only
  preferences: PreferencesStep;
  lifestyle: LifestyleStep;
  profilePhoto: PhotoUploadStep;
}
```

#### 2. **Dashboard/Home Screen**
```typescript
interface DashboardData {
  aiRecommendations: Property[];
  recentMatches: Match[];
  activeBookings: Booking[];
  notifications: Notification[];
  quickActions: QuickAction[];
}
```

#### 3. **Property Search Screen**
```typescript
interface SearchFilters {
  priceRange: [number, number];
  location: LocationFilter;
  amenities: AmenityFilter[];
  roomType: RoomType;
  radius: number;
}
```

#### 4. **AI Matching Screen**
```typescript
interface MatchCard {
  id: string;
  type: 'Property' | 'Roommate';
  compatibilityScore: number;
  matchFactors: MatchFactors;
  photos: string[];
  key_features: string[];
}
```

#### 5. **Booking Management Screen**
```typescript
interface BookingCard {
  id: string;
  property: PropertySummary;
  status: BookingStatus;
  dates: DateRange;
  payment: PaymentSummary;
  roommates: RoommateSummary[];
}
```

#### 6. **Payment Screen**
```typescript
interface PaymentFlow {
  methodSelection: PaymentMethodStep;
  instructions: InstructionsStep;
  proofUpload: ProofUploadStep;
  verification: VerificationStep;
}
```

### 🔄 Real-time Integration

#### Pusher Configuration
```typescript
const pusherClient = new Pusher(PUSHER_KEY, {
  cluster: PUSHER_CLUSTER,
  encrypted: true,
  authEndpoint: '/api/pusher/auth'
});

// Subscribe to user channel
const userChannel = pusherClient.subscribe(`user-${userId}`);

// Listen for events
userChannel.bind('new-match', handleNewMatch);
userChannel.bind('booking-update', handleBookingUpdate);
userChannel.bind('payment-status', handlePaymentStatus);
userChannel.bind('notification', handleNotification);
```

### 📂 Recommended Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components
│   ├── forms/           # Form components
│   ├── cards/           # Card components
│   └── modals/          # Modal components
├── screens/             # Screen components
│   ├── auth/            # Authentication screens
│   ├── properties/      # Property-related screens
│   ├── matching/        # AI matching screens
│   ├── bookings/        # Booking screens
│   ├── payments/        # Payment screens
│   └── profile/         # Profile screens
├── navigation/          # Navigation configuration
├── services/            # API services
├── store/               # State management
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
├── constants/           # App constants
├── types/               # TypeScript types
└── assets/              # Images, icons, fonts
```

### 🔧 Development Tools

#### Required Packages
```json
{
  "dependencies": {
    "@react-navigation/native": "^6.x",
    "@react-navigation/bottom-tabs": "^6.x",
    "@reduxjs/toolkit": "^1.x",
    "react-redux": "^8.x",
    "react-native-maps": "^1.x",
    "react-native-image-picker": "^5.x",
    "react-native-push-notification": "^8.x",
    "pusher-js": "^8.x",
    "react-native-async-storage": "^1.x",
    "react-native-vector-icons": "^10.x",
    "react-native-paper": "^5.x",
    "react-native-elements": "^3.x",
    "react-native-gesture-handler": "^2.x",
    "react-native-reanimated": "^3.x"
  }
}
```

### 🧪 Testing Strategy

#### Unit Testing
- **Component testing** with React Native Testing Library
- **Service testing** for API integrations
- **Utility function testing**

#### Integration Testing
- **Authentication flow** testing
- **Booking process** testing
- **Payment flow** testing

#### E2E Testing
- **User journey** testing with Detox
- **Cross-platform** compatibility testing

### 🚀 Performance Optimization

#### Image Optimization
- **Lazy loading** for property images
- **Image caching** strategies
- **Cloudinary** transformations for different screen sizes

#### Network Optimization
- **API response** caching
- **Offline capability** for viewed properties
- **Optimistic updates** for user interactions

#### Memory Management
- **Component unmounting** cleanup
- **Large list virtualization**
- **Image memory** management

### 📱 Platform-Specific Considerations

#### iOS
- **App Store** guidelines compliance
- **Push notifications** setup with APNs
- **Deep linking** configuration

#### Android
- **Google Play** store requirements
- **Firebase** push notifications
- **Permission handling**

### 🌍 Localization

#### Supported Languages
- **Arabic** (RTL support)
- **French** (Morocco standard)
- **English** (International)

#### Implementation
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: arabicTranslations },
    fr: { translation: frenchTranslations },
    en: { translation: englishTranslations }
  },
  lng: 'fr', // Default to French for Morocco
  fallbackLng: 'en'
});
```

### 🔒 Security Implementation

#### Data Protection
- **Sensitive data** encryption
- **Secure storage** for tokens
- **Input validation** and sanitization
- **API endpoint** protection

#### Privacy Compliance
- **GDPR** compliance
- **User consent** management
- **Data retention** policies

### 📈 Analytics Integration

#### User Behavior Tracking
- **Screen navigation** analytics
- **Feature usage** metrics
- **Search behavior** analysis
- **Conversion funnel** tracking

#### Performance Monitoring
- **App performance** metrics
- **Crash reporting** with Crashlytics
- **Network request** monitoring

## 🎯 Development Priorities

### Phase 1: Core Functionality (Weeks 1-4)
1. Authentication system
2. Basic property search
3. Profile management
4. Simple booking flow

### Phase 2: AI Features (Weeks 5-8)
1. AI matching system
2. Recommendation engine
3. Roommate matching
4. Personalization features

### Phase 3: Advanced Features (Weeks 9-12)
1. Payment system integration
2. Real-time notifications
3. Advanced booking features
4. Analytics and insights

### Phase 4: Polish & Launch (Weeks 13-16)
1. UI/UX refinements
2. Performance optimization
3. Testing and bug fixes
4. App store preparation

This comprehensive guide provides everything needed to develop a production-ready mobile application for the Match & Settle platform, serving both students and landlords with a rich set of AI-powered features for housing and roommate matching.
