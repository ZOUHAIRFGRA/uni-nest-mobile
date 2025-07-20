

# **Auth Routes Documentation**

### **Base URL**
- **Development:** `http://localhost:5000/api/auth`
- **Production:** `https://uni-nest.vercel.app/api/auth`

---

## **Endpoints**

### **1. Register User**
- **Method:** `POST`
- **URL:** `/register`
- **Description:** Register a new user. Supports profile image upload.
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
          "id": "USER_ID",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "phone": "123456789",
          "cin": "CIN123456",
          "address": "123 Street, City",
          "dob": "1990-01-01",
          "gender": "Male",
          "profileImage": "<url>"
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

---

### **2. Login User**
- **Method:** `POST`
- **URL:** `/login`
- **Description:** Log in an existing user.
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
        "token": "JWT_TOKEN",
        "user": {
          "id": "USER_ID",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "phone": "123456789",
          "cin": "CIN123456",
          "address": "123 Street, City",
          "dob": "1990-01-01",
          "gender": "Male",
          "role": "user",
          "profileImage": "<url>"
        }
      }
      ```
  - **Error:**
    - **Code:** 401
    - **Example:**
      ```json
      {
        "message": "Invalid email or password"
      }
      ```

---

### **3. Update User Profile**
- **Method:** `PUT`
- **URL:** `/profile`
- **Description:** Update a user's profile. Supports profile image update.
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
          "dob": "1990-01-01",
          "gender": "Male",
          "role": "user",
          "profileImage": "<url>"
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

---
