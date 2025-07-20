import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { propertyService } from '../../services/propertyService';
import { Property } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Property with location interface
 */
interface PropertyLocation {
  id: string;
  title: string;
  price: number;
  type: string;
  latitude: number;
  longitude: number;
  rating: number;
  isAvailable: boolean;
}

/**
 * Property Map Screen - Interactive map view of properties
 * Features: Map visualization, property markers, location-based search
 * Note: This is a placeholder for actual map implementation
 */
export const PropertyMapScreen = () => {
  const [properties, setProperties] = useState<PropertyLocation[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyLocation | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 34.0181,
    longitude: -6.8186,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  /**
   * Load properties with location data
   */
  useEffect(() => {
    loadPropertiesWithLocation();
  }, []);

  /**
   * Load properties with location data from API
   */
  const loadPropertiesWithLocation = async () => {
    try {
      // Load properties from real API
      const propertiesResponse = await propertyService.getProperties();
      
      if (propertiesResponse.data && propertiesResponse.data.length > 0) {
        // Transform API data to include location coordinates
        const transformedProperties: PropertyLocation[] = propertiesResponse.data
          .filter((property: Property) => property.location?.coordinates) // Only properties with coordinates
          .map((property: Property) => ({
            id: property._id,
            title: property.title,
            price: property.price,
            type: property.roomType || 'Property',
            latitude: property.location.coordinates.latitude,
            longitude: property.location.coordinates.longitude,
            rating: property.rating || 0,
            isAvailable: property.available,
          }));
        
        setProperties(transformedProperties);
        
        // Update map region to show all properties if available
        if (transformedProperties.length > 0) {
          const latitudes = transformedProperties.map(p => p.latitude);
          const longitudes = transformedProperties.map(p => p.longitude);
          
          const minLat = Math.min(...latitudes);
          const maxLat = Math.max(...latitudes);
          const minLng = Math.min(...longitudes);
          const maxLng = Math.max(...longitudes);
          
          const centerLat = (minLat + maxLat) / 2;
          const centerLng = (minLng + maxLng) / 2;
          const deltaLat = Math.max((maxLat - minLat) * 1.2, 0.01);
          const deltaLng = Math.max((maxLng - minLng) * 1.2, 0.01);
          
          setMapRegion({
            latitude: centerLat,
            longitude: centerLng,
            latitudeDelta: deltaLat,
            longitudeDelta: deltaLng,
          });
        }
      } else {
        setProperties([]);
        console.log('No properties with location data found');
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      Alert.alert('Error', 'Failed to load property locations');
    }
  };

  /**
   * Handle property marker selection
   */
  const handlePropertySelect = (property: PropertyLocation) => {
    setSelectedProperty(property);
    Alert.alert('Property Selected', `Selected: ${property.title}`);
    // TODO: Show property details overlay or navigate to details
  };

  /**
   * Handle map region change
   */
  const handleMapRegionChange = (region: any) => {
    setMapRegion(region);
  };

  /**
   * Handle location search
   */
  const handleLocationSearch = () => {
    Alert.alert('Location Search', 'Opening location search...');
    // TODO: Implement location search functionality
  };

  /**
   * Handle filter toggle
   */
  const handleFilterToggle = () => {
    Alert.alert('Filters', 'Opening map filters...');
    // TODO: Open map-specific filters
  };

  /**
   * Handle nearby search
   */
  const handleNearbySearch = () => {
    Alert.alert('Nearby Search', 'Searching for nearby properties...');
    // TODO: Search for properties near current location
  };

  /**
   * Render property marker
   */
  const renderPropertyMarker = (property: PropertyLocation) => (
    <TouchableOpacity
      key={property.id}
      onPress={() => handlePropertySelect(property)}
      className={`absolute bg-white rounded-full p-2 border-2 shadow-lg ${
        property.isAvailable ? 'border-green-500' : 'border-red-500'
      }`}
      style={{
        // Position marker based on coordinates (simplified positioning)
        left: (property.longitude + 6.8186) * SCREEN_WIDTH * 10,
        top: (34.0181 - property.latitude) * SCREEN_HEIGHT * 10 + 200,
      }}
    >
      <View className="items-center">
        <Text className="text-lg">🏠</Text>
        <View className={`px-2 py-1 rounded-full ${
          property.isAvailable ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <Text className="text-white text-xs font-bold">
            {property.price} MAD
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Animated.View 
        entering={FadeInUp.delay(200).duration(600)}
        className="px-6 pt-4 pb-2 bg-white border-b border-gray-100"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-gray-800">Map View</Text>
            <Text className="text-gray-600 text-lg">
              {properties.length} properties found
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleFilterToggle}
            className="bg-purple-500 p-3 rounded-full"
          >
            <Text className="text-white text-lg">🔧</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Map Container (Placeholder) */}
      <Animated.View 
        entering={FadeInDown.delay(300).duration(600)}
        className="flex-1 relative"
      >
        {/* Map Background */}
        <View className="flex-1 bg-gradient-to-br from-green-100 to-blue-100 relative">
          {/* Map Placeholder */}
          <View className="absolute inset-0 justify-center items-center">
            <View className="bg-white/90 p-8 rounded-2xl border border-gray-200 mx-6">
              <Text className="text-6xl text-center mb-4">🗺️</Text>
              <Text className="text-xl font-bold text-gray-800 text-center mb-2">
                Interactive Map
              </Text>
              <Text className="text-gray-600 text-center leading-6">
                This would show an interactive map with property locations.{'\n'}
                Integration with services like Leaflet or Google Maps.
              </Text>
            </View>
          </View>

          {/* Property Markers */}
          {properties.map(property => renderPropertyMarker(property))}

          {/* Map Controls */}
          <View className="absolute top-4 right-4 space-y-2">
            <TouchableOpacity
              onPress={handleLocationSearch}
              className="bg-white p-3 rounded-full shadow-lg border border-gray-200"
            >
              <Text className="text-lg">🔍</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleNearbySearch}
              className="bg-white p-3 rounded-full shadow-lg border border-gray-200"
            >
              <Text className="text-lg">📍</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Selected Property Details */}
      {selectedProperty && (
        <Animated.View 
          entering={FadeInUp.delay(500).duration(600)}
          className="bg-white border-t border-gray-200 p-6"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-800 mb-1">
                {selectedProperty.title}
              </Text>
              <Text className="text-2xl font-bold text-purple-600 mb-2">
                {selectedProperty.price} MAD
              </Text>
              <View className="flex-row items-center">
                <Text className="text-yellow-500 mr-1">⭐</Text>
                <Text className="text-gray-700 font-medium">{selectedProperty.rating}</Text>
                <View className="bg-blue-50 px-2 py-1 rounded-full ml-3">
                  <Text className="text-blue-600 text-sm font-medium">
                    {selectedProperty.type}
                  </Text>
                </View>
              </View>
            </View>
            
            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={() => setSelectedProperty(null)}
                className="bg-gray-100 p-3 rounded-full"
              >
                <Text className="text-gray-600">✕</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => Alert.alert('View Details', `Opening details for ${selectedProperty.title}`)}
                className="bg-purple-500 px-6 py-3 rounded-full"
              >
                <Text className="text-white font-bold">View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Bottom Action Bar */}
      <Animated.View 
        entering={FadeInUp.delay(600).duration(600)}
        className="bg-white border-t border-gray-200 p-4"
      >
        <View className="flex-row justify-around">
          <TouchableOpacity
            onPress={() => Alert.alert('List View', 'Switching to list view...')}
            className="items-center"
          >
            <Text className="text-2xl mb-1">📋</Text>
            <Text className="text-gray-600 text-sm font-medium">List View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => Alert.alert('Favorites', 'Opening favorites...')}
            className="items-center"
          >
            <Text className="text-2xl mb-1">❤️</Text>
            <Text className="text-gray-600 text-sm font-medium">Favorites</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => Alert.alert('Search', 'Opening search...')}
            className="items-center"
          >
            <Text className="text-2xl mb-1">🔍</Text>
            <Text className="text-gray-600 text-sm font-medium">Search</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => Alert.alert('AI Match', 'Opening AI recommendations...')}
            className="items-center"
          >
            <Text className="text-2xl mb-1">🤖</Text>
            <Text className="text-gray-600 text-sm font-medium">AI Match</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default PropertyMapScreen;
