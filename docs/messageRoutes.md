# Message Routes Documentation

## Base URL
- **Development:** `http://localhost:5000/api/messages`
- **Production:** `https://uni-nest.vercel.app/api/messages`

## Authentication
- **All routes require authentication**. Use a valid JWT token in the `Authorization` header: `Bearer <token>`

---

## Overview
Real-time messaging system for communication between students, landlords, and roommates with support for text messages, media sharing, and read receipts.

## Endpoints

### 1. **Send Message**
- **Endpoint**: `/send`  
- **Method**: `POST`  
- **Description**: Send a message to another user.
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `receiverId` | `string` | Yes | ID of the message recipient |
  | `content` | `string` | Yes | Message content |
  | `messageType` | `string` | No | Message type: `text`, `image`, `file` (default: text) |
  | `relatedProperty` | `string` | No | Property ID if message is property-related |
  | `attachments` | `array` | No | Array of attachment URLs |

- **Response** (201 - Created):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "senderId": "64f7b8c9d4e5f1234567890b",
      "receiverId": "64f7b8c9d4e5f1234567890c",
      "content": "Hi, I'm interested in your apartment listing",
      "messageType": "text",
      "relatedProperty": "64f7b8c9d4e5f1234567890d",
      "status": "sent",
      "createdAt": "2025-01-10T10:30:00.000Z",
      "sender": {
        "firstName": "Youssef",
        "lastName": "El Mansouri",
        "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile1.jpg"
      },
      "receiver": {
        "firstName": "Ahmed",
        "lastName": "Ben Ali",
        "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile2.jpg"
      }
    }
  }
  ```

---

### 2. **Get Messages Between Users**
- **Endpoint**: `/:userId`  
- **Method**: `GET`  
- **Description**: Get conversation history between authenticated user and specified user.
- **Headers**: 
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `userId` (string): ID of the other user in conversation
- **Query Parameters**:
  | Parameter | Type | Description |
  |-----------|------|-------------|
  | `page` | `number` | Page number (default: 1) |
  | `limit` | `number` | Messages per page (default: 50) |
  | `before` | `string` | Get messages before this message ID |
  | `after` | `string` | Get messages after this message ID |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "messages": [
        {
          "_id": "64f7b8c9d4e5f1234567890a",
          "senderId": "64f7b8c9d4e5f1234567890b",
          "receiverId": "64f7b8c9d4e5f1234567890c",
          "content": "Hi, I'm interested in your apartment listing",
          "messageType": "text",
          "relatedProperty": {
            "_id": "64f7b8c9d4e5f1234567890d",
            "title": "Modern Student Apartment",
            "images": ["https://res.cloudinary.com/uninest/image/upload/v1/properties/img1.jpg"]
          },
          "status": "read",
          "readAt": "2025-01-10T10:45:00.000Z",
          "createdAt": "2025-01-10T10:30:00.000Z",
          "sender": {
            "firstName": "Youssef",
            "lastName": "El Mansouri",
            "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile1.jpg"
          }
        },
        {
          "_id": "64f7b8c9d4e5f1234567890e",
          "senderId": "64f7b8c9d4e5f1234567890c",
          "receiverId": "64f7b8c9d4e5f1234567890b",
          "content": "Thank you for your interest! The apartment is still available.",
          "messageType": "text",
          "relatedProperty": "64f7b8c9d4e5f1234567890d",
          "status": "delivered",
          "createdAt": "2025-01-10T10:32:00.000Z",
          "sender": {
            "firstName": "Ahmed",
            "lastName": "Ben Ali",
            "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile2.jpg"
          }
        }
      ],
      "pagination": {
        "total": 15,
        "page": 1,
        "limit": 50,
        "totalPages": 1,
        "hasNext": false,
        "hasPrev": false
      },
      "conversationInfo": {
        "otherUser": {
          "_id": "64f7b8c9d4e5f1234567890c",
          "firstName": "Ahmed",
          "lastName": "Ben Ali",
          "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile2.jpg",
          "lastSeen": "2025-01-10T10:45:00.000Z",
          "isOnline": true
        },
        "lastMessageAt": "2025-01-10T10:32:00.000Z",
        "unreadCount": 2
      }
    }
  }
  ```

---

### 3. **Get Last Message**
- **Endpoint**: `/messages/last/:userId/:recipientId`  
- **Method**: `GET`  
- **Description**: Get the last message between two specific users.
- **Headers**: 
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `userId` (string): First user ID
  - `recipientId` (string): Second user ID

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890e",
      "senderId": "64f7b8c9d4e5f1234567890c",
      "receiverId": "64f7b8c9d4e5f1234567890b",
      "content": "Thank you for your interest! The apartment is still available.",
      "messageType": "text",
      "status": "delivered",
      "createdAt": "2025-01-10T10:32:00.000Z",
      "sender": {
        "firstName": "Ahmed",
        "lastName": "Ben Ali",
        "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile2.jpg"
      },
      "isFromCurrentUser": false
    }
  }
  ```

---

## Real-time Features

### WebSocket Events
The messaging system supports real-time communication through WebSocket/Socket.IO:

#### Client Events (Send to Server):
```javascript
// Join user's personal room
socket.emit('join', { userId: 'user_id' });

