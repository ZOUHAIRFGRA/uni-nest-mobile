# Payment Routes Documentation

## Base URL
- **Development:** `http://localhost:5000/api/payments`
- **Production:** `https://uni-nest.vercel.app/api/payments`

## Authentication
- **Most routes require authentication**. Use a valid JWT token in the `Authorization` header: `Bearer <token>`

---

## Overview
Comprehensive payment system supporting multiple payment methods including bank transfers, mobile money, and cash payments with proof upload and admin verification capabilities.

## Endpoints

### 1. **Initiate Payment**
- **Endpoint**: `/`  
- **Method**: `POST`  
- **Description**: Create a new payment for a booking.
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `bookingId` | `string` | Yes | ID of the booking to pay for |
  | `receiverId` | `string` | Yes | ID of payment receiver (landlord) |
  | `amount` | `number` | Yes | Payment amount in MAD |
  | `paymentMethod` | `string` | Yes | `Bank Transfer`, `Mobile Money`, `Cash` |
  | `transactionDetails` | `object` | No | Payment method specific details |

- **Transaction Details by Method**:
  ```json
  // Bank Transfer
  {
    "bankName": "Attijariwafa Bank",
    "accountNumber": "012345678901234",
    "reference": "Custom reference"
  }

  // Mobile Money
  {
    "phoneNumber": "+212600123456",
    "provider": "Orange Money" // or "inwi money"
  }

  // Cash
  {
    "location": "Property location",
    "scheduledDate": "2025-01-15T14:00:00.000Z"
  }
  ```

- **Response** (201 - Created):
  ```json
  {
    "success": true,
    "data": {
      "payment": {
        "_id": "64f7b8c9d4e5f1234567890a",
        "bookingId": "64f7b8c9d4e5f1234567890b",
        "payerId": "64f7b8c9d4e5f1234567890c",
        "receiverId": "64f7b8c9d4e5f1234567890d",
        "amount": 1500,
        "paymentMethod": "Bank Transfer",
        "status": "Pending",
        "reference": "PAY-64f7b8c9-890a",
        "transactionDetails": {
          "bankName": "Attijariwafa Bank",
          "accountNumber": "****1234",
          "reference": "Custom reference"
        },
        "createdAt": "2025-01-10T10:30:00.000Z",
        "expiresAt": "2025-01-12T10:30:00.000Z"
      },
      "fees": {
        "platformFee": 45,
        "processingFee": 15,
        "totalFees": 60,
        "netAmount": 1440
      },
      "instructions": {
        "title": "Bank Transfer Instructions",
        "steps": [
          "Transfer 1500 MAD to the account below",
          "Use reference: PAY-64f7b8c9-890a",
          "Upload transfer receipt as proof",
          "Payment will be verified within 24 hours"
        ],
        "accountDetails": {
          "bankName": "Attijariwafa Bank",
          "accountNumber": "012345678901234",
          "accountHolder": "UniNest Platform",
          "rib": "230-123-0123456789012-34"
        },
        "deadline": "2025-01-12T10:30:00.000Z"
      }
    }
  }
  ```

---

