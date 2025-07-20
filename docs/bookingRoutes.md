# Booking Routes Documentation

## Base URL
- **Development:** `http://localhost:5000/api/booking`
- **Production:** `https://uni-nest.vercel.app/api/booking`

## Authentication
- **All routes require authentication**. Use a valid JWT token in the `Authorization` header: `Bearer <token>`

---

## Endpoints

### 1. **Create New Booking**
- **Endpoint**: `/`  
- **Method**: `POST`  
- **Description**: Create a new booking for a property.
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `propertyId` | `string` | Yes | ID of the property to book |
  | `startDate` | `string` | Yes | Booking start date (ISO format) |
  | `endDate` | `string` | Yes | Booking end date (ISO format) |
  | `monthlyRent` | `number` | Yes | Monthly rent amount |
  | `securityDeposit` | `number` | Yes | Security deposit amount |
  | `roommates` | `array` | No | Array of roommate user IDs |

- **Response** (201 - Created):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "propertyId": "64f7b8c9d4e5f1234567890b",
      "studentId": "64f7b8c9d4e5f1234567890c",
      "startDate": "2025-02-01T00:00:00.000Z",
      "endDate": "2025-07-31T23:59:59.000Z",
      "monthlyRent": 1000,
      "securityDeposit": 500,
      "totalAmount": 1500,
      "status": "Pending",
      "roommates": ["64f7b8c9d4e5f1234567890d"],
      "createdAt": "2025-01-10T10:30:00.000Z",
      "property": {
        "title": "Beautiful Student Apartment",
        "location": {
          "type": "Point",
          "coordinates": [-7.5898, 33.5731]
        }
      },
      "landlord": {
        "firstName": "Ahmed",
        "lastName": "Ben Ali",
        "email": "ahmed@example.com"
      }
    }
  }
  ```

---

### 2. **Get User Bookings**
- **Endpoint**: `/user`  
- **Method**: `GET`  
- **Description**: Get all bookings for the authenticated user.
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  | Parameter | Type | Description |
  |-----------|------|-------------|
  | `status` | `string` | Filter by status: `Pending`, `Confirmed`, `Cancelled`, `Completed` |
  | `page` | `number` | Page number (default: 1) |
  | `limit` | `number` | Items per page (default: 10) |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "bookings": [
        {
          "_id": "64f7b8c9d4e5f1234567890a",
          "propertyId": {
            "_id": "64f7b8c9d4e5f1234567890b",
            "title": "Beautiful Student Apartment",
            "images": ["https://res.cloudinary.com/uninest/image/upload/v1/properties/img1.jpg"],
            "location": {
              "type": "Point",
              "coordinates": [-7.5898, 33.5731]
            }
          },
          "startDate": "2025-02-01T00:00:00.000Z",
          "endDate": "2025-07-31T23:59:59.000Z",
          "monthlyRent": 1000,
          "totalAmount": 1500,
          "status": "Confirmed",
          "payment": {
            "status": "Completed",
            "method": "Bank Transfer"
          },
          "createdAt": "2025-01-10T10:30:00.000Z"
        }
      ],
      "pagination": {
        "total": 5,
        "page": 1,
        "limit": 10,
        "totalPages": 1
      }
    }
  }
  ```

---

