# User Routes Documentation

## Base URL
- **Development:** `http://localhost:5000/api/users`
- **Production:** `https://uni-nest.vercel.app/api/users`

## Authentication
- **All routes require authentication**. Use a valid JWT token in the `Authorization` header: `Bearer <token>`

---

## Overview
User management system for profile operations, user discovery, chat list management, and admin user operations.

## Endpoints

### 1. **Get All Users (Admin)**
- **Endpoint**: `/`  
- **Method**: `GET`  
- **Description**: Get all users in the system (Admin only).
- **Headers**: 
  - `Authorization: Bearer <token>` (Admin token required)
- **Query Parameters**:
  | Parameter | Type | Description |
  |-----------|------|-------------|
  | `page` | `number` | Page number (default: 1) |
  | `limit` | `number` | Users per page (default: 20) |
  | `role` | `string` | Filter by role: `student`, `landlord`, `admin` |
  | `status` | `string` | Filter by status: `active`, `inactive`, `suspended` |
  | `search` | `string` | Search by name or email |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "users": [
        {
          "_id": "64f7b8c9d4e5f1234567890a",
          "firstName": "Youssef",
          "lastName": "El Mansouri",
          "email": "youssef@example.com",
          "phone": "+212600123456",
          "role": "student",
          "status": "active",
          "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile1.jpg",
          "createdAt": "2025-01-05T10:30:00.000Z",
          "lastLogin": "2025-01-10T09:15:00.000Z",
          "stats": {
            "propertiesListed": 0,
            "bookingsMade": 3,
            "messagesCount": 45
          }
        },
        {
          "_id": "64f7b8c9d4e5f1234567890b",
          "firstName": "Ahmed",
          "lastName": "Ben Ali",
          "email": "ahmed@example.com",
          "phone": "+212600654321",
          "role": "landlord",
          "status": "active",
          "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile2.jpg",
          "createdAt": "2025-01-03T14:20:00.000Z",
          "lastLogin": "2025-01-10T11:30:00.000Z",
          "stats": {
            "propertiesListed": 5,
            "bookingsReceived": 12,
            "rating": 4.7
          }
        }
      ],
      "pagination": {
        "total": 1250,
        "page": 1,
        "limit": 20,
        "totalPages": 63,
        "hasNext": true,
        "hasPrev": false
      },
      "summary": {
        "totalUsers": 1250,
        "activeUsers": 1180,
        "byRole": {
          "students": 980,
          "landlords": 260,
          "admins": 10
        },
        "newUsersThisMonth": 45
      }
    }
  }
  ```

---

### 2. **Get My Profile**
- **Endpoint**: `/me`  
- **Method**: `GET`  
- **Description**: Get the authenticated user's complete profile.
- **Headers**: 
  - `Authorization: Bearer <token>`

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "firstName": "Youssef",
      "lastName": "El Mansouri",
      "email": "youssef@example.com",
      "phone": "+212600123456",
      "cin": "BK123456",
      "address": "123 Rue Mohammed V, Casablanca",
      "dob": "1998-05-15",
      "gender": "Male",
      "role": "student",
      "status": "active",
      "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile1.jpg",
      "preferences": {
        "budget": {
          "min": 600,
          "max": 1200
        },
        "location": {
          "preferredAreas": ["Casablanca", "Rabat"],
          "maxCommuteTime": 30
        },
        "roomType": "shared",
        "amenities": {
          "wifi": true,
          "parking": false,
          "gym": true,
          "laundry": true
        },
        "lifestyle": {
          "smoking": false,
          "pets": false,
          "studyHabits": "quiet",
          "socialLevel": "moderate"
        }
      },
      "stats": {
        "propertiesLiked": 15,
        "bookingsMade": 3,
        "messagesCount": 45,
        "profileViews": 23,
        "matchScore": 0.78
      },
      "notifications": {
        "email": true,
        "push": true,
        "sms": false,
        "marketing": false
      },
      "privacy": {
        "showPhone": false,
        "showEmail": false,
        "profileVisibility": "public"
      },
      "verification": {
        "email": true,
        "phone": true,
        "identity": false
      },
      "createdAt": "2025-01-05T10:30:00.000Z",
      "updatedAt": "2025-01-10T09:15:00.000Z",
      "lastLogin": "2025-01-10T09:15:00.000Z"
    }
  }
  ```

---

