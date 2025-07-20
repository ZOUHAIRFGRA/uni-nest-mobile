# Matching Routes Documentation

## Base URL
- **Development:** `http://localhost:5000/api/matching`
- **Production:** `https://uni-nest.vercel.app/api/matching`

## Authentication
- **All routes require authentication**. Use a valid JWT token in the `Authorization` header: `Bearer <token>`

---

## Overview
AI-powered matching system that connects students with compatible properties and roommates based on preferences, location, budget, and lifestyle factors.

## Endpoints

### 1. **Get User Matches**
- **Endpoint**: `/`  
- **Method**: `GET`  
- **Description**: Get personalized matches for the authenticated user.
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  | Parameter | Type | Description |
  |-----------|------|-------------|
  | `type` | `string` | Match type: `properties`, `roommates`, `all` (default: all) |
  | `limit` | `number` | Number of matches to return (default: 10) |
  | `minScore` | `number` | Minimum compatibility score (0-1, default: 0.6) |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "properties": [
        {
          "_id": "64f7b8c9d4e5f1234567890a",
          "property": {
            "_id": "64f7b8c9d4e5f1234567890b",
            "title": "Modern Student Apartment",
            "price": 800,
            "location": {
              "type": "Point",
              "coordinates": [-7.5898, 33.5731]
            },
            "images": ["https://res.cloudinary.com/uninest/image/upload/v1/properties/img1.jpg"],
            "landlordId": {
              "firstName": "Ahmed",
              "lastName": "Ben Ali"
            }
          },
          "compatibilityScore": 0.85,
          "matchFactors": {
            "budget": 0.9,
            "location": 0.8,
            "amenities": 0.85,
            "roomType": 0.9
          },
          "reasons": [
            "Perfect budget match",
            "Close to preferred university",
            "Includes preferred amenities"
          ],
          "distance": 1.2,
          "createdAt": "2025-01-10T10:30:00.000Z"
        }
      ],
      "roommates": [
        {
          "_id": "64f7b8c9d4e5f1234567890c",
          "user": {
            "_id": "64f7b8c9d4e5f1234567890d",
            "firstName": "Youssef",
            "lastName": "El Mansouri",
            "profileImage": "https://res.cloudinary.com/uninest/image/upload/v1/users/profile1.jpg",
            "preferences": {
              "budget": { "min": 700, "max": 1000 },
              "location": "Casablanca",
              "lifestyle": {
                "smoking": false,
                "pets": false,
                "studyHabits": "quiet"
              }
            }
          },
          "compatibilityScore": 0.78,
          "matchFactors": {
            "budget": 0.9,
            "lifestyle": 0.7,
            "location": 0.75,
            "studyHabits": 0.8
          },
          "reasons": [
            "Compatible budget range",
            "Similar study habits",
            "Same preferred location"
          ],
          "createdAt": "2025-01-10T10:30:00.000Z"
        }
      ],
      "metadata": {
        "totalProperties": 15,
        "totalRoommates": 8,
        "averageScore": 0.72,
        "lastUpdated": "2025-01-10T10:30:00.000Z"
      }
    }
  }
  ```

---

### 2. **Generate New Recommendations**
- **Endpoint**: `/generate/:type`  
- **Method**: `POST`  
- **Description**: Generate fresh recommendations based on updated preferences.
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **URL Parameters**:
  - `type` (string): `properties` or `roommates`
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `preferences` | `object` | No | Updated user preferences |
  | `filters` | `object` | No | Additional filtering criteria |
  | `forceRefresh` | `boolean` | No | Force recalculation (default: false) |

- **Preference Structure**:
  ```json
  {
    "budget": {
      "min": 500,
      "max": 1200
    },
    "location": {
      "preferredAreas": ["Casablanca", "Rabat"],
      "maxCommuteTime": 30
    },
    "roomType": "shared",
    "amenities": {
      "wifi": true,
      "parking": false,
      "gym": true
    },
    "lifestyle": {
      "smoking": false,
      "pets": false,
      "studyHabits": "quiet",
      "socialLevel": "moderate"
    }
  }
  ```

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "matches": [
        {
          "_id": "64f7b8c9d4e5f1234567890a",
          "compatibilityScore": 0.88,
          "isNew": true,
          "property": {
            "title": "Perfect Student Apartment",
            "price": 900,
            "location": {
              "type": "Point",
              "coordinates": [-7.5898, 33.5731]
            }
          },
          "matchFactors": {
            "budget": 0.95,
            "location": 0.85,
            "amenities": 0.9,
            "roomType": 0.8
          }
        }
      ],
      "metadata": {
        "generated": 12,
        "improved": 8,
        "algorithm": "AI_ENHANCED_V2",
        "timestamp": "2025-01-10T11:00:00.000Z"
      }
    }
  }
  ```

---