// Send typing indicator
socket.emit('typing', { 
  receiverId: 'recipient_id',
  isTyping: true 
});

// Mark message as read
socket.emit('message_read', { 
  messageId: 'message_id',
  conversationId: 'conversation_id' 
});
```

#### Server Events (Receive from Server):
```javascript
// New message received
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Message status updated
socket.on('message_status', (update) => {
  console.log('Message status:', update);
});

// User typing indicator
socket.on('user_typing', (data) => {
  console.log(`${data.user.firstName} is typing...`);
});

// User online status
socket.on('user_online', (data) => {
  console.log(`${data.user.firstName} is online`);
});

// User offline status
socket.on('user_offline', (data) => {
  console.log(`${data.user.firstName} went offline`);
});
```

### Message Status Flow:
1. **`sent`** - Message sent to server
2. **`delivered`** - Message delivered to recipient's device
3. **`read`** - Message read by recipient

## Message Types

### Text Messages
```json
{
  "content": "Hello, how are you?",
  "messageType": "text"
}
```

### Image Messages
```json
{
  "content": "Check out this apartment photo",
  "messageType": "image",
  "attachments": [
    "https://res.cloudinary.com/uninest/image/upload/v1/messages/img1.jpg"
  ]
}
```

### File Messages
```json
{
  "content": "Here's the rental agreement",
  "messageType": "file",
  "attachments": [
    {
      "url": "https://res.cloudinary.com/uninest/raw/upload/v1/documents/agreement.pdf",
      "filename": "rental_agreement.pdf",
      "size": 245760,
      "type": "application/pdf"
    }
  ]
}
```

### Property-Related Messages
```json
{
  "content": "I'm interested in this property",
  "messageType": "text",
  "relatedProperty": "64f7b8c9d4e5f1234567890d"
}
```

## Frontend Integration Examples

### React Native Integration
```javascript
import io from 'socket.io-client';

const MessageScreen = ({ userId, recipientId }) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      auth: { token: authToken }
    });

    // Join user room
    newSocket.emit('join', { userId });

    // Listen for new messages
    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [userId]);

  const sendMessage = async (content) => {
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: recipientId,
          content
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setMessages(prev => [...prev, result.data]);
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const markAsRead = (messageId) => {
    socket?.emit('message_read', { messageId });
  };

  return (
    // Your message UI here
  );
};
```

### React Web Integration
```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const ChatComponent = ({ currentUserId, recipientId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchMessages();
    initializeSocket();
  }, [recipientId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages/${recipientId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setMessages(result.data.messages);
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const initializeSocket = () => {
    const newSocket = io('http://localhost:5000', {
      auth: { token: authToken }
    });

    newSocket.emit('join', { userId: currentUserId });

    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user_typing', ({ user, isTyping }) => {
      if (user._id === recipientId) {
        setIsTyping(isTyping);
      }
    });

    setSocket(newSocket);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const response = await fetch('/api/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        receiverId: recipientId,
        content: newMessage
      })
    });

    if (response.ok) {
      setNewMessage('');
    }
  };

  const handleTyping = (isTyping) => {
    socket?.emit('typing', {
      receiverId: recipientId,
      isTyping
    });
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map(message => (
          <div key={message._id} className="message">
            <span className="sender">{message.sender.firstName}:</span>
            <span className="content">{message.content}</span>
            <span className="time">{new Date(message.createdAt).toLocaleTimeString()}</span>
          </div>
        ))}
        {isTyping && <div className="typing-indicator">User is typing...</div>}
      </div>
      
      <div className="message-input">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onFocus={() => handleTyping(true)}
          onBlur={() => handleTyping(false)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};
```

## Error Responses

### Common Errors:
```json
{
  "success": false,
  "error": "Recipient not found",
  "code": "USER_NOT_FOUND"
}
```

```json
{
  "success": false,
  "error": "Cannot send message to yourself",
  "code": "INVALID_RECIPIENT"
}
```

```json
{
  "success": false,
  "error": "Message content is required",
  "code": "MISSING_CONTENT"
}
```

### Status Codes:
- `200` - Success
- `201` - Message created successfully
- `400` - Bad request / Invalid input
- `401` - Unauthorized / Invalid token
- `403` - Forbidden / Blocked conversation
- `404` - User or conversation not found
- `500` - Internal server error