### 3. **Get User by ID**
- **Endpoint**: `/:id`  
- **Method**: `GET`  
- **Description**: Get public profile information of a specific user.
- **Headers**: 
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `id` (string): User ID

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890b",
      "firstName": "Ahmed",
      "lastName": "Ben Ali",
      "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile2.jpg",
      "role": "landlord",
      "location": "Casablanca",
      "joinedDate": "2025-01-03T14:20:00.000Z",
      "publicStats": {
        "propertiesListed": 5,
        "rating": 4.7,
        "reviewsCount": 23,
        "responseRate": 95,
        "averageResponseTime": "2 hours"
      },
      "bio": "Experienced landlord providing quality student accommodation in Casablanca",
      "verification": {
        "email": true,
        "phone": true,
        "identity": true
      },
      "contact": {
        "showPhone": false,
        "showEmail": false,
        "canMessage": true
      },
      "recentProperties": [
        {
          "_id": "64f7b8c9d4e5f1234567890c",
          "title": "Modern Student Apartment",
          "price": 800,
          "images": ["https://res.cloudinary.com/uninest/image/upload/v1/properties/img1.jpg"]
        }
      ]
    }
  }
  ```

---

### 4. **Update User Profile**
- **Endpoint**: `/:id`  
- **Method**: `PUT`  
- **Description**: Update user profile. Users can only update their own profile.
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **URL Parameters**:
  - `id` (string): User ID (must match authenticated user)
- **Body Parameters** (all optional):
  | Field | Type | Description |
  |-------|------|-------------|
  | `firstName` | `string` | Updated first name |
  | `lastName` | `string` | Updated last name |
  | `phone` | `string` | Updated phone number |
  | `address` | `string` | Updated address |
  | `bio` | `string` | User bio/description |
  | `profileImage` | `file` | New profile image |
  | `preferences` | `object` | User preferences (JSON string) |
  | `notifications` | `object` | Notification settings |
  | `privacy` | `object` | Privacy settings |

- **Preferences Structure**:
  ```json
  {
    "budget": {
      "min": 600,
      "max": 1200
    },
    "location": {
      "preferredAreas": ["Casablanca", "Rabat"],
      "maxCommuteTime": 30
    },
    "roomType": "shared",
    "amenities": {
      "wifi": true,
      "parking": false,
      "gym": true
    },
    "lifestyle": {
      "smoking": false,
      "pets": false,
      "studyHabits": "quiet"
    }
  }
  ```

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "firstName": "Youssef Updated",
      "lastName": "El Mansouri",
      "email": "youssef@example.com",
      "phone": "+212600123456",
      "address": "Updated address",
      "bio": "Computer Science student looking for accommodation",
      "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile_updated.jpg",
      "preferences": {
        "budget": {
          "min": 700,
          "max": 1300
        }
      },
      "updatedAt": "2025-01-10T12:00:00.000Z"
    },
    "message": "Profile updated successfully"
  }
  ```

---

### 5. **Get Chat List**
- **Endpoint**: `/chats`  
- **Method**: `GET`  
- **Description**: Get list of users with recent chat history.
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  | Parameter | Type | Description |
  |-----------|------|-------------|
  | `limit` | `number` | Number of chats to return (default: 20) |
  | `unreadOnly` | `boolean` | Show only chats with unread messages |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "user": {
          "_id": "64f7b8c9d4e5f1234567890b",
          "firstName": "Ahmed",
          "lastName": "Ben Ali",
          "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile2.jpg",
          "role": "landlord",
          "isOnline": true,
          "lastSeen": "2025-01-10T11:45:00.000Z"
        },
        "lastMessage": {
          "_id": "64f7b8c9d4e5f1234567890c",
          "content": "Thank you for your interest in the apartment",
          "senderId": "64f7b8c9d4e5f1234567890b",
          "createdAt": "2025-01-10T11:30:00.000Z",
          "isRead": false
        },
        "unreadCount": 2,
        "lastMessageAt": "2025-01-10T11:30:00.000Z",
        "conversationType": "property_inquiry",
        "relatedProperty": {
          "_id": "64f7b8c9d4e5f1234567890d",
          "title": "Modern Student Apartment"
        }
      },
      {
        "user": {
          "_id": "64f7b8c9d4e5f1234567890e",
          "firstName": "Sara",
          "lastName": "Alami",
          "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile3.jpg",
          "role": "student",
          "isOnline": false,
          "lastSeen": "2025-01-10T10:20:00.000Z"
        },
        "lastMessage": {
          "_id": "64f7b8c9d4e5f1234567890f",
          "content": "Are you still looking for a roommate?",
          "senderId": "64f7b8c9d4e5f1234567890e",
          "createdAt": "2025-01-10T09:15:00.000Z",
          "isRead": true
        },
        "unreadCount": 0,
        "lastMessageAt": "2025-01-10T09:15:00.000Z",
        "conversationType": "roommate_inquiry"
      }
    ],
    "summary": {
      "totalChats": 8,
      "unreadChats": 3,
      "totalUnreadMessages": 7
    }
  }
  ```

---

### 6. **Search Users by Name**
- **Endpoint**: `/search`  
- **Method**: `GET`  
- **Description**: Search for users by name or email.
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `q` | `string` | Yes | Search query (name or email) |
  | `role` | `string` | No | Filter by role: `student`, `landlord` |
  | `limit` | `number` | No | Number of results (default: 10) |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "64f7b8c9d4e5f1234567890a",
        "firstName": "Youssef",
        "lastName": "El Mansouri",
        "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile1.jpg",
        "role": "student",
        "location": "Casablanca",
        "verification": {
          "email": true,
          "phone": true
        },
        "matchScore": 0.85,
        "mutualConnections": 3
      },
      {
        "_id": "64f7b8c9d4e5f1234567890b",
        "firstName": "Ahmed",
        "lastName": "Ben Ali",
        "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile2.jpg",
        "role": "landlord",
        "location": "Casablanca",
        "rating": 4.7,
        "verification": {
          "email": true,
          "phone": true,
          "identity": true
        }
      }
    ],
    "totalResults": 15,
    "hasMore": true
  }
  ```