### 2. **Upload Payment Proof**
- **Endpoint**: `/:id/proof`  
- **Method**: `POST`  
- **Description**: Upload proof of payment (receipt, screenshot, etc.).
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **URL Parameters**:
  - `id` (string): Payment ID
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `proof` | `file` | Yes | Payment proof image/PDF |
  | `notes` | `string` | No | Additional notes about the payment |
  | `transactionId` | `string` | No | Bank/Mobile money transaction ID |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "status": "Proof Submitted",
      "proofOfPayment": {
        "url": "https://res.cloudinary.com/uninest/image/upload/v1/payments/proof1.jpg",
        "filename": "transfer_receipt.jpg",
        "uploadedAt": "2025-01-10T11:00:00.000Z"
      },
      "transactionId": "TXN123456789",
      "notes": "Payment made via mobile app",
      "updatedAt": "2025-01-10T11:00:00.000Z"
    },
    "message": "Payment proof uploaded successfully. Verification in progress."
  }
  ```

---

### 3. **Get Payment Details**
- **Endpoint**: `/:id`  
- **Method**: `GET`  
- **Description**: Get detailed information about a specific payment.
- **Headers**: 
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `id` (string): Payment ID

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "bookingId": {
        "_id": "64f7b8c9d4e5f1234567890b",
        "propertyId": {
          "title": "Modern Student Apartment",
          "images": ["https://res.cloudinary.com/uninest/image/upload/v1/properties/img1.jpg"]
        },
        "startDate": "2025-02-01T00:00:00.000Z",
        "endDate": "2025-07-31T23:59:59.000Z"
      },
      "payerId": {
        "firstName": "Youssef",
        "lastName": "El Mansouri",
        "email": "youssef@example.com"
      },
      "receiverId": {
        "firstName": "Ahmed",
        "lastName": "Ben Ali",
        "email": "ahmed@example.com"
      },
      "amount": 1500,
      "paymentMethod": "Bank Transfer",
      "status": "Verified",
      "reference": "PAY-64f7b8c9-890a",
      "transactionId": "TXN123456789",
      "fees": {
        "platformFee": 45,
        "processingFee": 15,
        "totalFees": 60
      },
      "proofOfPayment": {
        "url": "https://res.cloudinary.com/uninest/image/upload/v1/payments/proof1.jpg",
        "filename": "transfer_receipt.jpg",
        "uploadedAt": "2025-01-10T11:00:00.000Z"
      },
      "timeline": [
        {
          "status": "Pending",
          "timestamp": "2025-01-10T10:30:00.000Z",
          "note": "Payment initiated"
        },
        {
          "status": "Proof Submitted",
          "timestamp": "2025-01-10T11:00:00.000Z",
          "note": "Payment proof uploaded"
        },
        {
          "status": "Verified",
          "timestamp": "2025-01-10T12:00:00.000Z",
          "note": "Payment verified by admin",
          "verifiedBy": "admin@uninest.com"
        }
      ],
      "createdAt": "2025-01-10T10:30:00.000Z",
      "verifiedAt": "2025-01-10T12:00:00.000Z",
      "expiresAt": "2025-01-12T10:30:00.000Z"
    }
  }
  ```

---

### 4. **Get User Payments**
- **Endpoint**: `/`  
- **Method**: `GET`  
- **Description**: Get all payments for the authenticated user.
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  | Parameter | Type | Description |
  |-----------|------|-------------|
  | `page` | `number` | Page number (default: 1) |
  | `limit` | `number` | Payments per page (default: 10) |
  | `status` | `string` | Filter by status: `Pending`, `Proof Submitted`, `Verified`, `Failed`, `Expired` |
  | `method` | `string` | Filter by payment method |
  | `type` | `string` | Filter by type: `sent`, `received` |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "payments": [
        {
          "_id": "64f7b8c9d4e5f1234567890a",
          "amount": 1500,
          "paymentMethod": "Bank Transfer",
          "status": "Verified",
          "reference": "PAY-64f7b8c9-890a",
          "type": "sent",
          "booking": {
            "propertyTitle": "Modern Student Apartment",
            "startDate": "2025-02-01T00:00:00.000Z"
          },
          "otherParty": {
            "firstName": "Ahmed",
            "lastName": "Ben Ali"
          },
          "createdAt": "2025-01-10T10:30:00.000Z",
          "verifiedAt": "2025-01-10T12:00:00.000Z"
        }
      ],
      "pagination": {
        "total": 8,
        "page": 1,
        "limit": 10,
        "totalPages": 1
      },
      "summary": {
        "totalSent": 3500,
        "totalReceived": 2000,
        "pendingPayments": 2,
        "verifiedPayments": 6
      }
    }
  }
  ```

---

### 5. **Get Payment Instructions**
- **Endpoint**: `/instructions/:method`  
- **Method**: `GET`  
- **Description**: Get payment instructions for a specific method.
- **Authentication**: Not required
- **URL Parameters**:
  - `method` (string): Payment method: `bank-transfer`, `mobile-money`, `cash`

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "method": "Bank Transfer",
      "title": "How to Pay via Bank Transfer",
      "description": "Follow these steps to complete your bank transfer payment",
      "steps": [
        {
          "step": 1,
          "title": "Initiate Transfer",
          "description": "Log into your bank account or visit a branch",
          "icon": "bank"
        },
        {
          "step": 2,
          "title": "Enter Account Details",
          "description": "Use the account details provided in your payment",
          "icon": "credit-card"
        },
        {
          "step": 3,
          "title": "Add Reference",
          "description": "Include the payment reference in the transfer",
          "icon": "hash"
        },
        {
          "step": 4,
          "title": "Upload Proof",
          "description": "Upload your transfer receipt for verification",
          "icon": "upload"
        }
      ],
      "tips": [
        "Always include the payment reference",
        "Keep your transfer receipt safe",
        "Verification usually takes 2-24 hours",
        "Contact support if you have issues"
      ],
      "supportedBanks": [
        "Attijariwafa Bank",
        "Banque Populaire",
        "BMCE Bank",
        "Crédit du Maroc",
        "BMCI"
      ],
      "processingTime": "2-24 hours",
      "fees": {
        "platformFee": "3%",
        "processingFee": "15 MAD"
      }
    }
  }
  ```

