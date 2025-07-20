# UniNest API Documentation - Complete Overview

## Base URLs
- **Development:** `http://localhost:5000/api`
- **Production:** `https://uni-nest.vercel.app/api`

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [API Routes Overview](#api-routes-overview)
3. [Common Request/Response Patterns](#common-requestresponse-patterns)
4. [Error Handling](#error-handling)
5. [Real-time Features](#real-time-features)
6. [File Upload Guidelines](#file-upload-guidelines)
7. [Rate Limiting](#rate-limiting)
8. [Environment Variables](#environment-variables)
9. [Frontend Integration Examples](#frontend-integration-examples)

---

## Authentication & Authorization

### JWT Token Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **Student**: Basic user with booking and search capabilities
- **Landlord**: Can list properties and manage bookings
- **Admin**: Full system access and management capabilities

### Getting Authentication Token
```javascript
// Login request
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { token, user } = await response.json();
// Store token for subsequent requests
```

---

## API Routes Overview

### Authentication Routes (`/api/auth`)
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/register` | POST | User registration with profile image | No |
| `/login` | POST | User login | No |
| `/profile` | PUT | Update user profile | Yes |

### Property Routes (`/api/properties`)
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/properties` | GET | Get all properties (paginated) | No |
| `/properties` | POST | Create new property | Yes |
| `/properties/search` | GET | Enhanced property search with location | No |
| `/properties/:id` | GET | Get property details | No |
| `/properties/:id` | PUT | Update property | Yes (Owner) |
| `/properties/:id` | DELETE | Delete property | Yes (Owner) |
| `/properties/:id/rent` | PATCH | Mark as rented | Yes (Owner) |
| `/landlord/properties` | GET | Get landlord's properties | Yes |

### Location Routes (`/api/location`)
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/config` | GET | Get map configuration | No |
| `/geocode` | POST | Convert address to coordinates | No |
| `/reverse-geocode` | POST | Convert coordinates to address | No |
| `/distance` | POST | Calculate distance between points | No |
| `/nearby-pois` | POST | Find nearby points of interest | No |
| `/properties-in-radius` | POST | Find properties within radius | No |
| `/batch-geocode` | POST | Geocode multiple addresses | Yes |

### Booking Routes (`/api/booking`)
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | POST | Create new booking | Yes |
| `/user` | GET | Get user bookings | Yes |
| `/:id` | GET | Get booking details | Yes |
| `/:id/status` | PATCH | Update booking status | Yes |
| `/:id/payment` | POST | Process booking payment | Yes |
| `/:id` | DELETE | Cancel booking | Yes |

### Payment Routes (`/api/payments`)
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | POST | Initiate payment | Yes |
| `/` | GET | Get user payments | Yes |
| `/:id` | GET | Get payment details | Yes |
| `/:id/proof` | POST | Upload payment proof | Yes |
| `/instructions/:method` | GET | Get payment instructions | No |
| `/fees/calculate` | GET | Calculate payment fees | No |
| `/:id/verify` | PATCH | Verify payment (Admin) | Yes (Admin) |
| `/admin/dashboard` | GET | Payment dashboard (Admin) | Yes (Admin) |

### Message Routes (`/api/messages`)
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/send` | POST | Send message | Yes |
| `/:userId` | GET | Get conversation | Yes |
| `/messages/last/:userId/:recipientId` | GET | Get last message | Yes |

### Notification Routes (`/api/notifications`)
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | GET | Get user notifications | Yes |
| `/:id/read` | PATCH | Mark notification as read | Yes |
| `/read-all` | PATCH | Mark all as read | Yes |

### Matching Routes (`/api/matching`)
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | GET | Get user matches | Yes |
| `/generate/:type` | POST | Generate new recommendations | Yes |
| `/:id/status` | PATCH | Update match status | Yes |
| `/:id` | GET | Get match details | Yes |

### User Routes (`/api/users`)
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | GET | Get all users (Admin) | Yes (Admin) |
| `/me` | GET | Get my profile | Yes |
| `/:id` | GET | Get user by ID | Yes |
| `/:id` | PUT | Update user profile | Yes |
| `/chats` | GET | Get chat list | Yes |
| `/search` | GET | Search users | Yes |
| `/:id` | DELETE | Delete user (Admin) | Yes (Admin) |

### Roommate Routes (`/api/roommate`)
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/posts` | GET | Get roommate posts | No |
| `/posts` | POST | Create roommate post | Yes |
| `/posts/:id` | GET | Get post details | No |
| `/posts/:id` | PUT | Update post | Yes (Owner) |
| `/posts/:id` | DELETE | Delete post | Yes (Owner) |
| `/posts/:id/apply` | POST | Apply to roommate post | Yes |

### Review Routes (`/api/reviews`)
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/property/:propertyId` | GET | Get property reviews | No |
| `/property/:propertyId` | POST | Create property review | Yes |
| `/user/:userId` | GET | Get user reviews | No |
| `/:id` | PUT | Update review | Yes (Owner) |
| `/:id` | DELETE | Delete review | Yes (Owner/Admin) |

### Tenant Application Routes (`/api/tenant-applications`)
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | GET | Get applications | Yes |
| `/` | POST | Create application | Yes |
| `/:id` | GET | Get application details | Yes |
| `/:id` | PUT | Update application | Yes (Owner) |
| `/:id/status` | PATCH | Update application status | Yes |

---

## Common Request/Response Patterns

### Standard Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Optional success message"
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": "Additional error details (development only)"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Coordinate Format (GeoJSON)
Always use GeoJSON format for coordinates:
```json
{
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  }
}
```
**Note**: Longitude comes first, then latitude (opposite of typical lat/lng order)

---

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created successfully
- `400` - Bad request / Validation error
- `401` - Unauthorized / Invalid or missing token
- `403` - Forbidden / Insufficient permissions
- `404` - Resource not found
- `409` - Conflict / Duplicate resource
- `429` - Rate limit exceeded
- `500` - Internal server error

### Common Error Codes
- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Invalid or expired token
- `ACCESS_DENIED` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `DUPLICATE_ENTRY` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `PAYMENT_FAILED` - Payment processing error
- `FILE_UPLOAD_ERROR` - File upload failed

### Error Handling Example
```javascript
try {
  const response = await fetch('/api/properties', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const result = await response.json();
  
  if (!result.success) {
    switch (result.code) {
      case 'UNAUTHORIZED':
        // Redirect to login
        break;
      case 'RATE_LIMIT_EXCEEDED':
        // Show rate limit message
        break;
      default:
        // Show generic error
        alert(result.error);
    }
    return;
  }
  
  // Handle success
  console.log(result.data);
} catch (error) {
  console.error('Network error:', error);
}
```

---

## Real-time Features

### WebSocket Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: authToken }
});

// Join user's personal room
socket.emit('join', { userId: currentUserId });
```

### Available Events

#### Client → Server Events
```javascript
// Join user room
socket.emit('join', { userId: 'user_id' });

// Typing indicator
socket.emit('typing', { 
  receiverId: 'recipient_id',
  isTyping: true 
});

// Mark message as read
socket.emit('message_read', { 
  messageId: 'message_id' 
});
```

#### Server → Client Events
```javascript
// New message received
socket.on('new_message', (message) => {
  updateMessageList(message);
});

// New notification
socket.on('new_notification', (notification) => {
  showNotification(notification);
});

// User online status
socket.on('user_online', (user) => {
  updateUserStatus(user, 'online');
});

// User typing
socket.on('user_typing', ({ user, isTyping }) => {
  showTypingIndicator(user, isTyping);
});

// Booking status update
socket.on('booking_update', (booking) => {
  updateBookingStatus(booking);
});

// Match notification
socket.on('new_match', (match) => {
  showMatchNotification(match);
});
```

---

## File Upload Guidelines

### Supported File Types
- **Images**: JPG, PNG, WebP, GIF
- **Documents**: PDF, DOC, DOCX
- **Maximum Size**: 10MB per file

### Image Upload Endpoints
- Property images: `/api/properties` (max 5 images)
- Profile images: `/api/auth/profile` (single image)
- Payment proof: `/api/payments/:id/proof` (single image/PDF)

### Upload Example
```javascript
const uploadPropertyImages = async (propertyData, imageFiles) => {
  const formData = new FormData();
  
  // Add property data
  Object.keys(propertyData).forEach(key => {
    formData.append(key, propertyData[key]);
  });
  
  // Add image files
  imageFiles.forEach(file => {
    formData.append('images', file);
  });
  
  const response = await fetch('/api/properties', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};
```

### Image Optimization
All uploaded images are automatically:
- Compressed for optimal loading
- Resized to appropriate dimensions
- Served via Cloudinary CDN
- Available in multiple formats (WebP, JPG)

---

## Rate Limiting

### Limits by Endpoint Type
- **Authentication**: 5 requests per minute
- **File Upload**: 10 requests per minute
- **Geocoding**: 60 requests per hour
- **General API**: 100 requests per minute
- **Search**: 30 requests per minute

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641234567
```

### Handling Rate Limits
```javascript
const makeAPIRequest = async (url, options) => {
  const response = await fetch(url, options);
  
  if (response.status === 429) {
    const resetTime = response.headers.get('X-RateLimit-Reset');
    const waitTime = (resetTime * 1000) - Date.now();
    
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return makeAPIRequest(url, options);
  }
  
  return response;
};
```

---

## Environment Variables

### Required Variables
```bash
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URLS=http://localhost:3000,http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/uninest

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# Real-time Features
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster

# Optional: Custom Map Tiles
LEAFLET_TILE_SERVER=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
LEAFLET_ATTRIBUTION=© OpenStreetMap contributors

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## Frontend Integration Examples

### React Native Setup
```javascript
// API client setup
const API_BASE_URL = 'http://localhost:5000/api';

class APIClient {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, config);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }

    return result.data;
  }

  // Auth methods
  async login(email, password) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    this.setToken(result.token);
    return result;
  }

  // Property methods
  async getProperties(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/properties?${query}`);
  }

  async searchProperties(searchParams) {
    const query = new URLSearchParams(searchParams).toString();
    return this.request(`/properties/search?${query}`);
  }

  // Location methods
  async geocodeAddress(address) {
    return this.request('/location/geocode', {
      method: 'POST',
      body: JSON.stringify({ address })
    });
  }

  // Booking methods
  async createBooking(bookingData) {
    return this.request('/booking', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  // Message methods
  async sendMessage(receiverId, content) {
    return this.request('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content })
    });
  }
}

export default new APIClient();
```

### React Web Setup
```javascript
// Context for API management
import React, { createContext, useContext, useState } from 'react';

const APIContext = createContext();

export const useAPI = () => {
  const context = useContext(APIContext);
  if (!context) {
    throw new Error('useAPI must be used within APIProvider');
  }
  return context;
};

export const APIProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const api = {
    async request(endpoint, options = {}) {
      // Same implementation as React Native
    },

    async login(email, password) {
      const result = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      setToken(result.token);
      setUser(result.user);
      localStorage.setItem('token', result.token);
      return result;
    },

    logout() {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  return (
    <APIContext.Provider value={{ api, token, user }}>
      {children}
    </APIContext.Provider>
  );
};
```

### Map Integration
```javascript
// Leaflet Map Component
import L from 'leaflet';
import { useEffect, useRef } from 'react';

const MapComponent = ({ properties, onPropertyClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && properties) {
      addPropertyMarkers(properties);
    }
  }, [properties]);

  const initializeMap = async () => {
    // Get map configuration
    const response = await fetch('/api/location/config');
    const { config } = await response.json();

    // Initialize map
    const map = L.map(mapRef.current).setView(
      config.defaultView.center,
      config.defaultView.zoom
    );

    // Add tile layer
    L.tileLayer(config.tileLayer.url, {
      attribution: config.tileLayer.attribution,
      maxZoom: config.tileLayer.maxZoom
    }).addTo(map);

    mapInstanceRef.current = map;
  };

  const addPropertyMarkers = (properties) => {
    properties.forEach(property => {
      const marker = L.marker(property.location.coordinates.reverse())
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div>
            <h3>${property.title}</h3>
            <p>Price: ${property.price} MAD</p>
            <button onclick="window.selectProperty('${property._id}')">
              View Details
            </button>
          </div>
        `);
    });

    // Global function for marker clicks
    window.selectProperty = (propertyId) => {
      const property = properties.find(p => p._id === propertyId);
      if (property && onPropertyClick) {
        onPropertyClick(property);
      }
    };
  };

  return <div ref={mapRef} style={{ height: '400px', width: '100%' }} />;
};
```

---

## Testing Endpoints

### Using curl
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get properties with token
curl -X GET http://localhost:5000/api/properties \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search properties by location
curl -X GET "http://localhost:5000/api/properties/search?address=Casablanca&radius=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create property
curl -X POST http://localhost:5000/api/properties \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Test Property" \
  -F "description=Test Description" \
  -F "price=1000" \
  -F "maxTenants=3" \
  -F "utilitiesIncluded=true" \
  -F "distanceToUniversity=1.5" \
  -F "distanceToBusStop=0.5" \
  -F 'location={"type":"Point","coordinates":[-7.5898,33.5731]}'
```

### Using Postman Collection
Import the provided Postman collection for comprehensive API testing with pre-configured requests and environments.

---

## Support & Documentation

### Additional Resources
- **Leaflet Integration Guide**: `/docs/leaflet-integration.md`
- **Individual Route Documentation**: Available in `/docs/` folder
- **Postman Collection**: Available for import
- **Frontend Examples**: Complete React Native and React web examples

### Getting Help
For technical support or questions about the API:
1. Check this documentation first
2. Review the specific route documentation
3. Test with the provided examples
4. Contact the development team

This API documentation provides everything needed to integrate with the UniNest platform. All endpoints are production-ready and include comprehensive error handling, validation, and real-time features.
