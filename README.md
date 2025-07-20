# Match & Settle - React Native App

A modern, AI-powered student housing and roommate matching platform built with React Native and Expo.

## 🚀 Features

### 🔐 Authentication & User Management
- **Multi-role registration** (Student/Landlord)
- **JWT-based authentication** with secure session management
- **Profile management** with image upload
- **Student-specific fields** (University, Study Field, Year of Study)

### 🏠 Property Management
- **Smart property search** with AI-powered recommendations
- **Advanced filtering** (Price, Location, Amenities, Room Type)
- **Property details** with image galleries
- **Favorites system** for saved properties
- **AI compatibility scoring** for each property

### 🤖 AI Matching System
- **Personalized recommendations** based on user preferences
- **Property and roommate matching** with compatibility scores
- **Like/pass functionality** to improve future recommendations
- **Match insights** explaining why properties are recommended

### 📋 Booking System
- **Property booking** with date selection
- **Payment method selection** (WafaCash, CashPlus, Bank Transfer, Cash)
- **Booking management** and status tracking
- **Cost breakdown** and payment instructions

### 🔔 Real-time Notifications
- **Push notifications** for matches, bookings, and updates
- **In-app notification center** with read/unread status
- **Real-time updates** via backend integration

### 👤 User Profile & Settings
- **Comprehensive profile management**
- **Student information** display
- **Settings and preferences** management
- **Privacy and security** controls

## 🛠️ Tech Stack

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **Redux Toolkit** for state management
- **NativeWind** (Tailwind CSS) for styling
- **React Native Reanimated** for animations
- **React Native Safe Area Context** for safe areas

### Backend Integration
- **RESTful API** integration with custom API client
- **JWT authentication** with HTTP-only cookies
- **Real-time features** via Pusher
- **File upload** via Cloudinary
- **Error handling** and retry mechanisms

### Development Tools
- **ESLint** and **Prettier** for code quality
- **TypeScript** for type checking
- **Expo CLI** for development and building

## 📱 App Structure

```
app/
├── components/          # Reusable UI components
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   ├── dashboard/     # Dashboard and home
│   ├── properties/    # Property-related screens
│   ├── matching/      # AI matching screens
│   ├── bookings/      # Booking screens
│   ├── notifications/ # Notification screens
│   └── profile/       # Profile and settings
├── navigation/        # Navigation configuration
├── store/            # Redux store and slices
├── services/         # API services
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
└── hooks/            # Custom React hooks
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-expo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

### Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://your-backend-url.com/api
EXPO_PUBLIC_SOCKET_URL=https://your-backend-url.com

# Pusher Configuration (for real-time features)
EXPO_PUBLIC_PUSHER_APP_ID=your_pusher_app_id
EXPO_PUBLIC_PUSHER_KEY=your_pusher_key
EXPO_PUBLIC_PUSHER_SECRET=your_pusher_secret
EXPO_PUBLIC_PUSHER_CLUSTER=eu

# Maps Configuration (optional)
EXPO_PUBLIC_MAPS_API_KEY=your_maps_api_key
```

## 🔧 Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run on web browser
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Code Style

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **NativeWind** for styling (Tailwind CSS classes)

### State Management

The app uses **Redux Toolkit** with the following slices:
- `authSlice` - Authentication and user state
- `propertiesSlice` - Property listings and search
- `matchesSlice` - AI matching results
- `bookingsSlice` - Booking management
- `notificationsSlice` - Notification system
- `uiSlice` - UI state and theme

## 📡 API Integration

### Authentication
- JWT-based authentication with HTTP-only cookies
- Automatic token refresh handling
- Session persistence across app restarts

### API Client
- Custom API client with error handling
- Request/response interceptors
- Retry mechanisms for failed requests
- File upload support

### Real-time Features
- Pusher integration for live updates
- WebSocket connections for chat
- Push notifications for important events

## 🎨 UI/UX Design

### Design System
- **Color Palette**: Primary `#6C63FF`, Secondary `#00C4B4`
- **Typography**: Inter font family
- **Components**: Consistent design patterns
- **Animations**: Smooth transitions with Reanimated

### Key Features
- **Responsive design** for different screen sizes
- **Dark mode support** (planned)
- **Accessibility** features
- **Loading states** and error handling
- **Pull-to-refresh** functionality

## 📱 Screens Overview

### Authentication
- **Login Screen** - Email/password authentication
- **Register Screen** - Multi-step registration with role selection
- **Onboarding Screen** - Welcome and app introduction

### Main App
- **Dashboard** - Personalized home screen with quick actions
- **Property Search** - Search and filter properties
- **AI Matching** - AI-powered recommendations
- **Bookings** - Manage property bookings
- **Profile** - User profile and settings

## 🔒 Security

- **JWT tokens** stored securely
- **HTTP-only cookies** for session management
- **Input validation** on all forms
- **Error handling** without exposing sensitive data
- **Secure API communication** with HTTPS

## 🚀 Deployment

### Building for Production

1. **Configure app.json** with your app details
2. **Build the app**:
   ```bash
   expo build:android  # For Android
   expo build:ios      # For iOS
   ```

3. **Submit to stores**:
   ```bash
   expo submit:android  # Google Play Store
   expo submit:ios      # App Store
   ```

### Environment Variables
- Use Expo's environment variable system
- Configure different environments (dev, staging, prod)
- Secure sensitive data with Expo's secret management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](docs/)
- Open an [issue](issues/)
- Contact the development team

## 🔄 Backend Integration

This app is designed to work with the **UniNest Server** backend. Make sure the backend is running and properly configured before testing the app.

### Backend Requirements
- Node.js server with Express
- MongoDB database
- JWT authentication
- File upload (Cloudinary)
- Real-time features (Pusher)

### API Endpoints
The app expects the following API endpoints:
- `/api/auth/*` - Authentication endpoints
- `/api/properties/*` - Property management
- `/api/matching/*` - AI matching system
- `/api/bookings/*` - Booking management
- `/api/notifications/*` - Notification system
- `/api/users/*` - User management

---

**Built with ❤️ for students and landlords** 