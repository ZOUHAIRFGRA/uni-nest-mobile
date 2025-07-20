# Location Routes Documentation

## Base URL
- **Development:** `http://localhost:5000/api/location`
- **Production:** `https://uni-nest.vercel.app/api/location`

## Overview
Location services powered by **Leaflet** and **OpenStreetMap** - completely free with no API keys required. Provides geocoding, reverse geocoding, distance calculations, and points of interest discovery.

---

## Endpoints

### 1. **Get Map Configuration**
- **Endpoint**: `/config`  
- **Method**: `GET`  
- **Description**: Get map configuration for frontend integration.
- **Authentication**: Not required
- **Query Parameters**:
  | Parameter | Type | Description |
  |-----------|------|-------------|
  | `provider` | `string` | Tile provider: `openStreetMap`, `cartoDB`, `openTopoMap` |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "config": {
      "tileLayer": {
        "url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "attribution": "© OpenStreetMap contributors",
        "maxZoom": 18,
        "minZoom": 1
      },
      "defaultView": {
        "center": [31.7917, -7.0926],
        "zoom": 13
      },
      "bounds": [
        [35.9224, -1.0067],
        [27.6621, -13.1681]
      ]
    }
  }
  ```

---

### 2. **Geocode Address**
- **Endpoint**: `/geocode`  
- **Method**: `POST`  
- **Description**: Convert address string to coordinates.
- **Authentication**: Not required
- **Headers**: 
  - `Content-Type: application/json`
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `address` | `string` | Yes | Address to geocode |
  | `country` | `string` | No | Country code (default: 'MA' for Morocco) |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "result": {
      "lat": 33.5731,
      "lng": -7.5898,
      "display_name": "Hassan II University, Casablanca, Grand Casablanca, Morocco",
      "coordinates": [-7.5898, 33.5731]
    }
  }
  ```

- **Error Response** (400 - Bad Request):
  ```json
  {
    "success": false,
    "message": "Geocoding failed",
    "error": "Address not found"
  }
  ```

---

### 3. **Reverse Geocode**
- **Endpoint**: `/reverse-geocode`  
- **Method**: `POST`  
- **Description**: Convert coordinates to human-readable address.
- **Authentication**: Not required
- **Headers**: 
  - `Content-Type: application/json`
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `lat` | `number` | Yes | Latitude |
  | `lng` | `number` | Yes | Longitude |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "address": "Avenue des Nations Unies, Casablanca, Grand Casablanca, Morocco"
  }
  ```

---

### 4. **Calculate Distance**
- **Endpoint**: `/distance`  
- **Method**: `POST`  
- **Description**: Calculate distance between two points using Haversine formula.
- **Authentication**: Not required
- **Headers**: 
  - `Content-Type: application/json`
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `origin` | `array` | Yes | Origin coordinates [lng, lat] |
  | `destination` | `array` | Yes | Destination coordinates [lng, lat] |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "distance": {
      "kilometers": 2.45,
      "meters": 2450
    }
  }
  ```

---

### 5. **Find Nearby Points of Interest**
- **Endpoint**: `/nearby-pois`  
- **Method**: `POST`  
- **Description**: Find nearby amenities and points of interest using Overpass API.
- **Authentication**: Not required
- **Headers**: 
  - `Content-Type: application/json`
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `coordinates` | `array` | Yes | Center coordinates [lng, lat] |
  | `radius` | `number` | No | Search radius in kilometers (default: 1) |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "pois": [
      {
        "id": 123456789,
        "type": "university",
        "name": "Hassan II University",
        "coordinates": [-7.5898, 33.5731],
        "distance": 0.2,
        "tags": {
          "amenity": "university",
          "name": "Hassan II University",
          "website": "https://www.univh2c.ma"
        }
      },
      {
        "id": 123456790,
        "type": "restaurant",
        "name": "Restaurant Casablanca",
        "coordinates": [-7.5900, 33.5735],
        "distance": 0.5,
        "tags": {
          "amenity": "restaurant",
          "cuisine": "moroccan",
          "name": "Restaurant Casablanca"
        }
      }
    ],
    "metadata": {
      "center": [-7.5898, 33.5731],
      "radius": 1,
      "count": 2
    }
  }
  ```

---

### 6. **Find Properties in Radius**
- **Endpoint**: `/properties-in-radius`  
- **Method**: `POST`  
- **Description**: Find properties within a specified radius of coordinates.
- **Authentication**: Not required
- **Headers**: 
  - `Content-Type: application/json`
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `coordinates` | `array` | Yes | Center coordinates [lng, lat] |
  | `radius` | `number` | No | Search radius in kilometers (default: 5) |
  | `filters` | `object` | No | Additional property filters |

- **Filter Options**:
  ```json
  {
    "priceMin": 500,
    "priceMax": 2000,
    "utilitiesIncluded": true,
    "maxTenants": 4
  }
  ```

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "properties": [
      {
        "_id": "64f7b8c9d4e5f1234567890a",
        "title": "Student Apartment near University",
        "price": 800,
        "location": {
          "type": "Point",
          "coordinates": [-7.5900, 33.5735]
        },
        "distance": 0.8,
        "bearing": 45.5,
        "landlordId": {
          "firstName": "Ahmed",
          "lastName": "Ben Ali",
          "email": "ahmed@example.com"
        },
        "images": ["https://res.cloudinary.com/uninest/image/upload/v1/properties/img1.jpg"]
      }
    ],
    "metadata": {
      "center": [-7.5898, 33.5731],
      "radius": 5,
      "totalFound": 1,
      "filters": {
        "priceMax": 1000
      }
    }
  }
  ```

