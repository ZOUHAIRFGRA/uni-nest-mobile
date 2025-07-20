

# **Tenant Application API Documentation**

## **1. Create Tenant Application**
- **Endpoint**: `POST /api/tenant-applications`
- **Description**: Allows a tenant to submit an application for a property.
- **Access**: Protected (requires user authentication)
- **Request Body**:
  ```json
  {
    "propertyId": "ObjectId", // Required: The property to which the application is being submitted.
    "message": "string" // Optional: A message from the tenant to the landlord.
  }
  ```
- **Response**:
  - **201 Created**:
    ```json
    {
      "message": "Application submitted successfully",
      "newApplication": {
        "_id": "ObjectId",
        "propertyId": "ObjectId",
        "tenantId": "ObjectId",
        "message": "string",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    }
    ```
  - **400 Bad Request**:
    ```json
    {
      "message": "You have already applied to this property"
    }
    ```
  - **404 Not Found**:
    ```json
    {
      "message": "Property not found"
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "message": "Error creating application",
      "error": "Error details"
    }
    ```

---

## **2. Get All Applications for a Property (Landlord View)**
- **Endpoint**: `GET /api/tenant-applications/:propertyId`
- **Description**: Allows a landlord to view all applications for a specific property.
- **Access**: Protected (requires user authentication, landlord authorization check may be added)
- **Path Parameters**:
  - `propertyId`: **Required**. The ID of the property for which the landlord wants to view applications.
- **Response**:
  - **200 OK**:
    ```json
    [
      {
        "_id": "ObjectId",
        "propertyId": "ObjectId",
        "tenantId": "ObjectId",
        "message": "string",
        "status": "pending", // or "approved" or "rejected"
        "createdAt": "timestamp",
        "updatedAt": "timestamp",
        "tenantId": {
          "name": "string",
          "email": "string"
        }
      }
    ]
    ```
  - **404 Not Found**:
    ```json
    {
      "message": "No applications found for this property"
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "message": "Error fetching applications",
      "error": "Error details"
    }
    ```

---

## **3. Update Application Status (Approve/Reject)**
- **Endpoint**: `PUT /api/tenant-applications/:applicationId/status`
- **Description**: Allows a landlord to update the status of a tenant application (approve or reject).
- **Access**: Protected (requires user authentication, landlord authorization check may be added)
- **Path Parameters**:
  - `applicationId`: **Required**. The ID of the application to update.
- **Request Body**:
  ```json
  {
    "status": "string" // Required: Status of the application ("Approved" or "Rejected")
  }
  ```
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Application status updated",
      "updatedApplication": {
        "_id": "ObjectId",
        "propertyId": "ObjectId",
        "tenantId": "ObjectId",
        "message": "string",
        "status": "Approved", // or "Rejected"
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    }
    ```
  - **400 Bad Request**:
    ```json
    {
      "message": "Invalid status value"
    }
    ```
  - **404 Not Found**:
    ```json
    {
      "message": "Application not found"
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "message": "Error updating application status",
      "error": "Error details"
    }
    ```

---

## **4. Get Tenant Applications (Tenant View)**
- **Endpoint**: `GET /api/tenant-applications`
- **Description**: Allows a tenant to view all their applications.
- **Access**: Protected (requires user authentication)
- **Response**:
  - **200 OK**:
    ```json
    [
      {
        "_id": "ObjectId",
        "propertyId": "ObjectId",
        "tenantId": "ObjectId",
        "message": "string",
        "status": "pending", // or "approved" or "rejected"
        "createdAt": "timestamp",
        "updatedAt": "timestamp",
        "propertyId": {
          "title": "string",
          "location": "string",
          "price": "number"
        }
      }
    ]
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "message": "Error fetching tenant applications",
      "error": "Error details"
    }
    ```

---

### **General Error Responses**

- **400 Bad Request**:
  ```json
  {
    "message": "Description of the error"
  }
  ```

- **404 Not Found**:
  ```json
  {
    "message": "Requested resource not found"
  }
  ```

- **500 Internal Server Error**:
  ```json
  {
    "message": "Internal server error",
    "error": "Error details"
  }
  ```

---

### **Notes**
- All endpoints are protected and require user authentication via the `protect` middleware.
- Validation for the request body (e.g., valid `status` in the update application route) and authorization (ensuring that landlords can only update applications for their own properties) is expected but might not be fully implemented.
- The `status` for applications can be either **"pending"**, **"approved"**, or **"rejected"**.