### 3. **Update Match Status**
- **Endpoint**: `/:id/status`  
- **Method**: `PATCH`  
- **Description**: Update match status (like, dislike, saved, contacted).
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **URL Parameters**:
  - `id` (string): Match ID
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `status` | `string` | Yes | `liked`, `disliked`, `saved`, `contacted`, `hidden` |
  | `notes` | `string` | No | Optional user notes |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "status": "liked",
      "notes": "Great location and price",
      "updatedAt": "2025-01-10T11:15:00.000Z"
    },
    "message": "Match status updated successfully"
  }
  ```

---

### 4. **Get Match Details**
- **Endpoint**: `/:id`  
- **Method**: `GET`  
- **Description**: Get detailed information about a specific match.
- **Headers**: 
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `id` (string): Match ID

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f7b8c9d4e5f1234567890a",
      "userId": "64f7b8c9d4e5f1234567890b",
      "targetId": "64f7b8c9d4e5f1234567890c",
      "targetType": "Property",
      "compatibilityScore": 0.85,
      "status": "liked",
      "target": {
        "_id": "64f7b8c9d4e5f1234567890c",
        "title": "Modern Student Apartment",
        "description": "Beautiful 2-bedroom apartment with all amenities",
        "price": 800,
        "location": {
          "type": "Point",
          "coordinates": [-7.5898, 33.5731]
        },
        "images": ["https://res.cloudinary.com/uninest/image/upload/v1/properties/img1.jpg"],
        "amenities": {
          "wifi": true,
          "parking": true,
          "gym": false,
          "laundry": true
        },
        "landlordId": {
          "firstName": "Ahmed",
          "lastName": "Ben Ali",
          "email": "ahmed@example.com",
          "phone": "+212600123456",
          "rating": 4.7,
          "reviewsCount": 23
        }
      },
      "matchFactors": {
        "budget": {
          "score": 0.9,
          "explanation": "Perfect fit within budget range"
        },
        "location": {
          "score": 0.8,
          "explanation": "1.2km from preferred university"
        },
        "amenities": {
          "score": 0.85,
          "explanation": "Has 4 out of 5 preferred amenities"
        },
        "roomType": {
          "score": 0.9,
          "explanation": "Matches preferred shared accommodation"
        }
      },
      "reasons": [
        "Excellent budget match (800 MAD vs 500-1000 MAD range)",
        "Close to Hassan II University (1.2km)",
        "Includes WiFi, parking, and laundry facilities",
        "Shared accommodation as preferred"
      ],
      "insights": {
        "costPerKm": 666.67,
        "amenityMatchPercentage": 80,
        "landlordTrustScore": 4.7,
        "averageResponseTime": "2 hours"
      },
      "interactions": [
        {
          "action": "viewed",
          "timestamp": "2025-01-10T10:30:00.000Z"
        },
        {
          "action": "liked",
          "timestamp": "2025-01-10T11:15:00.000Z"
        }
      ],
      "createdAt": "2025-01-10T10:30:00.000Z",
      "updatedAt": "2025-01-10T11:15:00.000Z"
    }
  }
  ```

---

## Match Algorithm Details

### Compatibility Scoring
The matching algorithm uses multiple factors to calculate compatibility scores:

1. **Budget Compatibility (Weight: 30%)**
   - Perfect match: Property price within user budget range
   - Penalty for prices outside range
   - Bonus for properties in middle of budget range

2. **Location Compatibility (Weight: 25%)**
   - Distance to preferred locations/university
   - Commute time considerations
   - Neighborhood preferences

3. **Amenities Compatibility (Weight: 20%)**
   - Match percentage of preferred amenities
   - Weighted by amenity importance

4. **Room Type Compatibility (Weight: 15%)**
   - Shared vs private preferences
   - Number of roommates preferences

5. **Lifestyle Compatibility (Weight: 10%)**
   - Study habits alignment
   - Social preferences
   - Smoking/pets policies

### Roommate Matching Factors
- **Budget Alignment**: Compatible budget ranges
- **Lifestyle Compatibility**: Study habits, social level, cleanliness
- **Location Preferences**: Preferred areas overlap
- **Personal Preferences**: Smoking, pets, gender preferences
- **Schedule Compatibility**: Study/work schedules

### AI Enhancement Features
- **Learning Algorithm**: Improves recommendations based on user feedback
- **Seasonal Adjustments**: Considers academic calendar and housing demand
- **Market Analysis**: Factors in pricing trends and availability
- **Behavioral Patterns**: Learns from user interaction patterns

## Status Management

### Match Statuses:
- **`new`** - Newly generated match
- **`viewed`** - User has viewed the match
- **`liked`** - User expressed interest
- **`disliked`** - User rejected the match
- **`saved`** - User saved for later review
- **`contacted`** - User contacted the landlord/roommate
- **`hidden`** - User chose to hide the match

### Interaction Tracking:
- View time and frequency
- User feedback integration
- Response rate tracking
- Conversion analytics

## Error Responses

### Common Errors:
```json
{
  "success": false,
  "error": "Insufficient user preferences for matching",
  "code": "INCOMPLETE_PROFILE"
}
```

```json
{
  "success": false,
  "error": "Match not found or access denied",
  "code": "MATCH_NOT_FOUND"
}
```

### Status Codes:
- `200` - Success
- `400` - Bad request / Invalid parameters
- `401` - Unauthorized / Invalid token
- `403` - Forbidden / Access denied
- `404` - Match not found
- `500` - Internal server error
