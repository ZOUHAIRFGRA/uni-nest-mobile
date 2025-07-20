# Booking Routes Documentation

### **Base URL**
- **Development:** `http://localhost:5000/api/bookings`
- **Production:** `https://uni-nest.vercel.app/api/bookings`

---

## **Endpoints**

### **1. Create Booking**
- **Method:** `POST`
- **URL:** `/`
- **Description:** Create a new property booking with optional roommates
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (JWT token required)
- **Body Parameters:**
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `propertyId` | `string` | Yes | Property to book |
  | `startDate` | `string` | Yes | Booking start date (ISO format) |
  | `endDate` | `string` | Yes | Booking end date (ISO format) |
  | `monthlyRent` | `number` | Yes | Monthly rent amount |
  | `securityDeposit` | `number` | Yes | Security deposit amount |
  | `roommates` | `array` | No | Array of roommate user IDs |

- **Responses:**
  - **Success (201):**
    ```json
    {
      "success": true,
      "data": {
        "_id": "booking_id",
        "studentId": "student_id",
        "propertyId": {
          "title": "Property Title",
          "location": {...},
          "images": [...]
        },
        "landlordId": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "landlord@example.com",
          "phone": "123456789"
        },
        "startDate": "2025-08-01T00:00:00.000Z",
        "endDate": "2025-08-31T00:00:00.000Z",
        "monthlyRent": 1000,
        "securityDeposit": 2000,
        "totalAmount": 3000,
        "status": "Pending",
        "paymentStatus": "Pending",
        "roommates": [
          {
            "userId": {
              "firstName": "Jane",
              "lastName": "Smith",
              "email": "jane@example.com"
            },
            "confirmationStatus": "Pending"
          }
        ],
        "createdAt": "2025-07-10T15:30:00.000Z"
      },
      "message": "Booking created successfully"
    }
    ```
  - **Error (400):**
    ```json
    {
      "success": false,
      "error": "Property is not available for the selected dates"
    }
    ```
  - **Error (404):**
    ```json
    {
      "success": false,
      "error": "Property not found"
    }
    ```

**Notes:**
- Automatically checks for date conflicts with existing bookings
- Sends notifications to landlord and roommates
- Creates analytics record for the booking

---

### **2. Get User Bookings**
- **Method:** `GET`
- **URL:** `/user`
- **Description:** Get bookings for the authenticated user (student or landlord view)
- **Headers:**
  - `Authorization: Bearer <token>` (JWT token required)
- **Query Parameters:**
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `status` | `string` | No | Filter by booking status |
  | `page` | `number` | No | Page number (default: 1) |
  | `limit` | `number` | No | Items per page (default: 10) |

- **Responses:**
  - **Success (200):**
    ```json
    {
      "success": true,
      "data": {
        "bookings": [
          {
            "_id": "booking_id",
            "propertyId": {
              "title": "Property Title",
              "location": {...},
              "images": [...],
              "price": 1000
            },
            "studentId": {
              "firstName": "John",
              "lastName": "Doe",
              "email": "student@example.com",
              "phone": "123456789"
            },
            "status": "Confirmed",
            "paymentStatus": "Paid",
            "totalAmount": 3000,
            "startDate": "2025-08-01T00:00:00.000Z",
            "endDate": "2025-08-31T00:00:00.000Z",
            "createdAt": "2025-07-10T15:30:00.000Z"
          }
        ],
        "totalCount": 15,
        "currentPage": 1,
        "totalPages": 2
      }
    }
    ```

---

### **3. Get Booking Details**
- **Method:** `GET`
- **URL:** `/:id`
- **Description:** Get detailed information about a specific booking
- **Headers:**
  - `Authorization: Bearer <token>` (JWT token required)
- **Path Parameters:**
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `id` | `string` | Yes | Booking ID |

