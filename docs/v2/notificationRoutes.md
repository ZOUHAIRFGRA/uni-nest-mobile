# Notification Routes Documentation

## Base URL
- **Development:** `http://localhost:5000/api/notifications`
- **Production:** `https://uni-nest.vercel.app/api/notifications`

## Authentication
- **All routes require authentication**. Use a valid JWT token in the `Authorization` header: `Bearer <token>`

---

## Overview
Comprehensive notification system for keeping users informed about messages, booking updates, match recommendations, and system announcements with real-time push notification support.

## Endpoints

### 1. **Get User Notifications**
- **Endpoint**: `/`  
- **Method**: `GET`  
- **Description**: Get all notifications for the authenticated user.
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  | Parameter | Type | Description |
  |-----------|------|-------------|
  | `page` | `number` | Page number (default: 1) |
  | `limit` | `number` | Notifications per page (default: 20) |
  | `unreadOnly` | `boolean` | Show only unread notifications |
  | `type` | `string` | Filter by type: `message`, `booking`, `match`, `system`, `payment` |
  | `priority` | `string` | Filter by priority: `low`, `medium`, `high`, `urgent` |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "notifications": [
        {
          "_id": "64f7b8c9d4e5f1234567890a",
          "userId": "64f7b8c9d4e5f1234567890b",
          "type": "message",
          "title": "New message from Ahmed Ben Ali",
          "message": "You have received a new message about your property inquiry",
          "priority": "medium",
          "isRead": false,
          "data": {
            "senderId": "64f7b8c9d4e5f1234567890c",
            "messageId": "64f7b8c9d4e5f1234567890d",
            "propertyId": "64f7b8c9d4e5f1234567890e"
          },
          "actionUrl": "/messages/64f7b8c9d4e5f1234567890c",
          "icon": "message",
          "createdAt": "2025-01-10T10:30:00.000Z",
          "sender": {
            "firstName": "Ahmed",
            "lastName": "Ben Ali",
            "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile1.jpg"
          }
        },
        {
          "_id": "64f7b8c9d4e5f1234567890f",
          "userId": "64f7b8c9d4e5f1234567890b",
          "type": "booking",
          "title": "Booking Confirmed",
          "message": "Your booking for 'Modern Student Apartment' has been confirmed",
          "priority": "high",
          "isRead": false,
          "data": {
            "bookingId": "64f7b8c9d4e5f1234567890g",
            "propertyId": "64f7b8c9d4e5f1234567890e",
            "startDate": "2025-02-01",
            "endDate": "2025-07-31"
          },
          "actionUrl": "/bookings/64f7b8c9d4e5f1234567890g",
          "icon": "booking-confirmed",
          "createdAt": "2025-01-10T09:45:00.000Z"
        },
        {
          "_id": "64f7b8c9d4e5f1234567890h",
          "userId": "64f7b8c9d4e5f1234567890b",
          "type": "match",
          "title": "New Perfect Match Found!",
          "message": "We found 3 new properties that match your preferences",
          "priority": "medium",
          "isRead": true,
          "readAt": "2025-01-10T08:30:00.000Z",
          "data": {
            "matchCount": 3,
            "averageScore": 0.87,
            "topMatchId": "64f7b8c9d4e5f1234567890i"
          },
          "actionUrl": "/matches",
          "icon": "heart",
          "createdAt": "2025-01-10T08:00:00.000Z"
        }
      ],
      "pagination": {
        "total": 45,
        "page": 1,
        "limit": 20,
        "totalPages": 3,
        "hasNext": true,
        "hasPrev": false
      },
      "summary": {
        "unreadCount": 12,
        "totalCount": 45,
        "byType": {
          "message": 15,
          "booking": 8,
          "match": 12,
          "system": 5,
          "payment": 5
        },
        "byPriority": {
          "urgent": 2,
          "high": 8,
          "medium": 25,
          "low": 10
        }
      }
    }
  }
  ```

---

### 2. **Mark Notification as Read**
- **Endpoint**: `/:id/read`  
- **Method**: `PATCH`  
- **Description**: Mark a specific notification as read.
- **Headers**: 
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `id` (string): Notification ID

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "isRead": true,
      "readAt": "2025-01-10T11:00:00.000Z"
    },
    "message": "Notification marked as read"
  }
  ```

---

