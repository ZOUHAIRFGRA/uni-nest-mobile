

# Property Routes Documentation

## Base URL
- **Development:** `http://localhost:5000/api`
- **Production:** `https://uni-nest.vercel.app/api`

## Authentication
- **Most routes require authentication**. Use a valid JWT token in the `Authorization` header: `Bearer <token>`

---

## Endpoints

### 1. **Create a Property**
- **Endpoint**: `/properties`  
- **Method**: `POST`  
- **Description**: Create a new property listing with image upload support.
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Body Parameters** (Form Data):
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `title` | `string` | Yes | Property title |
  | `description` | `string` | Yes | Property description |
  | `price` | `number` | Yes | Monthly rent price |
  | `maxTenants` | `number` | Yes | Maximum number of tenants |
  | `utilitiesIncluded` | `boolean` | Yes | Whether utilities are included |
  | `distanceToUniversity` | `number` | Yes | Distance to university in km |
  | `distanceToBusStop` | `number` | Yes | Distance to bus stop in km |
  | `location` | `string` | Yes | GeoJSON Point as string: `'{"type": "Point", "coordinates": [lng, lat]}'` |
  | `images` | `file[]` | No | Up to 5 property images |

- **Response** (201 - Created):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "title": "Beautiful Student Apartment",
      "description": "Modern 2-bedroom apartment near university",
      "price": 1000,
      "maxTenants": 3,
      "utilitiesIncluded": true,
      "distanceToUniversity": 1.5,
      "distanceToBusStop": 0.5,
      "location": {
        "type": "Point",
        "coordinates": [-7.5898, 33.5731]
      },
      "images": [
        "https://res.cloudinary.com/uninest/image/upload/v1/properties/img1.jpg",
        "https://res.cloudinary.com/uninest/image/upload/v1/properties/img2.jpg"
      ],
      "landlordId": "64f7b8c9d4e5f1234567890b",
      "isRented": false,
      "createdAt": "2025-01-10T10:30:00.000Z",
      "updatedAt": "2025-01-10T10:30:00.000Z"
    }
  }
  ```

---

### 2. **Get All Properties with Pagination**
- **Endpoint**: `/properties`  
- **Method**: `GET`  
- **Description**: Get a paginated list of all properties.
- **Authentication**: Not required
- **Query Parameters**:
  | Parameter | Type | Default | Description |
  |-----------|------|---------|-------------|
  | `page` | `number` | 1 | Page number |
  | `limit` | `number` | 10 | Properties per page |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "properties": [
        {
          "_id": "64f7b8c9d4e5f1234567890a",
          "title": "Beautiful Student Apartment",
          "price": 1000,
          "location": {
            "type": "Point",
            "coordinates": [-7.5898, 33.5731]
          },
          "images": ["https://res.cloudinary.com/uninest/image/upload/v1/properties/img1.jpg"],
          "landlordId": {
            "_id": "64f7b8c9d4e5f1234567890b",
            "firstName": "Ahmed",
            "lastName": "Ben Ali",
            "email": "ahmed@example.com"
          },
          "isRented": false,
          "createdAt": "2025-01-10T10:30:00.000Z"
        }
      ],
      "pagination": {
        "total": 45,
        "page": 1,
        "limit": 10,
        "totalPages": 5,
        "hasNext": true,
        "hasPrev": false
      }
    }
  }
  ```

---

### 3. **Enhanced Search and Filter Properties**
- **Endpoint**: `/properties/search`  
- **Method**: `GET`  
- **Description**: Search and filter properties with advanced location-based features using Leaflet/OpenStreetMap.
- **Authentication**: Not required
- **Query Parameters**:
  | Parameter | Type | Description |
  |-----------|------|-------------|
  | `priceMin` | `number` | Minimum price filter |
  | `priceMax` | `number` | Maximum price filter |
  | `location` | `string` | GeoJSON coordinates: `'[lng, lat]'` |
  | `address` | `string` | Address string (will be geocoded automatically) |
  | `radius` | `number` | Search radius in kilometers (default: 5) |
  | `utilitiesIncluded` | `boolean` | Filter by utilities inclusion |
  | `keyword` | `string` | Search in title/description |
  | `nearUniversity` | `boolean` | Filter properties near university |
  | `maxTenants` | `number` | Maximum tenants filter |
  | `sortBy` | `string` | Sort by: `price`, `distance`, `createdAt` |
  | `sortOrder` | `string` | Sort order: `asc`, `desc` |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "properties": [
        {
          "_id": "64f7b8c9d4e5f1234567890a",
          "title": "Student Apartment near Hassan II University",
          "price": 800,
          "location": {
            "type": "Point",
            "coordinates": [-7.5898, 33.5731]
          },
          "searchContext": {
            "distanceFromSearch": 0.8,
            "bearing": 45.5
          },
          "distance": 0.8,
          "bearing": 45.5,
          "landlordId": {
            "firstName": "Ahmed",
            "lastName": "Ben Ali",
            "email": "ahmed@example.com"
          }
        }
      ],
      "metadata": {
        "total": 12,
        "searchCriteria": {
          "priceRange": { "min": 500, "max": 1000 },
          "location": {
            "center": [-7.5898, 33.5731],
            "radius": 5,
            "address": "Hassan II University, Casablanca"
          },
          "sorting": {
            "field": "distance",
            "order": "asc"
          }
        }
      }
    }
  }
  ```

---

### 4. **Get a Property by ID**
- **Endpoint**: `/properties/:id`  
- **Method**: `GET`  
- **Description**: Retrieve detailed information about a specific property.
- **Authentication**: Not required
- **URL Parameters**:
  - `id` (string): Property ID

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "title": "Beautiful Student Apartment",
      "description": "Modern 2-bedroom apartment with great amenities",
      "price": 1000,
      "maxTenants": 3,
      "utilitiesIncluded": true,
      "distanceToUniversity": 1.5,
      "distanceToBusStop": 0.5,
      "location": {
        "type": "Point",
        "coordinates": [-7.5898, 33.5731]
      },
      "images": [
        "https://res.cloudinary.com/uninest/image/upload/v1/properties/img1.jpg",
        "https://res.cloudinary.com/uninest/image/upload/v1/properties/img2.jpg"
      ],
      "landlordId": {
        "_id": "64f7b8c9d4e5f1234567890b",
        "firstName": "Ahmed",
        "lastName": "Ben Ali",
        "email": "ahmed@example.com",
        "phone": "+212600123456",
        "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile1.jpg"
      },
      "isRented": false,
      "createdAt": "2025-01-10T10:30:00.000Z",
      "updatedAt": "2025-01-10T10:30:00.000Z"
    }
  }
  ```

