# Match & Settle API v2.0 Documentation

## Overview
Match & Settle is an AI-powered student housing and roommate matching platform that helps students find suitable accommodation and compatible roommates through intelligent matching algorithms.

## Architecture

### Core Features
- **Authentication System** - User registration, login, and profile management
- **Property Management** - Property listing, search, and management
- **AI Matching System** - Intelligent property and roommate recommendations
- **Booking System** - Complete booking workflow with roommate integration
- **Payment Processing** - Local payment methods with proof verification
- **Location Services** - Geographic search and location-based features
- **Notification System** - Real-time notifications for all user interactions
- **User Management** - Comprehensive user profile and role management

### Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies
- **File Storage**: Cloudinary for images
- **Real-time**: Pusher for notifications
- **Geocoding**: OpenStreetMap/Nominatim
- **AI/ML**: Custom matching algorithms

## API Endpoints

### Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://uni-nest.vercel.app`

### Available Routes
| Route | Description | Documentation |
|-------|-------------|---------------|
| `/api/auth` | Authentication endpoints | [Auth Routes](./authRoutes.md) |
| `/api/users` | User management | [User Routes](./userRoutes.md) |
| `/api/properties` | Property management | [Property Routes](./propertyRoutes.md) |
| `/api/matching` | AI matching system | [Matching Routes](./matchingRoutes.md) |
| `/api/bookings` | Booking management | [Booking Routes](./bookingRoutes.md) |
| `/api/payments` | Payment processing | [Payment Routes](./paymentRoutes.md) |
| `/api/notifications` | Notification system | [Notification Routes](./notificationRoutes.md) |
| `/api/location` | Location services | [Location Routes](./locationRoutes.md) |

## Data Models
| Model | Description | Documentation |
|-------|-------------|---------------|
| User | User profiles with roles | [User Model](./models/User.md) |
| Property | Property listings | [Property Model](./models/Property.md) |
| Booking | Booking records | [Booking Model](./models/Booking.md) |
| Payment | Payment transactions | [Payment Model](./models/Payment.md) |
| Matching | AI matching records | [Matching Model](./models/Matching.md) |
| Notification | User notifications | [Notification Model](./models/Notification.md) |
| Analytics | System analytics | [Analytics Model](./models/Analytics.md) |

## Authentication
All protected routes require a JWT token. The token can be provided via:
- HTTP-only cookie (recommended)
- Authorization header: `Bearer <token>`

## Error Handling
All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

## Rate Limiting
- 1000 requests per 15 minutes per IP
- Additional rate limiting may apply to specific endpoints

## File Uploads
- Maximum file size: 10MB
- Supported formats: JPG, PNG, WebP
- Images are automatically optimized and stored in Cloudinary

## Real-time Features
- Push notifications via Pusher
- Real-time booking updates
- Live notification delivery

## Security Features
- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- Password hashing with bcrypt
- JWT token expiration

## Environment Variables
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/uninest
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
```

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`
5. For tunnel mode: `npm run dev:tunnel`

## Health Check
Check API status at `/health` endpoint for monitoring and debugging.