---

### 7. **Batch Geocode**
- **Endpoint**: `/batch-geocode`  
- **Method**: `POST`  
- **Description**: Geocode multiple addresses in a single request (max 10).
- **Authentication**: Required (to prevent abuse)
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body Parameters**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `addresses` | `array` | Yes | Array of address strings (max 10) |

- **Response** (200 - OK):
  ```json
  {
    "success": true,
    "results": [
      {
        "address": "Hassan II University, Casablanca",
        "success": true,
        "lat": 33.5731,
        "lng": -7.5898,
        "display_name": "Hassan II University, Casablanca, Morocco",
        "coordinates": [-7.5898, 33.5731]
      },
      {
        "address": "Invalid Address",
        "success": false,
        "error": "Address not found"
      }
    ]
  }
  ```

---

## Location Features

### Supported Amenity Types
The POI search supports these amenity types:
- **Education**: `university`, `school`
- **Healthcare**: `hospital`, `pharmacy`
- **Finance**: `bank`, `atm`
- **Food**: `restaurant`, `cafe`
- **Shopping**: `supermarket`, `shop`
- **Transport**: `bus_station`, `taxi_station`

### Coordinate Validation
- All coordinates are validated to be within Morocco bounds
- Latitude range: 27.6621 to 35.9224
- Longitude range: -13.1681 to -1.0067

### Rate Limiting
- Geocoding requests are rate-limited to respect Nominatim usage policy
- 1 request per second for batch geocoding
- No rate limits for other endpoints

## Map Integration Examples

### Frontend JavaScript Integration
```javascript
// Get map configuration
const mapConfig = await fetch('/api/location/config').then(r => r.json());

// Initialize Leaflet map
const map = L.map('map').setView(
  mapConfig.config.defaultView.center, 
  mapConfig.config.defaultView.zoom
);

// Add tile layer
L.tileLayer(mapConfig.config.tileLayer.url, {
  attribution: mapConfig.config.tileLayer.attribution,
  maxZoom: mapConfig.config.tileLayer.maxZoom
}).addTo(map);

// Geocode address
const geocodeAddress = async (address) => {
  const response = await fetch('/api/location/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  return response.json();
};

// Find properties near location
const findNearbyProperties = async (coordinates, radius = 5) => {
  const response = await fetch('/api/location/properties-in-radius', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinates, radius })
  });
  return response.json();
};
```

### React Native Integration
```javascript
import MapView, { Marker } from 'react-native-maps';

// Use the map configuration
const MapComponent = () => {
  const [mapConfig, setMapConfig] = useState(null);
  
  useEffect(() => {
    fetch('/api/location/config')
      .then(r => r.json())
      .then(data => setMapConfig(data.config));
  }, []);

  if (!mapConfig) return <Loading />;

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: mapConfig.defaultView.center[0],
        longitude: mapConfig.defaultView.center[1],
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
    >
      {/* Your markers here */}
    </MapView>
  );
};
```

## Error Responses

### Common Error Codes:
- `INVALID_COORDINATES` - Coordinates outside Morocco bounds
- `GEOCODING_FAILED` - Address not found or service unavailable
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INVALID_ADDRESS_FORMAT` - Malformed address input

### Status Codes:
- `200` - Success
- `400` - Bad request / Invalid input
- `401` - Unauthorized (for protected endpoints)
- `429` - Rate limit exceeded
- `500` - Internal server error