---

### 6. **Calculate Payment Fees**
- **Endpoint**: `/fees/calculate`  
- **Method**: `GET`  
- **Description**: Calculate fees for a payment amount and method.
- **Authentication**: Not required
- **Query Parameters**:
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `amount` | `number` | Yes | Payment amount in MAD |
  | `method` | `string` | Yes | Payment method |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "amount": 1500,
      "method": "Bank Transfer",
      "fees": {
        "platformFee": {
          "rate": "3%",
          "amount": 45,
          "description": "Platform service fee"
        },
        "processingFee": {
          "amount": 15,
          "description": "Payment processing fee"
        },
        "totalFees": 60,
        "netAmount": 1440,
        "breakdown": {
          "grossAmount": 1500,
          "platformFee": -45,
          "processingFee": -15,
          "netAmount": 1440
        }
      },
      "comparison": {
        "bankTransfer": { "totalFees": 60, "percentage": "4.0%" },
        "mobileMoney": { "totalFees": 75, "percentage": "5.0%" },
        "cash": { "totalFees": 45, "percentage": "3.0%" }
      }
    }
  }
  ```

---

### 7. **Verify Payment Status (Admin)**
- **Endpoint**: `/:id/verify`  
- **Method**: `PATCH`  
- **Description**: Verify or reject a payment (Admin only).
- **Headers**: 
  - `Authorization: Bearer <token>` (Admin token required)
  - `Content-Type: application/json`
- **URL Parameters**:
  - `id` (string): Payment ID
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `status` | `string` | Yes | `Verified` or `Failed` |
  | `adminNotes` | `string` | No | Admin verification notes |
  | `failureReason` | `string` | No | Reason for failure (if status is Failed) |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "status": "Verified",
      "verifiedBy": "64f7b8c9d4e5f1234567890e",
      "verifiedAt": "2025-01-10T12:00:00.000Z",
      "adminNotes": "Transfer confirmed in bank statement",
      "updatedAt": "2025-01-10T12:00:00.000Z"
    },
    "message": "Payment status updated successfully"
  }
  ```

---

### 8. **Admin Dashboard**
- **Endpoint**: `/admin/dashboard`  
- **Method**: `GET`  
- **Description**: Get payment analytics and pending verifications (Admin only).
- **Headers**: 
  - `Authorization: Bearer <token>` (Admin token required)
