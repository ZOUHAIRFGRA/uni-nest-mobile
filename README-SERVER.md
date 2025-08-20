# Match & Settle API - Enhanced Version 2.0

AI-Powered Student Housing & Roommate Matching Platform API

## 🚀 What's New in Version 2.0

### Major Enhancements
- **AI-Powered Matching**: Intelligent property and roommate recommendations
- **Real-time Pusher Integration**: Replaced Socket.IO with Pusher for scalable real-time features
- **Advanced User Profiles**: Enhanced with lifestyle preferences and personality scoring
- **Smart Notifications**: Contextual, real-time notifications system
- **Booking System**: Complete booking and payment flow
- **Analytics & Insights**: Track user behavior and matching effectiveness
- **Security Improvements**: Rate limiting, helmet security, input validation
- **SaaS Ready**: Subscription tiers and premium features support

### New Features
1. **AI Matching Engine**: Advanced algorithms for compatibility scoring
2. **Real-time Notifications**: Instant updates via Pusher
3. **Smart Booking System**: Streamlined property booking with payment integration
4. **Personality-based Matching**: Big Five personality model integration
5. **Advanced Analytics**: User behavior and platform insights
6. **Enhanced Security**: Modern security practices and rate limiting

## 📁 Project Structure

```
server/
├── config/
│   ├── db.js                 # MongoDB connection
│   ├── pusher.js            # Pusher real-time configuration
│   └── cloudinary.js        # Image upload configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User management
│   ├── propertyController.js # Property management
│   ├── matchingController.js # AI matching system
│   ├── bookingController.js  # Booking system
│   └── notificationController.js # Notifications
├── models/
│   ├── User.js              # Enhanced user model with AI profile
│   ├── Property.js          # Property model
│   ├── Matching.js          # AI matching records
│   ├── Booking.js           # Booking system
│   ├── Notification.js      # Notification system
│   ├── Chat.js              # Chat system
│   └── Analytics.js         # Analytics tracking
├── services/
│   ├── matchingService.js   # AI matching algorithms
│   └── notificationService.js # Notification management
├── utils/
│   ├── aiMatching.js        # AI compatibility algorithms
│   └── matching.js          # Legacy matching utilities
├── middleware/
│   ├── authMiddleware.js    # JWT authentication
│   ├── adminMiddleware.js   # Admin authorization
│   └── uploadMiddleware.js  # File upload handling
└── routes/
    ├── auth.js              # Authentication routes
    ├── user.js              # User management routes
    ├── property.js          # Property routes
    ├── matching.js          # AI matching routes
    ├── booking.js           # Booking routes
    └── notification.js      # Notification routes
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Pusher account
- Cloudinary account (for image uploads)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd UniNest/server
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration values
```

4. **Database Setup**
```bash
# Make sure MongoDB is running
# The application will create necessary collections automatically
```

5. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start

# Run tests
npm test
```

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `PUSHER_APP_ID` | Pusher app ID | ✅ |
| `PUSHER_KEY` | Pusher key | ✅ |
| `PUSHER_SECRET` | Pusher secret | ✅ |
| `PUSHER_CLUSTER` | Pusher cluster | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `LOCAL_PAYMENT_METHODS` | WafaCash,CashPlus,Bank Transfer,Cash | ✅ |
| `BANK_ACCOUNT_NUMBER` | Bank account for transfers | ⚠️ |
| `BANK_RIB` | Bank RIB number | ⚠️ |
| `LEAFLET_TILE_SERVER` | Custom tile server URL (optional) | ⚠️ |
| `LEAFLET_ATTRIBUTION` | Map attribution text | ⚠️ |

✅ = Required, ⚠️ = Optional but recommended

### Pusher Setup

1. Create a Pusher account at [pusher.com](https://pusher.com)
2. Create a new app
3. Get your app credentials from the dashboard
4. Add them to your `.env` file

### Cloudinary Setup

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name and API credentials
3. Add them to your `.env` file

### Local Payment Methods Setup

The platform supports Moroccan payment methods:

1. **WafaCash** - Mobile money transfer service
2. **CashPlus** - Mobile money transfer service  
3. **Bank Transfer** - Traditional bank transfers with RIB
4. **Cash** - Direct cash payments with receipts

Configure your payment details in `.env`:
```bash
BANK_ACCOUNT_NUMBER=your-bank-account
BANK_RIB=your-rib-number
BANK_NAME=your-bank-name
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/preferences` - Update user preferences
- `POST /api/users/personality` - Update personality profile

### Properties
- `GET /api/properties` - Get properties (with filters)
- `POST /api/properties` - Create property (Landlord only)
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### AI Matching
- `GET /api/matching` - Get user matches
- `POST /api/matching/generate/:type` - Generate new recommendations
- `PATCH /api/matching/:id/status` - Update match status
- `GET /api/matching/:id` - Get match details

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/payment` - Process local payment

### Payments (Local Methods)
- `POST /api/payments` - Initiate payment
- `POST /api/payments/:id/proof` - Upload payment proof
- `GET /api/payments/:id` - Get payment details
- `GET /api/payments` - Get user payments
- `GET /api/payments/instructions/:method` - Get payment instructions
- `GET /api/payments/fees/calculate` - Calculate fees
- `PATCH /api/payments/:id/verify` - Verify payment (Admin)
- `GET /api/payments/admin/dashboard` - Admin payment dashboard

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read

### Real-time Events (Pusher)
- `user-{userId}` - User-specific notifications
- `chat-{chatId}` - Chat messages
- `property-{propertyId}` - Property updates
- `admin-channel` - Admin notifications

## 🧠 AI Matching System

### Property Recommendations
The AI considers:
- **Budget compatibility** (30% weight)
- **Location preferences** (25% weight)
- **Amenities match** (20% weight)
- **Room type preferences** (15% weight)
- **University distance** (10% weight)

### Roommate Matching
The AI analyzes:
- **Lifestyle compatibility** (40% weight)
- **Budget alignment** (25% weight)
- **Personality traits** (20% weight)
- **Study habits** (15% weight)

### Compatibility Scoring
- Uses Big Five personality model
- Lifestyle preference analysis
- Budget and location matching
- Machine learning for continuous improvement

## 📱 Real-time Features

### Pusher Channels
- **Private channels** for user-specific data
- **Presence channels** for chat systems
- **Public channels** for general updates

### Event Types
- `new-notification` - New notification received
- `matching-update` - New matches available
- `message-received` - New chat message
- `booking-update` - Booking status changed
- `property-update` - Property information updated

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Rate Limiting** to prevent abuse
- **Helmet.js** for security headers
- **Input Validation** with express-validator
- **CORS Configuration** for cross-origin requests
- **Password Hashing** with bcrypt

## 📊 Analytics & Monitoring

### Tracked Events
- User interactions (views, likes, contacts)
- Matching effectiveness
- Booking conversions
- Search patterns
- Performance metrics

### Health Monitoring
- `GET /health` - Health check endpoint
- Uptime monitoring
- Database connection status
- Performance metrics

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set up Pusher production app
- [ ] Configure Cloudinary production environment
- [ ] Set up Stripe production keys
- [ ] Configure email service
- [ ] Set up monitoring and logging
- [ ] Configure domain and SSL

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 API Documentation

For detailed API documentation, start the server and visit:
- Development: `http://localhost:5000`
- Health check: `http://localhost:5000/health`
- in Prod : `https://uni-nest-api.vercel.app/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run tests and ensure they pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Match & Settle** - Revolutionizing student housing with AI-powered matching! 🏠🤖