---

### 5. **Update a Property**
- **Endpoint**: `/properties/:id`  
- **Method**: `PUT`  
- **Description**: Update property details. Only property owner can update.
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **URL Parameters**:
  - `id` (string): Property ID
- **Body Parameters** (Form Data - all optional):
  | Field | Type | Description |
  |-------|------|-------------|
  | `title` | `string` | Updated property title |
  | `description` | `string` | Updated description |
  | `price` | `number` | Updated monthly rent |
  | `maxTenants` | `number` | Updated max tenants |
  | `utilitiesIncluded` | `boolean` | Updated utilities inclusion |
  | `distanceToUniversity` | `number` | Updated distance to university |
  | `distanceToBusStop` | `number` | Updated distance to bus stop |
  | `location` | `string` | Updated GeoJSON location |
  | `images` | `file[]` | New property images (replaces existing) |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "title": "Updated Property Title",
      "description": "Updated description",
      "price": 1200,
      "maxTenants": 4,
      "utilitiesIncluded": false,
      "distanceToUniversity": 2.0,
      "distanceToBusStop": 1.0,
      "location": {
        "type": "Point",
        "coordinates": [-7.5900, 33.5740]
      },
      "images": ["updated_image_url_1", "updated_image_url_2"],
      "landlordId": "64f7b8c9d4e5f1234567890b",
      "isRented": false,
      "createdAt": "2025-01-10T10:30:00.000Z",
      "updatedAt": "2025-01-10T11:45:00.000Z"
    }
  }
  ```

---

### 6. **Delete a Property**
- **Endpoint**: `/properties/:id`  
- **Method**: `DELETE`  
- **Description**: Delete a property listing. Only property owner can delete.
- **Headers**: 
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `id` (string): Property ID

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "message": "Property deleted successfully"
  }
  ```

---

### 7. **Mark a Property as Rented**
- **Endpoint**: `/properties/:id/rent`  
- **Method**: `PATCH`  
- **Description**: Mark a property as rented. Only property owner can update status.
- **Headers**: 
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `id` (string): Property ID

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "message": "Property marked as rented",
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "title": "Beautiful Student Apartment",
      "isRented": true,
      "updatedAt": "2025-01-10T12:00:00.000Z"
    }
  }
  ```

---

### 8. **Get Properties by Landlord**
- **Endpoint**: `/landlord/properties`  
- **Method**: `GET`  
- **Description**: Get all properties listed by the authenticated landlord.
- **Headers**: 
  - `Authorization: Bearer <token>`

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "64f7b8c9d4e5f1234567890a",
        "title": "Beautiful Student Apartment",
        "price": 1000,
        "location": {
          "type": "Point",
          "coordinates": [-7.5898, 33.5731]
        },
        "images": ["https://res.cloudinary.com/uninest/image/upload/v1/properties/img1.jpg"],
        "isRented": false,
        "createdAt": "2025-01-10T10:30:00.000Z",
        "bookings": 3,
        "views": 45
      }
    ]
  }
  ```

---

## Important Notes

### Location & Mapping
- **Coordinates Format**: Always use GeoJSON format with `[longitude, latitude]` order
- **Mapping Service**: Uses Leaflet with OpenStreetMap (free, no API key required)
- **Address Geocoding**: Automatic address-to-coordinates conversion available
- **Search Radius**: Distance-based search with customizable radius
- **Morocco Bounds**: All coordinates validated to be within Morocco boundaries

### Image Upload
- **Maximum**: 5 images per property
- **Formats**: JPG, PNG, WebP supported  
- **Storage**: Cloudinary integration for optimized delivery
- **Size**: Automatic compression and optimization

### Error Responses
All endpoints may return these error formats:
```json
{
  "success": false,
  "error": "Error message description",
  "details": "Additional error details (in development mode)"
}
```

### Status Codes
- `200` - Success
- `201` - Created successfully  
- `400` - Bad request / Validation error
- `401` - Unauthorized / Invalid token
- `403` - Forbidden / Insufficient permissions
- `404` - Resource not found
- `500` - Internal server error

