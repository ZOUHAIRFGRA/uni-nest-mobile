

---

## **API Documentation for Roommate Post Management**

### Base URL
```
/api
```

### Authentication
- **All routes require authentication**. Use a valid JWT token in the `Authorization` header (e.g., `Bearer <token>`).

---

### 1. **Create a Roommate Post**
- **Endpoint**: `/roommate-posts`  
- **Method**: `POST`  
- **Description**: Create a new roommate post, allowing tenants to specify their preferences and needs.  
- **Request Body**:
  ```json
  {
    "propertyId": "property_id",
    "neededRoommates": 2,
    "preferences": {
      "gender": "female",
      "smoking": "no",
      "lifestyle": "quiet"
    },
    "availableFrom": "2024-12-15T00:00:00Z"
  }
  ```

  **Fields**:
  - **propertyId**: The ID of the property the roommate is looking to share.
  - **neededRoommates**: Number of roommates needed.
  - **preferences**: User preferences (e.g., gender, smoking, lifestyle).
  - **availableFrom**: Date when the room will be available.

- **Response** (201 - Created):
  ```json
  {
    "message": "Roommate post created successfully",
    "roommatePostId": "roommate_post_id"
  }
  ```

- **Error Responses**:
  - **400 - Bad Request**: Missing required fields.
    ```json
    {
      "message": "Missing required fields"
    }
    ```
  - **404 - Not Found**: Property not found.
    ```json
    {
      "message": "Property not found"
    }
    ```

---

### 2. **Get Roommate Posts with Filters**
- **Endpoint**: `/roommate-posts`  
- **Method**: `GET`  
- **Description**: Get a list of roommate posts based on filters such as budget, gender, lifestyle, etc.  
- **Query Parameters**:
  - `budgetMax`: Maximum budget for the room.
  - `gender`: Preferred gender of the roommate (e.g., `"male"`, `"female"`, `"any"`).
  - `smoking`: Smoking preference (e.g., `"yes"`, `"no"`, `"any"`).
  - `lifestyle`: Preferred lifestyle (e.g., `"quiet"`, `"social"`).
  - `preferredLocation`: Preferred location in GeoJSON format (optional).
  - `maxDistanceFromLocation`: Maximum distance from the preferred location (in km).
  - `maxTenants`: Maximum number of tenants allowed.
  - `utilitiesIncluded`: Whether utilities are included in the price (true/false).
  - `distanceToUniversity`: Distance to the university in kilometers.

- **Example Request**:
  ```
  GET /roommate-posts?budgetMax=500&gender=female&smoking=no
  ```

- **Response** (200 - OK):
  ```json
  {
    "matchedProperties": [
      {
        "_id": "roommate_post_id",
        "propertyId": "property_id",
        "neededRoommates": 2,
        "currentRoommates": [],
        "budgetRange": { "max": 500 },
        "preferences": {
          "gender": "female",
          "smoking": "no",
          "lifestyle": "quiet"
        },
        "availableFrom": "2024-12-15T00:00:00Z",
        "status": "active"
      },
      ...
    ]
  }
  ```

- **Error Responses**:
  - **400 - Bad Request**: Invalid location format.
    ```json
    {
      "message": "Invalid preferredLocation format"
    }
    ```
  - **200 - No Matching Posts**: No matching roommate posts found.
    ```json
    {
      "message": "No matching roommate posts found"
    }
    ```

---

### 3. **Apply to a Roommate Post**
- **Endpoint**: `/roommate-applications`  
- **Method**: `POST`  
- **Description**: Apply to a roommate post, submitting an application with preferences.  
- **Request Body**:
  ```json
  {
    "roommatePostId": "roommate_post_id",
    "preferences": {
      "gender": "female",
      "smoking": "no",
      "lifestyle": "quiet"
    }
  }
  ```

  **Fields**:
  - **roommatePostId**: The ID of the roommate post to which the user is applying.
  - **preferences**: User preferences for the application (gender, smoking, lifestyle).

- **Response** (201 - Created):
  ```json
  {
    "message": "Application submitted successfully",
    "applicationId": "application_id"
  }
  ```

- **Error Responses**:
  - **500 - Server Error**: Error submitting the application.
    ```json
    {
      "message": "Error submitting application",
      "error": "error_message"
    }
    ```

---

### Notes
- **Authentication**: All routes require user authentication via a JWT token. The `protect` middleware ensures that only authenticated users can create roommate posts and apply to them.
- **Matching Function**: The `matchProperties` function is used to find matching roommate posts based on the user's preferences. It takes into account various parameters like budget, location, and lifestyle.
- **Roommate Post Status**: The `status` of the roommate post can be "active", "inactive", or other states based on the business logic (e.g., once the post is filled, it might be set to "inactive").
- **GeoJSON Format for Location**: For queries that involve location (`preferredLocation`), the location should be provided in GeoJSON format:
  ```json
  {
    "type": "Point",
    "coordinates": [longitude, latitude]
  }
  ```