### 3. **Get Booking Details**
- **Endpoint**: `/:id`  
- **Method**: `GET`  
- **Description**: Get detailed information about a specific booking.
- **Headers**: 
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `id` (string): Booking ID

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "propertyId": {
        "_id": "64f7b8c9d4e5f1234567890b",
        "title": "Beautiful Student Apartment",
        "description": "Modern 2-bedroom apartment",
        "images": ["https://res.cloudinary.com/uninest/image/upload/v1/properties/img1.jpg"],
        "location": {
          "type": "Point",
          "coordinates": [-7.5898, 33.5731]
        },
        "landlordId": {
          "firstName": "Ahmed",
          "lastName": "Ben Ali",
          "email": "ahmed@example.com",
          "phone": "+212600123456"
        }
      },
      "studentId": {
        "firstName": "Youssef",
        "lastName": "El Mansouri",
        "email": "youssef@example.com"
      },
      "startDate": "2025-02-01T00:00:00.000Z",
      "endDate": "2025-07-31T23:59:59.000Z",
      "monthlyRent": 1000,
      "securityDeposit": 500,
      "totalAmount": 1500,
      "status": "Confirmed",
      "roommates": [
        {
          "firstName": "Omar",
          "lastName": "Benali",
          "email": "omar@example.com"
        }
      ],
      "payments": [
        {
          "_id": "64f7b8c9d4e5f1234567890e",
          "amount": 1500,
          "status": "Completed",
          "method": "Bank Transfer",
          "paidAt": "2025-01-10T11:00:00.000Z"
        }
      ],
      "timeline": [
        {
          "action": "Booking Created",
          "timestamp": "2025-01-10T10:30:00.000Z",
          "by": "Student"
        },
        {
          "action": "Payment Completed",
          "timestamp": "2025-01-10T11:00:00.000Z",
          "by": "Student"
        },
        {
          "action": "Booking Confirmed",
          "timestamp": "2025-01-10T11:15:00.000Z",
          "by": "Landlord"
        }
      ],
      "createdAt": "2025-01-10T10:30:00.000Z",
      "updatedAt": "2025-01-10T11:15:00.000Z"
    }
  }
  ```

---

### 4. **Update Booking Status**
- **Endpoint**: `/:id/status`  
- **Method**: `PATCH`  
- **Description**: Update the status of a booking. Only landlord can confirm/decline, only student can cancel.
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **URL Parameters**:
  - `id` (string): Booking ID
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `status` | `string` | Yes | New status: `Confirmed`, `Cancelled`, `Completed` |
  | `reason` | `string` | No | Reason for status change (required for cancellation) |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "status": "Confirmed",
      "updatedAt": "2025-01-10T11:15:00.000Z"
    },
    "message": "Booking status updated successfully"
  }
  ```

---

### 5. **Process Payment**
- **Endpoint**: `/:id/payment`  
- **Method**: `POST`  
- **Description**: Process payment for a booking.
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **URL Parameters**:
  - `id` (string): Booking ID
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `paymentMethod` | `string` | Yes | Payment method: `Bank Transfer`, `Mobile Money`, `Cash` |
  | `amount` | `number` | Yes | Payment amount |
  | `transactionDetails` | `object` | No | Payment-specific details |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "paymentId": "64f7b8c9d4e5f1234567890e",
      "bookingId": "64f7b8c9d4e5f1234567890a",
      "amount": 1500,
      "status": "Pending",
      "method": "Bank Transfer",
      "instructions": {
        "bankName": "Attijariwafa Bank",
        "accountNumber": "****1234",
        "reference": "BK-64f7b8c9-890a"
      },
      "createdAt": "2025-01-10T11:00:00.000Z"
    }
  }
  ```

---

### 6. **Cancel Booking**
- **Endpoint**: `/:id`  
- **Method**: `DELETE`  
- **Description**: Cancel a booking. Only student can cancel their own booking.
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **URL Parameters**:
  - `id` (string): Booking ID
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `reason` | `string` | Yes | Cancellation reason |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "message": "Booking cancelled successfully",
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "status": "Cancelled",
      "cancellationReason": "Change of plans",
      "cancelledAt": "2025-01-10T12:00:00.000Z",
      "refund": {
        "eligible": true,
        "amount": 1500,
        "processingTime": "5-7 business days"
      }
    }
  }
  ```

---

## Booking Status Flow

### Status Transitions:
1. **Pending** → Student creates booking
2. **Confirmed** → Landlord approves booking  
3. **Completed** → Booking period ends successfully
4. **Cancelled** → Booking cancelled by student or landlord

### Payment Integration:
- Payment must be completed before landlord can confirm booking
- Automatic refund processing for cancelled bookings
- Multiple payment methods supported

## Error Responses

### Common Errors:
```json
{
  "success": false,
  "error": "Property not available for selected dates",
  "code": "BOOKING_CONFLICT"
}
```

```json
{
  "success": false,
  "error": "Insufficient permissions to update booking status",
  "code": "FORBIDDEN"
}
```

### Status Codes:
- `200` - Success
- `201` - Created successfully  
- `400` - Bad request / Validation error
- `401` - Unauthorized / Invalid token
- `403` - Forbidden / Insufficient permissions
- `404` - Booking not found
- `409` - Booking conflict / Property unavailable
- `500` - Internal server error