---

### 7. **Delete User (Admin)**
- **Endpoint**: `/:id`  
- **Method**: `DELETE`  
- **Description**: Delete a user account (Admin only).
- **Headers**: 
  - `Authorization: Bearer <token>` (Admin token required)
- **URL Parameters**:
  - `id` (string): User ID to delete
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `reason` | `string` | Yes | Reason for account deletion |
  | `notifyUser` | `boolean` | No | Send deletion notification (default: true) |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "message": "User account deleted successfully",
    "data": {
      "deletedUserId": "64f7b8c9d4e5f1234567890a",
      "deletedAt": "2025-01-10T12:00:00.000Z",
      "reason": "Violation of terms of service",
      "deletedBy": "admin@uninest.com",
      "dataRetention": {
        "anonymized": true,
        "retentionPeriod": "90 days",
        "backupCreated": true
      }
    }
  }
  ```

---

## User Roles & Permissions

### Student Role
- Create and manage bookings
- Search and like properties
- Message landlords and other students
- Update own profile and preferences
- View match recommendations

### Landlord Role
- List and manage properties
- Receive and manage booking requests
- Message students
- View property analytics
- Manage payments and reviews

### Admin Role
- Full system access
- User management (view, suspend, delete)
- Payment verification
- System analytics
- Content moderation

## Profile Privacy Settings

### Visibility Levels:
- **Public**: Profile visible to all users
- **Private**: Profile visible only to matched users
- **Hidden**: Profile not discoverable in search

### Contact Preferences:
- **Show Phone**: Display phone number on profile
- **Show Email**: Display email on profile
- **Allow Messages**: Accept messages from other users
- **Show Online Status**: Display online/offline status

## Frontend Integration Examples

### React Native Integration
```javascript
const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setUser(result.data);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  };

  const updateProfile = async (formData) => {
    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        setUser(result.data);
        setIsEditing(false);
        showSuccessMessage('Profile updated successfully');
      }
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  const searchUsers = async (query) => {
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Search users error:', error);
      return [];
    }
  };

  return (
    <View style={styles.container}>
      {user && (
        <UserProfile 
          user={user}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={updateProfile}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </View>
  );
};
```

### Chat List Component
```javascript
const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchChatList();
    initializeSocket();
  }, []);

  const fetchChatList = async () => {
    try {
      const response = await fetch('/api/users/chats', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setChats(result.data);
      }
    } catch (error) {
      console.error('Fetch chats error:', error);
    }
  };

  const initializeSocket = () => {
    const newSocket = io('http://localhost:5000', {
      auth: { token: authToken }
    });

    newSocket.on('new_message', (message) => {
      updateChatList(message);
    });

    setSocket(newSocket);
  };

  const updateChatList = (newMessage) => {
    setChats(prevChats => {
      const updatedChats = [...prevChats];
      const chatIndex = updatedChats.findIndex(
        chat => chat.user._id === newMessage.senderId
      );

      if (chatIndex !== -1) {
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          lastMessage: newMessage,
          unreadCount: updatedChats[chatIndex].unreadCount + 1,
          lastMessageAt: newMessage.createdAt
        };
        
        // Move to top
        const [updatedChat] = updatedChats.splice(chatIndex, 1);
        updatedChats.unshift(updatedChat);
      }

      return updatedChats;
    });
  };

  return (
    <FlatList
      data={chats}
      keyExtractor={item => item.user._id}
      renderItem={({ item }) => (
        <ChatListItem 
          chat={item}
          onPress={() => navigateToChat(item.user._id)}
        />
      )}
    />
  );
};
```

## Error Responses

### Common Errors:
```json
{
  "success": false,
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

```json
{
  "success": false,
  "error": "Cannot access other user's private profile",
  "code": "ACCESS_DENIED"
}
```

```json
{
  "success": false,
  "error": "Email already exists",
  "code": "DUPLICATE_EMAIL"
}
```

### Status Codes:
- `200` - Success
- `400` - Bad request / Validation error
- `401` - Unauthorized / Invalid token
- `403` - Forbidden / Insufficient permissions
- `404` - User not found
- `409` - Conflict / Duplicate data
- `500` - Internal server error