- **Responses:**
  - **Success (200):**
    ```json
    {
      "success": true,
      "data": {
        "_id": "booking_id",
        "propertyId": {
          "title": "Property Title",
          "description": "Property description",
          "location": {...},
          "images": [...],
          "price": 1000,
          "maxTenants": 4
        },
        "studentId": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "student@example.com",
          "phone": "123456789",
          "profileImage": "image_url"
        },
        "landlordId": {
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "landlord@example.com",
          "phone": "987654321",
          "profileImage": "image_url"
        },
        "roommates": [
          {
            "userId": {
              "firstName": "Alice",
              "lastName": "Johnson",
              "email": "alice@example.com",
              "profileImage": "image_url"
            },
            "confirmationStatus": "Confirmed"
          }
        ],
        "status": "Confirmed",
        "paymentStatus": "Paid",
        "totalAmount": 3000,
        "monthlyRent": 1000,
        "securityDeposit": 2000,
        "startDate": "2025-08-01T00:00:00.000Z",
        "endDate": "2025-08-31T00:00:00.000Z",
        "paymentMethod": "Bank Transfer",
        "paymentProof": "proof_image_url",
        "createdAt": "2025-07-10T15:30:00.000Z"
      }
    }
    ```
  - **Error (403):**
    ```json
    {
      "success": false,
      "error": "Access denied"
    }
    ```
  - **Error (404):**
    ```json
    {
      "success": false,
      "error": "Booking not found"
    }
    ```

**Notes:**
- Only accessible by booking participants (student, landlord, roommates) or admin
- Returns complete booking information with all related data

---

### **4. Update Booking Status**
- **Method:** `PATCH`
- **URL:** `/:id/status`
- **Description:** Update booking status (confirm, cancel, etc.)
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (JWT token required)
- **Path Parameters:**
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `id` | `string` | Yes | Booking ID |
- **Body Parameters:**
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `status` | `string` | Yes | New status (Confirmed, Cancelled) |
  | `reason` | `string` | No | Reason for status change |

- **Responses:**
  - **Success (200):**
    ```json
    {
      "success": true,
      "data": {
        "_id": "booking_id",
        "status": "Confirmed",
        "cancellationReason": null,
        "cancelledBy": null,
        "cancellationDate": null,
        "updatedAt": "2025-07-10T16:00:00.000Z"
      },
      "message": "Booking status updated to Confirmed"
    }
    ```

**Notes:**
- Only landlord, student, or admin can update status
- Automatically sends notifications to relevant parties
- Records cancellation details if status is "Cancelled"

---

### **5. Process Payment**
- **Method:** `POST`
- **URL:** `/:id/payment`
- **Description:** Process payment for a booking (local payment methods)
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (JWT token required)
- **Path Parameters:**
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `id` | `string` | Yes | Booking ID |
- **Body Parameters:**
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `paymentMethod` | `string` | Yes | Payment method (Bank Transfer, Cash, etc.) |
  | `transactionDetails` | `object` | Yes | Transaction details |
  | `proofImageUrl` | `string` | No | URL of payment proof image |

- **Responses:**
  - **Success (200):**
    ```json
    {
      "success": true,
      "data": {
        "booking": {
          "_id": "booking_id",
          "paymentStatus": "Paid",
          "paymentMethod": "Bank Transfer",
          "paymentDetails": {...},
          "paymentProof": "proof_image_url"
        },
        "payment": {
          "_id": "payment_id",
          "amount": 3000,
          "status": "Completed",
          "method": "Bank Transfer"
        },
        "message": "Payment submitted for verification"
      }
    }
    ```
  - **Error (403):**
    ```json
    {
      "success": false,
      "error": "Unauthorized to make payment for this booking"
    }
    ```

**Notes:**
- Only the student who made the booking can process payment
- Creates payment record in the system
- Supports local payment methods with proof verification
- Sends notification to landlord

---

### **6. Cancel Booking**
- **Method:** `DELETE`
- **URL:** `/:id`
- **Description:** Cancel a booking
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (JWT token required)
- **Path Parameters:**
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `id` | `string` | Yes | Booking ID |
- **Body Parameters:**
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `reason` | `string` | No | Cancellation reason |

- **Responses:**
  - **Success (200):**
    ```json
    {
      "success": true,
      "message": "Booking cancelled successfully"
    }
    ```

---

## **Booking Status Flow**
1. **Pending** - Initial status when booking is created
2. **Confirmed** - Landlord accepts the booking
3. **Cancelled** - Either party cancels the booking

## **Payment Status Flow**
1. **Pending** - No payment initiated
2. **Paid** - Payment completed with proof
3. **Verified** - Payment verified by landlord
4. **Rejected** - Payment rejected by landlord

## **Roommate Integration**
- Bookings can include multiple roommates
- Each roommate receives a notification
- Roommate confirmation status is tracked
- Roommates have access to booking details
