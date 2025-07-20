# User Routes Documentation

### **Base URL**
- **Development:** `http://localhost:5000/api/users`
- **Production:** `https://uni-nest.vercel.app/api/users`

---

## **Endpoints**

### **1. Get All Users (Admin)**
- **Method:** `GET`
- **URL:** `/`
- **Description:** Get all users in the system (Admin only)
- **Headers:**
  - `Authorization: Bearer <token>` (JWT token required)
- **Access:** Admin only

- **Responses:**
  - **Success (200):**
    ```json
    [
      {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "Student",
        "phone": "123456789",
        "profileImage": "image_url",
        "createdAt": "2025-07-10T15:30:00.000Z"
      }
    ]
    ```
  - **Error (500):**
    ```json
    {
      "error": "Failed to fetch users"
    }
    ```

---

### **2. Get My Profile**
- **Method:** `GET`
- **URL:** `/me`
- **Description:** Get the authenticated user's profile
- **Headers:**
  - `Authorization: Bearer <token>` (JWT token required)

- **Responses:**
  - **Success (200):**
    ```json
    {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "123456789",
      "cin": "CIN123456",
      "address": "123 Street, City",
      "dob": "1990-01-01T00:00:00.000Z",
      "gender": "Male",
      "role": "Student",
      "profileImage": "image_url",
      "preferences": {
        "budget": {
          "min": 500,
          "max": 1500
        },
        "preferredAreas": ["Downtown", "University Area"],
        "maxCommuteTime": 30,
        "amenities": {
          "wifi": true,
          "parking": false,
          "laundry": true,
          "gym": false,
          "security": true,
          "furnished": false
        },
        "roomType": "Private"
      },
      "lifestyle": {
        "smokingHabits": "No",
        "alcoholConsumption": "Occasionally",
        "petFriendly": true,
        "sleepSchedule": "Early",
        "socialLevel": "Moderate",
        "cleanlinessLevel": "High",
        "noiseLevel": "Low",
        "guestPolicy": "Moderate"
      },
      "createdAt": "2025-07-10T15:30:00.000Z"
    }
    ```

---

### **3. Search Users by Name**
- **Method:** `GET`
- **URL:** `/search`
- **Description:** Search users by first name or last name
- **Headers:**
  - `Authorization: Bearer <token>` (JWT token required)
- **Query Parameters:**
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `name` | `string` | Yes | Name to search for |

- **Responses:**
  - **Success (200):**
    ```json
    [
      {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "Student",
        "profileImage": "image_url"
      }
    ]
    ```

---

### **4. Get All Landlords**
- **Method:** `GET`
- **URL:** `/landlords`
- **Description:** Get all users with Landlord role
- **Headers:**
  - `Authorization: Bearer <token>` (JWT token required)

- **Responses:**
  - **Success (200):**
    ```json
    [
      {
        "_id": "landlord_id",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com",
        "role": "Landlord",
        "phone": "987654321",
        "profileImage": "image_url",
        "createdAt": "2025-07-10T15:30:00.000Z"
      }
    ]
    ```
  - **Error (500):**
    ```json
    {
      "err": "failed to get landlords"
    }
    ```

---

### **5. Get All Students**
- **Method:** `GET`
- **URL:** `/students`
- **Description:** Get all users with Student role
- **Headers:**
  - `Authorization: Bearer <token>` (JWT token required)

- **Responses:**
  - **Success (200):**
    ```json
    [
      {
        "_id": "student_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "Student",
        "phone": "123456789",
        "profileImage": "image_url",
        "university": "University Name",
        "studentId": "STU123456",
        "createdAt": "2025-07-10T15:30:00.000Z"
      }
    ]
    ```
  - **Error (500):**
    ```json
    {
      "error": "failed to load students"
    }
    ```

---

### **6. Get User by ID**
- **Method:** `GET`
- **URL:** `/:id`
- **Description:** Get a specific user's profile by ID
- **Headers:**
  - `Authorization: Bearer <token>` (JWT token required)
- **Path Parameters:**
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `id` | `string` | Yes | User ID |

- **Responses:**
  - **Success (200):**
    ```json
    {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "123456789",
      "role": "Student",
      "profileImage": "image_url",
      "createdAt": "2025-07-10T15:30:00.000Z"
    }
    ```
  - **Error (404):**
    ```json
    {
      "error": "User not found"
    }
    ```

---

### **7. Update User Profile**
- **Method:** `PUT`
- **URL:** `/:id`
- **Description:** Update a user's profile
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (JWT token required)
- **Path Parameters:**
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `id` | `string` | Yes | User ID |
- **Body Parameters:**
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `firstName` | `string` | No | Updated first name |
  | `lastName` | `string` | No | Updated last name |
  | `phone` | `string` | No | Updated phone number |
  | `address` | `string` | No | Updated address |
  | `dob` | `string` | No | Updated date of birth |
  | `gender` | `string` | No | Updated gender |
  | `profileImage` | `string` | No | Updated profile image URL |

- **Responses:**
  - **Success (200):**
    ```json
    {
      "message": "Profile updated successfully",
      "user": {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "123456789",
        "address": "Updated Address",
        "dob": "1990-01-01T00:00:00.000Z",
        "gender": "Male",
        "profileImage": "updated_image_url",
        "updatedAt": "2025-07-10T16:00:00.000Z"
      }
    }
    ```
  - **Error (404):**
    ```json
    {
      "error": "User not found"
    }
    ```

**Notes:**
- Only provided fields will be updated
- User can only update their own profile (unless admin)

---

### **8. Delete User (Admin)**
- **Method:** `DELETE`
- **URL:** `/:id`
- **Description:** Delete a user from the system (Admin only)
- **Headers:**
  - `Authorization: Bearer <token>` (JWT token required)
- **Path Parameters:**
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `id` | `string` | Yes | User ID to delete |
- **Access:** Admin only

- **Responses:**
  - **Success (200):**
    ```json
    {
      "message": "User deleted successfully"
    }
    ```
  - **Error (404):**
    ```json
    {
      "error": "User not found"
    }
    ```

---

## **User Roles**

### **Student**
- Can search and book properties
- Can set preferences for AI matching
- Can manage their profile and lifestyle preferences
- Has university and student ID information

### **Landlord**
- Can create and manage property listings
- Can view and manage booking requests
- Can process payments and verifications
- Has landlord-specific profile information

### **Admin**
- Can access all user data
- Can delete users
- Can manage system-wide settings
- Has elevated permissions

## **User Preferences (Students)**
Students have detailed preference settings for AI matching:

- **Budget Range**: Min and max rental budget
- **Preferred Areas**: Array of preferred neighborhoods
- **Max Commute Time**: Maximum acceptable travel time to university
- **Amenities**: Required property features
- **Room Type**: Preferred accommodation type

## **Lifestyle Preferences (Students)**
For roommate matching:

- **Smoking Habits**: Smoking preferences
- **Alcohol Consumption**: Drinking habits
- **Pet Policy**: Pet-friendly preferences
- **Sleep Schedule**: Early bird vs night owl
- **Social Level**: Introvert vs extrovert scale
- **Cleanliness Level**: Tidiness expectations
- **Noise Level**: Noise tolerance
- **Guest Policy**: Frequency of having guests over

## **Security Notes**
- All routes require authentication except where noted
- Users can only access their own data unless they're admin
- Profile updates require user ownership or admin privileges
- Sensitive information is filtered in public responses
