# Leaflet Integration Guide

## Overview

UniNest has been migrated from Google Maps to Leaflet with OpenStreetMap for location features. This change provides:

- **Free and Open Source**: No API keys or usage limits
- **High Quality Maps**: OpenStreetMap data with regular updates
- **Multiple Tile Providers**: Support for various map styles
- **Enhanced Features**: Geocoding, reverse geocoding, and POI search

## Backend Configuration

### Environment Variables

```bash
# Leaflet Configuration (optional - uses defaults if not set)
LEAFLET_TILE_SERVER=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
LEAFLET_ATTRIBUTION=© OpenStreetMap contributors
```

### Map Configuration

The system provides map configuration through `/api/location/config`:

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

## API Endpoints

### Location Services

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/location/config` | GET | Get map configuration |
| `/api/location/geocode` | POST | Convert address to coordinates |
| `/api/location/reverse-geocode` | POST | Convert coordinates to address |
| `/api/location/distance` | POST | Calculate distance between points |
| `/api/location/nearby-pois` | POST | Find nearby points of interest |
| `/api/location/properties-in-radius` | POST | Find properties within radius |
| `/api/location/batch-geocode` | POST | Geocode multiple addresses |

### Enhanced Property Search

The property search endpoint now supports:

```bash
GET /api/properties/search?address=Casablanca&radius=10&sortBy=distance
```

Parameters:
- `address`: Search by address string (will be geocoded)
- `radius`: Search radius in kilometers (default: 5km)
- `location`: Direct coordinates search
- `sortBy`: Sort by `price`, `distance`, or `createdAt`
- `sortOrder`: `asc` or `desc`

## Geocoding Services

### Address to Coordinates

```javascript
// Request
POST /api/location/geocode
{
  "address": "Hassan II University, Casablanca",
  "country": "MA"
}

// Response
{
  "success": true,
  "result": {
    "lat": 33.5731,
    "lng": -7.5898,
    "display_name": "Hassan II University, Casablanca, Morocco",
    "coordinates": [-7.5898, 33.5731]
  }
}
```

### Coordinates to Address

```javascript
// Request
POST /api/location/reverse-geocode
{
  "lat": 33.5731,
  "lng": -7.5898
}

// Response
{
  "success": true,
  "address": "Hassan II University, Casablanca, Morocco"
}
```

## Frontend Integration

### React/React Native with Leaflet

```javascript
import L from 'leaflet';

// Get map configuration
const response = await fetch('/api/location/config');
const { config } = await response.json();

// Initialize map
const map = L.map('map').setView(
  config.defaultView.center, 
  config.defaultView.zoom
);

// Add tile layer
L.tileLayer(config.tileLayer.url, {
  attribution: config.tileLayer.attribution,
  maxZoom: config.tileLayer.maxZoom
}).addTo(map);
```

### Property Search with Location

```javascript
// Search properties near an address
const searchProperties = async (address, radius = 5) => {
  const response = await fetch('/api/properties/search?' + new URLSearchParams({
    address,
    radius,
    sortBy: 'distance'
  }));
  
  const data = await response.json();
  return data.properties;
};

// Search properties near coordinates
const searchNearCoordinates = async (lat, lng, radius = 5) => {
  const location = JSON.stringify([lng, lat]); // GeoJSON format
  const response = await fetch('/api/properties/search?' + new URLSearchParams({
    location,
    radius,
    sortBy: 'distance'
  }));
  
  return response.json();
};
```

## Tile Providers

### Available Providers

1. **OpenStreetMap** (Default)
   - Free and open source
   - Good coverage for Morocco
   - Regular updates

2. **CartoDB**
   - Clean, minimal design
   - Good for modern applications

3. **OpenTopoMap**
   - Topographic maps
   - Good for outdoor/terrain features

### Custom Tile Provider

```javascript
// Add custom tile provider in leaflet.js config
customProvider: {
  url: "https://your-custom-tiles.com/{z}/{x}/{y}.png",
  attribution: "© Your Custom Provider"
}
```

## Location Validation

All coordinates are validated to ensure they're within Morocco's bounds:

```javascript
const isValidMoroccoCoordinates = (lat, lng) => {
  return lat >= 27.6621 && lat <= 35.9224 && 
         lng >= -13.1681 && lng <= -1.0067;
};
```

## Points of Interest (POI)

Find nearby amenities using Overpass API:

```javascript
// Request
POST /api/location/nearby-pois
{
  "coordinates": [-7.5898, 33.5731],
  "radius": 1
}

// Response
{
  "success": true,
  "pois": [
    {
      "id": 123456,
      "type": "university",
      "name": "Hassan II University",
      "coordinates": [-7.5898, 33.5731],
      "distance": 0.2,
      "tags": {
        "amenity": "university",
        "name": "Hassan II University"
      }
    }
  ]
}
```

## Migration Benefits

1. **Cost Savings**: No Google Maps API costs
2. **No Rate Limits**: OpenStreetMap services are free
3. **Privacy**: No tracking by Google
4. **Customization**: Full control over map styling
5. **Open Data**: Community-driven map data

## Best Practices

1. **Rate Limiting**: Respect Nominatim's usage policy (1 request/second)
2. **Caching**: Cache geocoding results to reduce API calls
3. **Fallbacks**: Handle cases where geocoding fails
4. **User-Agent**: Always include proper User-Agent header
5. **Validation**: Validate coordinates are within expected bounds

## Error Handling

Common error scenarios and solutions:

```javascript
try {
  const result = await geocodeAddress(address);
} catch (error) {
  if (error.message === 'Address not found') {
    // Handle invalid address
  } else if (error.message === 'Address is outside Morocco bounds') {
    // Handle out-of-bounds address
  } else {
    // Handle other geocoding errors
  }
}
```

## Performance Optimization

1. **Batch Operations**: Use batch geocoding for multiple addresses
2. **Debounced Search**: Implement search debouncing on frontend
3. **Result Caching**: Cache frequently searched locations
4. **Lazy Loading**: Load maps only when needed

This migration provides a robust, free, and feature-rich mapping solution for UniNest's location-based features.
