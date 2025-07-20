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
import { Property } from '../../types';

/**
 * Favorite property interface
 */
interface FavoriteProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  images: string[];
  rating: number;
  distance: string;
  isAvailable: boolean;
  dateAdded: string;
  compatibilityScore?: number;
}

/**
 * Favorites Screen - Saved properties by the user
 * Features: Saved properties, remove favorites, quick access
 */
export const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'price' | 'rating' | 'compatibility'>('recent');

  /**
   * Load favorites on component mount
   */
  useEffect(() => {
    loadFavorites();
  }, []);

  /**
   * Load favorite properties from API
   */
  const loadFavorites = async () => {
    try {
      setLoading(true);
      // Load user's favorite properties from API
      const favoritesResponse = await propertyService.getFavorites();
      
      if (favoritesResponse.data && favoritesResponse.data.length > 0) {
        // Transform API data to match our interface
        const transformedFavorites: FavoriteProperty[] = favoritesResponse.data.map((property: Property) => ({
          id: property._id,
          title: property.title,
          location: property.location?.address || property.location?.city || 'Location not specified',
          price: property.price,
          type: property.roomType || 'Property',
          images: property.images.length > 0 ? property.images : ['https://via.placeholder.com/300x200'],
          rating: property.rating || 0,
          distance: `${Math.round(Math.random() * 5 + 0.5)}km from university`, // TODO: Calculate actual distance
          isAvailable: property.available,
          dateAdded: property.createdAt,
          compatibilityScore: property.aiScore ? Math.round(property.aiScore) : undefined,
        }));
        
        setFavorites(transformedFavorites);
      } else {
        // No favorites found
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle refresh
   */
  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
    setTimeout(() => setRefreshing(false), 1000);
  };

  /**
   * Handle property selection
   */
  const handlePropertySelect = (property: FavoriteProperty) => {
    Alert.alert('Property Selected', `Opening details for: ${property.title}`);
    // TODO: Navigate to PropertyDetailsScreen
  };

  /**
   * Handle remove from favorites
   */
  const handleRemoveFromFavorites = async (propertyId: string) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this property from favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove from API
              await propertyService.removeFromFavorites(propertyId);
              // Update local state
              setFavorites(prev => prev.filter(p => p.id !== propertyId));
              Alert.alert('Removed', 'Property removed from favorites');
            } catch (error) {
              console.error('Error removing favorite:', error);
              Alert.alert('Error', 'Failed to remove property from favorites');
            }
          }
        }
      ]
    );
  };

  /**
   * Handle share property
   */
  const handleShareProperty = (property: FavoriteProperty) => {
    Alert.alert('Share Property', `Sharing ${property.title}...`);
    // TODO: Implement share functionality
  };

  /**
   * Sort favorites based on selected criteria
   */
  const getSortedFavorites = () => {
    const sorted = [...favorites];
    switch (sortBy) {
      case 'price':
        return sorted.sort((a, b) => a.price - b.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'compatibility':
        return sorted.sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));
      case 'recent':
      default:
        return sorted.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    }
  };

  /**
   * Render favorite property card
   */
  const renderFavoriteCard = (property: FavoriteProperty, index: number) => (
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

          {/* Action Buttons */}
          <View className="absolute bottom-3 right-3 flex-row space-x-2">
            <TouchableOpacity
              onPress={() => handleShareProperty(property)}
              className="bg-white/90 p-2 rounded-full"
            >
              <Text className="text-lg">📤</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleRemoveFromFavorites(property.id)}
              className="bg-white/90 p-2 rounded-full"
            >
              <Text className="text-lg">🗑️</Text>
            </TouchableOpacity>
          </View>
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

          {/* Date Added */}
          <Text className="text-gray-500 text-sm">
            Added on {new Date(property.dateAdded).toLocaleDateString()}
          </Text>
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
          { key: 'recent', label: '🕒 Most Recent', color: 'blue' },
          { key: 'compatibility', label: '🤖 AI Match', color: 'purple' },
          { key: 'price', label: '💰 Price', color: 'green' },
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
          My Favorites
        </Text>
        <Text className="text-gray-600 text-lg">
          {favorites.length} saved properties
        </Text>
      </Animated.View>

      {/* Sort Options */}
      {favorites.length > 0 && renderSortOptions()}

      {/* Favorites List */}
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
            <Text className="text-xl">❤️</Text>
            <Text className="text-gray-600 mt-2">Loading favorites...</Text>
          </Animated.View>
        ) : favorites.length > 0 ? (
          getSortedFavorites().map((property, index) => renderFavoriteCard(property, index))
        ) : (
          <Animated.View 
            entering={FadeInDown.delay(600).duration(600)}
            className="flex-1 justify-center items-center py-20"
          >
            <Text className="text-6xl mb-4">💔</Text>
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              No Favorites Yet
            </Text>
            <Text className="text-gray-600 text-center px-4 mb-6">
              Start exploring properties and save your favorites for easy access
            </Text>
            <TouchableOpacity 
              onPress={() => Alert.alert('Search', 'Navigate to property search...')}
              className="bg-purple-500 px-8 py-4 rounded-2xl"
              style={{
                shadowColor: '#8B5CF6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text className="text-white font-bold text-lg">Explore Properties</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>

      {/* Quick Actions */}
      {favorites.length > 0 && (
        <Animated.View 
          entering={FadeInUp.delay(800).duration(600)}
          className="bg-white border-t border-gray-200 p-4"
        >
          <View className="flex-row justify-around">
            <TouchableOpacity
              onPress={() => Alert.alert('Clear All', 'This would clear all favorites')}
              className="items-center"
            >
              <Text className="text-2xl mb-1">🗑️</Text>
              <Text className="text-gray-600 text-sm font-medium">Clear All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => Alert.alert('Export', 'This would export favorites')}
              className="items-center"
            >
              <Text className="text-2xl mb-1">📤</Text>
              <Text className="text-gray-600 text-sm font-medium">Share List</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => Alert.alert('Search', 'Navigate to property search...')}
              className="items-center"
            >
              <Text className="text-2xl mb-1">🔍</Text>
              <Text className="text-gray-600 text-sm font-medium">Find More</Text>
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
      )}
    </SafeAreaView>
  );
};

export default FavoritesScreen;