- **Query Parameters**:
  | Parameter | Type | Description |
  |-----------|------|-------------|
  | `period` | `string` | Time period: `today`, `week`, `month`, `year` |
  | `status` | `string` | Filter by status |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "totalPayments": 1250,
        "totalVolume": 875000,
        "pendingVerification": 15,
        "averageAmount": 700,
        "successRate": 94.5
      },
      "pendingPayments": [
        {
          "_id": "64f7b8c9d4e5f1234567890a",
          "amount": 1500,
          "paymentMethod": "Bank Transfer",
          "payer": {
            "firstName": "Youssef",
            "lastName": "El Mansouri"
          },
          "proofSubmittedAt": "2025-01-10T11:00:00.000Z",
          "waitingTime": "1 hour"
        }
      ],
      "analytics": {
        "byMethod": {
          "bankTransfer": { "count": 750, "volume": 525000 },
          "mobileMoney": { "count": 350, "volume": 245000 },
          "cash": { "count": 150, "volume": 105000 }
        },
        "byStatus": {
          "verified": 1175,
          "pending": 45,
          "failed": 30
        },
        "trends": {
          "dailyVolume": [12000, 15000, 18000, 22000, 25000],
          "verificationTime": "4.2 hours average"
        }
      },
      "recentActivity": [
        {
          "action": "Payment Verified",
          "paymentId": "64f7b8c9d4e5f1234567890a",
          "amount": 1500,
          "timestamp": "2025-01-10T12:00:00.000Z",
          "admin": "admin@uninest.com"
        }
      ]
    }
  }
  ```

---

## Payment Status Flow

### Status Transitions:
1. **`Pending`** → Payment created, awaiting proof
2. **`Proof Submitted`** → User uploaded payment proof
3. **`Verified`** → Admin verified the payment
4. **`Failed`** → Payment verification failed
5. **`Expired`** → Payment expired without proof submission

### Automatic Actions:
- **Booking Confirmation**: Triggered when payment is verified
- **Notification Sending**: Real-time updates to both parties
- **Refund Processing**: Automatic for cancelled bookings
- **Reminder System**: Automated payment deadline reminders

## Payment Methods Details

### Bank Transfer
- **Processing Time**: 2-24 hours
- **Platform Fee**: 3%
- **Processing Fee**: 15 MAD
- **Supported Banks**: All major Moroccan banks
- **Requirements**: Bank receipt/screenshot

### Mobile Money
- **Processing Time**: 1-4 hours
- **Platform Fee**: 3%
- **Processing Fee**: 30 MAD
- **Supported Providers**: Orange Money, inwi money
- **Requirements**: Transaction SMS/screenshot

### Cash Payment
- **Processing Time**: Immediate upon confirmation
- **Platform Fee**: 3%
- **Processing Fee**: 0 MAD
- **Requirements**: In-person meeting
- **Security**: Location-based meetup coordination

## Frontend Integration Examples

### React Native Integration
```javascript
const PaymentScreen = ({ bookingId, amount, receiverId }) => {
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [payment, setPayment] = useState(null);
  const [proofFile, setProofFile] = useState(null);

  const initiatePayment = async () => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          receiverId,
          amount,
          paymentMethod
        })
      });

      const result = await response.json();
      if (result.success) {
        setPayment(result.data.payment);
        showPaymentInstructions(result.data.instructions);
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
    }
  };

  const uploadProof = async () => {
    if (!proofFile) return;

    const formData = new FormData();
    formData.append('proof', proofFile);

    try {
      const response = await fetch(`/api/payments/${payment._id}/proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        setPayment(result.data);
        showSuccessMessage('Proof uploaded successfully');
      }
    } catch (error) {
      console.error('Proof upload error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {!payment ? (
        <PaymentMethodSelector 
          method={paymentMethod}
          onMethodChange={setPaymentMethod}
          onInitiate={initiatePayment}
          amount={amount}
        />
      ) : (
        <PaymentProgress 
          payment={payment}
          onUploadProof={uploadProof}
          proofFile={proofFile}
          onSelectProof={setProofFile}
        />
      )}
    </View>
  );
};
```

## Error Responses

### Common Errors:
```json
{
  "success": false,
  "error": "Payment amount exceeds booking total",
  "code": "INVALID_AMOUNT"
}
```

```json
{
  "success": false,
  "error": "Payment proof is required for this method",
  "code": "PROOF_REQUIRED"
}
```

```json
{
  "success": false,
  "error": "Payment has expired",
  "code": "PAYMENT_EXPIRED"
}
```

### Status Codes:
- `200` - Success
- `201` - Payment created successfully
- `400` - Bad request / Invalid input
- `401` - Unauthorized / Invalid token
- `403` - Forbidden / Admin access required
- `404` - Payment not found
- `409` - Payment conflict / Already processed
- `500` - Internal server error
