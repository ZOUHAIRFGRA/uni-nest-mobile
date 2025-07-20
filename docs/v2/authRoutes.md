

# **Auth Routes Documentation**

### **Base URL**
- **Development:** `http://localhost:5000/api/auth`
- **Production:** `https://uni-nest.vercel.app/api/auth`

---

## **Endpoints**

### **1. Register User**
- **Method:** `POST`
- **URL:** `/register`
- **Description:** Register a new user. Supports profile image upload. If no profile image is provided, a default profile image is assigned based on gender.
- **Headers:**
  - `Content-Type: multipart/form-data`
- **Body Parameters:**
  | Field         | Type     | Required | Description                                |
  |---------------|----------|----------|--------------------------------------------|
  | `firstName`   | `string` | Yes      | User's first name                          |
  | `lastName`    | `string` | Yes      | User's last name                           |
  | `email`       | `string` | Yes      | User's email address                       |
  | `password`    | `string` | Yes      | User's password                            |
  | `phone`       | `string` | Yes      | User's phone number                        |
  | `cin`         | `string` | Yes      | User's national ID (CIN)                   |
  | `address`     | `string` | Yes      | User's address                             |
  | `dob`         | `string` | Yes      | Date of birth in `YYYY-MM-DD` format       |
  | `gender`      | `string` | Yes      | Gender (`Male` or `Female`)                |
  | `profileImage`| `file`   | No       | Profile image file (optional)              |

- **Responses:**
  - **Success:**
    - **Code:** 201
    - **Example:**
      ```json
      {
        "message": "User registered successfully",
        "user": {
          "_id": "USER_ID",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "password": "$2a$10$hashedpassword...",
          "phone": "123456789",
          "cin": "CIN123456",
          "address": "123 Street, City",
          "dob": "1990-01-01T00:00:00.000Z",
          "gender": "Male",
          "profileImage": "https://res.cloudinary.com/dgxsx113u/image/upload/v1733399500/users/defaultpfp/ss64xfxwayzbcgzrm5me.jpg",
          "role": "user",
          "createdAt": "2025-07-10T15:30:00.000Z",
          "updatedAt": "2025-07-10T15:30:00.000Z",
          "__v": 0
        }
      }
      ```
  - **Error:**
    - **Code:** 500
    - **Example:**
      ```json
      {
        "message": "Server error"
      }
      ```

**Notes:**
- Default profile images are automatically assigned based on gender:
  - **Male:** `https://res.cloudinary.com/dgxsx113u/image/upload/v1733399500/users/defaultpfp/ss64xfxwayzbcgzrm5me.jpg`
  - **Female:** `https://res.cloudinary.com/dgxsx113u/image/upload/v1733399500/users/defaultpfp/loenozm41udzp7cepyeb.jpg`
- Profile images are uploaded to Cloudinary in the `rmp/usersProfilePics` folder

---

### **2. Login User**
- **Method:** `POST`
- **URL:** `/login`
- **Description:** Log in an existing user. Sets an HTTP-only cookie with JWT token for authentication.
- **Headers:**
  - `Content-Type: application/json`
- **Body Parameters:**
  | Field      | Type     | Required | Description                  |
  |------------|----------|----------|------------------------------|
  | `email`    | `string` | Yes      | User's email address         |
  | `password` | `string` | Yes      | User's password              |

- **Responses:**
  - **Success:**
    - **Code:** 200
    - **Example:**
      ```json
      {
        "message": "Login successful",
        "user": {
          "id": "USER_ID",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "phone": "123456789",
          "cin": "CIN123456",
          "address": "123 Street, City",
          "dob": "1990-01-01T00:00:00.000Z",
          "gender": "Male",
          "role": "user",
          "profileImage": "https://res.cloudinary.com/dgxsx113u/image/upload/v1733399500/users/defaultpfp/ss64xfxwayzbcgzrm5me.jpg"
        }
      }
      ```
  - **Error:**
    - **Code:** 404
    - **Example:**
      ```json
      {
        "message": "Invalid email or password"
      }
      ```
    - **Code:** 401
    - **Example:**
      ```json
      {
        "message": "Invalid email or password"
      }
      ```
    - **Code:** 500
    - **Example:**
      ```json
      {
        "message": "Server error",
        "error": "Error details"
      }
      ```

**Notes:**
- A JWT token is set as an HTTP cookie with the following properties:
  - `httpOnly: false` - Allows JavaScript access
  - `secure: true` - Only sent over HTTPS in production
  - `sameSite: 'None'` - Allows cross-site cookies
  - `maxAge: 3600000` - Expires in 1 hour
- Password is hashed and compared using bcrypt

---

### **3. Update User Profile**
- **Method:** `PUT`
- **URL:** `/profile`
- **Description:** Update a user's profile. Supports profile image update. Requires authentication.
- **Headers:**
  - `Content-Type: multipart/form-data`
  - `Authorization: Bearer <token>` (JWT token is required)
- **Body Parameters:**
  | Field         | Type     | Required | Description                                |
  |---------------|----------|----------|--------------------------------------------|
  | `firstName`   | `string` | No       | User's updated first name                  |
  | `lastName`    | `string` | No       | User's updated last name                   |
  | `email`       | `string` | No       | User's updated email address               |
  | `phone`       | `string` | No       | User's updated phone number                |
  | `cin`         | `string` | No       | User's updated CIN                         |
  | `address`     | `string` | No       | User's updated address                     |
  | `dob`         | `string` | No       | User's updated date of birth               |
  | `gender`      | `string` | No       | User's updated gender                      |
  | `profileImage`| `file`   | No       | New profile image file                     |

- **Responses:**
  - **Success:**
    - **Code:** 200
    - **Example:**
      ```json
      {
        "user": {
          "id": "USER_ID",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "phone": "123456789",
          "cin": "CIN123456",
          "address": "123 Street, City",
          "dob": "1990-01-01T00:00:00.000Z",
          "gender": "Male",
          "role": "user",
          "profileImage": "https://res.cloudinary.com/dgxsx113u/image/upload/v1733399500/rmp/usersProfilePics/1234567890-profile.jpg"
        }
      }
      ```
  - **Error:**
    - **Code:** 404
    - **Example:**
      ```json
      {
        "message": "User not found"
      }
      ```
    - **Code:** 500
    - **Example:**
      ```json
      {
        "message": "Server error",
        "error": "Error details"
      }
      ```

**Notes:**
- Profile images are uploaded to Cloudinary in the `profileImages` folder
- If no new profile image is provided, the existing profile image is retained
- All fields are optional - only provided fields will be updated
- Requires authentication middleware (user must be logged in)

---

## **Authentication Flow**

1. **Registration:** User provides required information, gets default profile image based on gender
2. **Login:** User provides email/password, receives JWT token as HTTP cookie
3. **Protected Routes:** JWT token from cookie is used for authentication
4. **Profile Update:** Authenticated users can update their profile information and image

## **Security Features**

- Passwords are hashed using bcrypt
- JWT tokens expire after 1 hour
- HTTP-only cookies for token storage
- Cross-site cookie support for frontend integration
- Cloudinary integration for secure image uploads
