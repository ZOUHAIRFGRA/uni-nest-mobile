import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { propertyService } from '../../services/propertyService';
import { Property as ApiProperty } from '../../types';

/**
 * Property interface
 */
interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  images: string[];
  amenities: string[];
  rating: number;
  distance: string;
  isAvailable: boolean;
  compatibilityScore?: number;
}

/**
 * Property List Screen - Shows filtered property results
 * Features: Property cards, sorting, filtering, favorites
 */
export const PropertyListScreen = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'rating' | 'compatibility'>('compatibility');

  /**
   * Load properties on component mount
   */
  useEffect(() => {
    loadProperties();
  }, []);

  /**
   * Load properties from API
   */
  const loadProperties = async () => {
    try {
      setLoading(true);
      // Load properties from real API
      const propertiesResponse = await propertyService.getProperties();
      
      if (propertiesResponse.data && propertiesResponse.data.length > 0) {
        // Transform API data to match our interface
        const transformedProperties: Property[] = propertiesResponse.data.map((property: ApiProperty) => ({
          id: property._id,
          title: property.title,
          location: property.location?.address || property.location?.city || 'Location not specified',
          price: property.price,
          type: property.roomType || 'Property',
          images: property.images.length > 0 ? property.images : ['https://via.placeholder.com/300x200'],
          amenities: property.amenities || [],
          rating: property.rating || 0,
          distance: `${Math.round(Math.random() * 5 + 0.5)}km from university`, // TODO: Calculate actual distance
          isAvailable: property.available,
          compatibilityScore: property.aiScore ? Math.round(property.aiScore) : undefined,
        }));
        
        setProperties(transformedProperties);
      } else {
        // No properties found
        setProperties([]);
        console.log('No properties found');
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      Alert.alert('Error', 'Failed to load properties');
      // Set empty array on error
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle refresh
   */
  const onRefresh = () => {
    setRefreshing(true);
    loadProperties();
    setTimeout(() => setRefreshing(false), 1000);
  };

  /**
   * Handle property selection
   */
  const handlePropertySelect = (property: Property) => {
    Alert.alert('Property Selected', `Opening details for: ${property.title}`);
    // TODO: Navigate to PropertyDetailsScreen
  };

  /**
   * Handle favorite toggle
   */
  const handleFavoriteToggle = (propertyId: string) => {
    Alert.alert('Favorite', `Toggled favorite for property ${propertyId}`);
    // TODO: Implement favorite functionality
  };

  /**
   * Render property card
   */
  const renderPropertyCard = (property: Property, index: number) => (
    <Animated.View
      key={property.id}
      entering={FadeInDown.delay(index * 100).duration(600)}
      className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100"
    >
      <TouchableOpacity
        onPress={() => handlePropertySelect(property)}
        activeOpacity={0.9}
      >
        {/* Property Image */}
        <View className="relative">
          <Image
            source={{ uri: property.images[0] }}
            className="w-full h-48 rounded-t-2xl"
            style={{ backgroundColor: '#f3f4f6' }}
          />
          
          {/* Availability Badge */}
          <View className={`absolute top-3 left-3 px-3 py-1 rounded-full ${
            property.isAvailable ? 'bg-green-500' : 'bg-red-500'
          }`}>
            <Text className="text-white text-sm font-medium">
              {property.isAvailable ? 'Available' : 'Occupied'}
            </Text>
          </View>

          {/* Compatibility Score */}
          {property.compatibilityScore && (
            <View className="absolute top-3 right-3 bg-purple-500 px-3 py-1 rounded-full">
              <Text className="text-white text-sm font-bold">
                {property.compatibilityScore}% Match
              </Text>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity
            onPress={() => handleFavoriteToggle(property.id)}
            className="absolute bottom-3 right-3 bg-white/90 p-2 rounded-full"
          >
            <Text className="text-lg">❤️</Text>
          </TouchableOpacity>
        </View>

        {/* Property Details */}
        <View className="p-4">
          {/* Title and Location */}
          <Text className="text-xl font-bold text-gray-800 mb-1">
            {property.title}
          </Text>
          <Text className="text-gray-600 mb-2">📍 {property.location}</Text>

          {/* Price and Type */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-2xl font-bold text-purple-600">
              {property.price} MAD
            </Text>
            <View className="bg-blue-50 px-3 py-1 rounded-full">
              <Text className="text-blue-600 font-medium">{property.type}</Text>
            </View>
          </View>

          {/* Rating and Distance */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Text className="text-yellow-500 mr-1">⭐</Text>
              <Text className="text-gray-700 font-medium">{property.rating}</Text>
            </View>
            <Text className="text-gray-600">{property.distance}</Text>
          </View>

          {/* Amenities */}
          <View className="flex-row flex-wrap">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <View key={index} className="bg-gray-100 px-2 py-1 rounded-full mr-2 mb-1">
                <Text className="text-gray-600 text-sm">{amenity}</Text>
              </View>
            ))}
            {property.amenities.length > 3 && (
              <View className="bg-gray-100 px-2 py-1 rounded-full">
                <Text className="text-gray-600 text-sm">
                  +{property.amenities.length - 3} more
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  /**
   * Render sort options
   */
  const renderSortOptions = () => (
    <Animated.View 
      entering={FadeInUp.delay(400).duration(600)}
      className="px-6 mb-4"
    >
      <Text className="text-lg font-bold text-gray-800 mb-3">Sort by:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'compatibility', label: '🤖 AI Match', color: 'purple' },
          { key: 'price', label: '💰 Price', color: 'green' },
          { key: 'distance', label: '📍 Distance', color: 'blue' },
          { key: 'rating', label: '⭐ Rating', color: 'yellow' },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => setSortBy(option.key as any)}
            className={`mr-3 px-4 py-2 rounded-full border ${
              sortBy === option.key
                ? `bg-${option.color}-500 border-${option.color}-500`
                : 'bg-white border-gray-200'
            }`}
          >
            <Text className={`font-medium ${
              sortBy === option.key ? 'text-white' : 'text-gray-700'
            }`}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Animated.View 
        entering={FadeInUp.delay(200).duration(600)}
        className="px-6 pt-4 pb-2"
      >
        <Text className="text-3xl font-bold text-gray-800">
          Available Properties
        </Text>
        <Text className="text-gray-600 text-lg">
          {properties.length} properties found
        </Text>
      </Animated.View>

      {/* Sort Options */}
      {renderSortOptions()}

      {/* Property List */}
      <ScrollView
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Animated.View 
            entering={FadeInDown.delay(600).duration(600)}
            className="flex-1 justify-center items-center py-20"
          >
            <Text className="text-xl">🔍</Text>
            <Text className="text-gray-600 mt-2">Loading properties...</Text>
          </Animated.View>
        ) : properties.length > 0 ? (
          properties.map((property, index) => renderPropertyCard(property, index))
        ) : (
          <Animated.View 
            entering={FadeInDown.delay(600).duration(600)}
            className="flex-1 justify-center items-center py-20"
          >
            <Text className="text-4xl mb-4">🏠</Text>
            <Text className="text-xl font-bold text-gray-800 mb-2">
              No Properties Found
            </Text>
            <Text className="text-gray-600 text-center px-4">
              Try adjusting your search criteria or filters
            </Text>
            <TouchableOpacity 
              onPress={loadProperties}
              className="bg-purple-500 px-6 py-3 rounded-2xl mt-4"
            >
              <Text className="text-white font-bold">Refresh</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PropertyListScreen;