### 3. **Mark All Notifications as Read**
- **Endpoint**: `/read-all`  
- **Method**: `PATCH`  
- **Description**: Mark all notifications as read for the authenticated user.
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Body Parameters** (optional):
  | Field | Type | Description |
  |-------|------|-------------|
  | `type` | `string` | Mark only specific type: `message`, `booking`, `match`, `system`, `payment` |
  | `before` | `string` | Mark as read only notifications before this date (ISO format) |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "updatedCount": 12,
      "readAt": "2025-01-10T11:00:00.000Z"
    },
    "message": "All notifications marked as read"
  }
  ```

---

## Notification Types & Templates

### Message Notifications
```json
{
  "type": "message",
  "title": "New message from {senderName}",
  "message": "You have received a new message",
  "data": {
    "senderId": "user_id",
    "messageId": "message_id",
    "messagePreview": "Hi, I'm interested in..."
  },
  "actionUrl": "/messages/{senderId}",
  "icon": "message"
}
```

### Booking Notifications
```json
{
  "type": "booking",
  "title": "Booking Status Update",
  "variants": {
    "confirmed": {
      "title": "Booking Confirmed",
      "message": "Your booking for '{propertyTitle}' has been confirmed",
      "icon": "booking-confirmed",
      "priority": "high"
    },
    "cancelled": {
      "title": "Booking Cancelled",
      "message": "Your booking has been cancelled",
      "icon": "booking-cancelled",
      "priority": "high"
    },
    "payment_due": {
      "title": "Payment Due",
      "message": "Your payment for booking is due in 24 hours",
      "icon": "payment-due",
      "priority": "urgent"
    }
  }
}
```

### Match Notifications
```json
{
  "type": "match",
  "title": "New Matches Found",
  "variants": {
    "new_matches": {
      "title": "New Perfect Matches Found!",
      "message": "We found {count} new properties that match your preferences",
      "icon": "heart"
    },
    "improved_match": {
      "title": "Better Match Available",
      "message": "We found a property with {score}% compatibility",
      "icon": "trending-up"
    }
  }
}
```

### Payment Notifications
```json
{
  "type": "payment",
  "variants": {
    "payment_received": {
      "title": "Payment Received",
      "message": "Payment of {amount} MAD has been received",
      "icon": "payment-success",
      "priority": "medium"
    },
    "payment_failed": {
      "title": "Payment Failed",
      "message": "Your payment could not be processed",
      "icon": "payment-failed",
      "priority": "high"
    },
    "refund_processed": {
      "title": "Refund Processed",
      "message": "Your refund of {amount} MAD has been processed",
      "icon": "refund",
      "priority": "medium"
    }
  }
}
```

### System Notifications
```json
{
  "type": "system",
  "variants": {
    "maintenance": {
      "title": "Scheduled Maintenance",
      "message": "System will be under maintenance from {startTime} to {endTime}",
      "icon": "maintenance",
      "priority": "medium"
    },
    "feature_update": {
      "title": "New Features Available",
      "message": "Check out our latest features and improvements",
      "icon": "star",
      "priority": "low"
    },
    "security_alert": {
      "title": "Security Alert",
      "message": "Suspicious login attempt detected",
      "icon": "shield-alert",
      "priority": "urgent"
    }
  }
}
```

## Real-time Push Notifications

### WebSocket Integration
```javascript
// Client-side socket setup
socket.on('new_notification', (notification) => {
  // Update notification count
  updateNotificationBadge(notification);
  
  // Show in-app notification
  showInAppNotification(notification);
  
  // Show push notification if permission granted
  if (Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: getNotificationIcon(notification.icon),
      tag: notification._id
    });
  }
});

socket.on('notification_read', (notificationId) => {
  // Update UI to reflect read status
  markNotificationAsReadInUI(notificationId);
});
```

### Push Notification Setup
```javascript
// Request notification permission
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Service Worker for background notifications
self.addEventListener('push', function(event) {
  if (event.data) {
    const notification = event.data.json();
    
    const options = {
      body: notification.message,
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png',
      data: {
        url: notification.actionUrl,
        notificationId: notification._id
      },
      actions: [
        {
          action: 'view',
          title: 'View'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(notification.title, options)
    );
  }
});
```

## Frontend Integration Examples

### React Native Integration
```javascript
import PushNotification from 'react-native-push-notification';
import { useEffect, useState } from 'react';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    setupPushNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data.notifications);
        setUnreadCount(result.data.summary.unreadCount);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  };

  const setupPushNotifications = () => {
    PushNotification.configure({
      onNotification: function(notification) {
        if (notification.userInteraction) {
          // Handle notification tap
          if (notification.data?.actionUrl) {
            navigateToScreen(notification.data.actionUrl);
          }
        }
      },
      requestPermissions: Platform.OS === 'ios'
    });
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          isRead: true, 
          readAt: new Date() 
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Notifications {unreadCount > 0 && `(${unreadCount})`}
      </Text>
      
      {unreadCount > 0 && (
        <TouchableOpacity onPress={markAllAsRead}>
          <Text>Mark All as Read</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <NotificationItem 
            notification={item}
            onPress={() => markAsRead(item._id)}
          />
        )}
      />
    </View>
  );
};
```

### React Web Integration
```javascript
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    initializeSocket();
    requestNotificationPermission();
  }, []);

  const initializeSocket = () => {
    const newSocket = io('http://localhost:5000', {
      auth: { token: authToken }
    });

    newSocket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      showNotification(notification);
    });

    setSocket(newSocket);
  };

  const showNotification = (notification) => {
    // Show toast notification
    toast(notification.message, {
      type: getPriorityType(notification.priority),
      onClick: () => navigateToUrl(notification.actionUrl)
    });

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: getNotificationIcon(notification.icon)
      });

      browserNotif.onclick = () => {
        window.focus();
        navigateToUrl(notification.actionUrl);
        browserNotif.close();
      };
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, socket }}>
      {children}
    </NotificationContext.Provider>
  );
};
```

## Error Responses

### Common Errors:
```json
{
  "success": false,
  "error": "Notification not found",
  "code": "NOTIFICATION_NOT_FOUND"
}
```

```json
{
  "success": false,
  "error": "Notification already read",
  "code": "ALREADY_READ"
}
```

### Status Codes:
- `200` - Success
- `400` - Bad request / Invalid parameters
- `401` - Unauthorized / Invalid token
- `403` - Forbidden / Access denied
- `404` - Notification not found
- `500` - Internal server error
