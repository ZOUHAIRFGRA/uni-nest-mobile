
# **Review API Documentation**

## **1. Add a New Review**
- **Endpoint**: `POST /api/reviews`
- **Description**: Allows a tenant to add a review for a property, including a rating and review text.
- **Access**: Protected (requires user authentication, tenant authorization check may be added)
- **Request Body**:
  ```json
  {
    "propertyId": "ObjectId", // Required: The property ID to review.
    "rating": "number", // Required: Rating for the property, usually between 1 and 5.
    "reviewText": "string" // Optional: Review text to describe the experience.
  }
  ```
- **Response**:
  - **201 Created**:
    ```json
    {
      "message": "Review added successfully",
      "review": {
        "_id": "ObjectId",
        "tenantId": "ObjectId",
        "propertyId": "ObjectId",
        "rating": 4, // Rating value
        "reviewText": "This property is great!", // Review content
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
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
      "message": "Error adding review",
      "error": "Error details"
    }
    ```

---

## **2. Get All Reviews for a Specific Property**
- **Endpoint**: `GET /api/reviews/:propertyId`
- **Description**: Allows anyone to view all reviews for a specific property.
- **Access**: Public (anyone can view reviews for a property)
- **Path Parameters**:
  - `propertyId`: **Required**. The ID of the property for which the reviews are being requested.
- **Response**:
  - **200 OK**:
    ```json
    [
      {
        "_id": "ObjectId",
        "tenantId": "ObjectId",
        "propertyId": "ObjectId",
        "rating": 4, // Rating for the property
        "reviewText": "This property is great!", // Review content
        "createdAt": "timestamp",
        "updatedAt": "timestamp",
        "tenantId": {
          "name": "John Doe" // Name of the tenant who wrote the review
        }
      }
    ]
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "message": "Error fetching reviews",
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
- All endpoints that modify data (e.g., adding a review) are protected and require user authentication via the `protect` middleware.
- **Review Rating**: The `rating` field in the review is expected to be a number, typically between 1 and 5.
- **Review Text**: The `reviewText` is optional and can contain feedback from the tenant about the property.
- **Public Access to Reviews**: The endpoint for fetching reviews for a property is public, meaning anyone can view reviews, but adding a review is restricted to authenticated tenants.

