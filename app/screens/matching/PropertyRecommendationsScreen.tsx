import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, SlideInLeft } from 'react-native-reanimated';
import { useMatchesActions } from '../../store/hooks';
import { thunks } from '../../store/appThunks';
import { Match, Property } from '../../types';

/**
 * Property recommendation interface
 */
interface PropertyRecommendation {
  id: string;
  title: string;
  location: string;
  price: number;
  type: 'studio' | 'apartment' | 'room' | 'house';
  size: number;
  amenities: string[];
  images: string[];
  landlord: {
    name: string;
    rating: number;
    verified: boolean;
  };
  distance: number;
  matchScore: number;
  matchReasons: string[];
  availability: string;
  features: {
    furnished: boolean;
    wifi: boolean;
    parking: boolean;
    kitchen: boolean;
    laundry: boolean;
  };
  preferences: {
    quietArea: boolean;
    nearUniversity: boolean;
    goodTransport: boolean;
    shopping: boolean;
  };
}

/**
 * Property Recommendations Screen - AI-powered property suggestions
 * Features: Personalized recommendations, match scoring, preference alignment
 */
export const PropertyRecommendationsScreen = () => {
  const { matches, loading, dispatch } = useMatchesActions();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  /**
   * Load property recommendations using useCallback for dependency optimization
   */
  const loadPropertyRecommendations = useCallback(async () => {
    try {
      // Load property matches specifically for recommendations
      await dispatch(thunks.matches.fetchMatches('property'));
    } catch (error) {
      console.error('Error loading property recommendations:', error);
      Alert.alert('Error', 'Failed to load property recommendations');
    }
  }, [dispatch]);

  /**
   * Load property recommendations on component mount
   */
  useEffect(() => {
    loadPropertyRecommendations();
  }, [loadPropertyRecommendations]);

  /**
   * Transform API matches to property recommendations
   */
  const transformToPropertyRecommendations = (matches: Match[]): PropertyRecommendation[] => {
    return matches
      .filter(match => match.type === 'property' && match.target)
      .map(match => {
        const property = match.target as Property;
        return {
          id: match._id,
          title: property.title,
          location: property.location?.address || property.location?.city || 'Location not specified',
          price: property.price,
          type: property.roomType as 'studio' | 'apartment' | 'room' | 'house' || 'apartment',
          size: Math.floor(Math.random() * 50 + 25), // TODO: Get actual size from property
          amenities: property.amenities || [],
          images: property.images || [],
          landlord: {
            name: property.landlord?.firstName && property.landlord?.lastName 
              ? `${property.landlord.firstName} ${property.landlord.lastName}`
              : 'Landlord',
            rating: property.rating || 4.0,
            verified: property.landlord?.isVerified || false,
          },
          distance: Math.random() * 5 + 0.5, // TODO: Calculate actual distance
          matchScore: match.compatibilityScore,
          matchReasons: match.reasons,
          availability: property.availableFrom || 'Now',
          features: {
            furnished: property.features?.furnished || false,
            wifi: property.features?.wifi || false,
            parking: property.features?.parking || false,
            kitchen: property.features?.kitchen || false,
            laundry: property.features?.laundry || false,
          },
          preferences: {
            quietArea: true, // TODO: Map from property data
            nearUniversity: property.features?.nearPublicTransport || false,
            goodTransport: property.features?.nearPublicTransport || false,
            shopping: false, // TODO: Map from property data
          },
        };
      });
  };

  /**
   * Get property recommendations from matches
   */
  const getPropertyRecommendations = (): PropertyRecommendation[] => {
    return transformToPropertyRecommendations(matches);
  };
  
  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPropertyRecommendations();
    setRefreshing(false);
  };

  /**
   * Get match score color
   */
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  /**
   * Filter recommendations based on active filter
   */
  const filteredRecommendations = getPropertyRecommendations().filter(property => {
    switch (activeFilter) {
      case 'high-match':
        return property.matchScore >= 90;
      case 'budget':
        return property.price <= 2000;
      case 'near-university':
        return property.distance <= 2;
      case 'verified':
        return property.landlord.verified;
      default:
        return true;
    }
  });

  /**
   * Handle property press
   */
  const handlePropertyPress = (property: PropertyRecommendation) => {
    Alert.alert(
      property.title,
      `Match Score: ${property.matchScore}%\nPrice: ${property.price} MAD\nDistance: ${property.distance}km`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('View details:', property.id) },
        { text: 'Book Now', onPress: () => console.log('Book property:', property.id) }
      ]
    );
  };

  /**
   * Handle save property
   */
  const handleSaveProperty = (propertyId: string) => {
    Alert.alert('Saved', 'Property saved to favorites!');
    // TODO: Implement actual save functionality
  };

  /**
   * Render match score badge
   */
  const renderMatchScoreBadge = (score: number) => (
    <View className={`px-3 py-1 rounded-full ${getMatchScoreColor(score)}`}>
      <Text className={`font-bold text-sm ${getMatchScoreColor(score).split(' ')[0]}`}>
        {score}% Match
      </Text>
    </View>
  );

  /**
   * Render property item
   */
  const renderPropertyItem = ({ item, index }: { item: PropertyRecommendation; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(600)}
    >
      <TouchableOpacity
        onPress={() => handlePropertyPress(item)}
        className="bg-white p-5 mb-4 rounded-2xl"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800 mb-1">
              {item.title}
            </Text>
            <Text className="text-gray-600 mb-2">📍 {item.location}</Text>
            <Text className="text-gray-500 text-sm">
              {item.distance}km away • Available {item.availability}
            </Text>
          </View>
          
          <View className="items-end">
            {renderMatchScoreBadge(item.matchScore)}
            <TouchableOpacity
              onPress={() => handleSaveProperty(item.id)}
              className="mt-2 p-2"
            >
              <Text className="text-gray-400 text-xl">🤍</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Property Details */}
        <View className="bg-gray-50 p-4 rounded-xl mb-4">
          <View className="flex-row justify-between mb-3">
            <View>
              <Text className="text-sm text-gray-500">Type & Size</Text>
              <Text className="text-gray-800 font-medium capitalize">
                {item.type} • {item.size}m²
              </Text>
            </View>
            <View>
              <Text className="text-sm text-gray-500">Monthly Rent</Text>
              <Text className="text-xl font-bold text-purple-600">
                {item.price} MAD
              </Text>
            </View>
          </View>
          
          <View>
            <Text className="text-sm text-gray-500 mb-2">Features</Text>
            <View className="flex-row flex-wrap">
              {Object.entries(item.features).map(([key, value]) => (
                value && (
                  <View key={key} className="bg-white px-2 py-1 rounded-full mr-2 mb-1">
                    <Text className="text-xs text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Text>
                  </View>
                )
              ))}
            </View>
          </View>
        </View>

        {/* AI Match Reasons */}
        <View className="bg-purple-50 p-4 rounded-xl mb-4">
          <Text className="text-sm font-bold text-purple-800 mb-3 flex-row items-center">
            🧠 Why this matches you
          </Text>
          {item.matchReasons.slice(0, 2).map((reason, idx) => (
            <View key={idx} className="flex-row items-start mb-2">
              <Text className="text-purple-600 mr-2">•</Text>
              <Text className="text-purple-700 text-sm flex-1">{reason}</Text>
            </View>
          ))}
          {item.matchReasons.length > 2 && (
            <Text className="text-purple-600 text-sm">+{item.matchReasons.length - 2} more reasons</Text>
          )}
        </View>

        {/* Landlord Info */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold">
                {item.landlord.name.charAt(0)}
              </Text>
            </View>
            <View>
              <View className="flex-row items-center">
                <Text className="text-gray-800 font-medium mr-2">
                  {item.landlord.name}
                </Text>
                {item.landlord.verified && (
                  <Text className="text-green-500">✓</Text>
                )}
              </View>
              <View className="flex-row items-center">
                <Text className="text-yellow-500 mr-1">⭐</Text>
                <Text className="text-gray-600 text-sm">{item.landlord.rating}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={() => handlePropertyPress(item)}
            className="flex-1 bg-gray-100 py-3 rounded-xl"
          >
            <Text className="text-gray-800 font-bold text-center">View Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => Alert.alert('Book Property', 'Navigate to booking screen...')}
            className="flex-1 bg-purple-500 py-3 rounded-xl"
          >
            <Text className="text-white font-bold text-center">Book Now</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  /**
   * Render filter button
   */
  const renderFilterButton = (label: string, value: string) => (
    <TouchableOpacity
      onPress={() => setActiveFilter(value)}
      className={`px-4 py-2 rounded-full mr-3 ${
        activeFilter === value ? 'bg-purple-500' : 'bg-gray-100'
      }`}
    >
      <Text className={`font-medium ${
        activeFilter === value ? 'text-white' : 'text-gray-600'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-4xl mb-4">🏠</Text>
        <Text className="text-gray-600 mt-2">AI is analyzing perfect matches...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Animated.View 
        entering={FadeInUp.delay(200).duration(600)}
        className="px-6 pt-4 pb-6 bg-white border-b border-gray-100"
      >
        <Text className="text-3xl font-bold text-gray-800 mb-2">
          AI Recommendations
        </Text>
        <Text className="text-gray-600">
          Personalized property suggestions for you
        </Text>
      </Animated.View>

      {/* AI Insights */}
      <Animated.View 
        entering={SlideInLeft.delay(300).duration(600)}
        className="bg-gradient-to-r from-purple-500 to-pink-500 mx-6 mt-4 p-4 rounded-2xl"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white font-bold text-lg">Smart Analysis</Text>
            <Text className="text-purple-100">
              Found {getPropertyRecommendations().length} properties matching your preferences
            </Text>
          </View>
          <Text className="text-4xl">✨</Text>
        </View>
      </Animated.View>

      {/* Filters */}
      <Animated.View 
        entering={FadeInDown.delay(400).duration(600)}
        className="px-6 py-4"
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton('All', 'all')}
          {renderFilterButton('High Match (90%+)', 'high-match')}
          {renderFilterButton('Budget Friendly', 'budget')}
          {renderFilterButton('Near University', 'near-university')}
          {renderFilterButton('Verified', 'verified')}
        </ScrollView>
      </Animated.View>

      {/* Recommendations List */}
      {filteredRecommendations.length === 0 ? (
        <Animated.View 
          entering={FadeInDown.delay(500).duration(600)}
          className="flex-1 justify-center items-center px-6"
        >
          <Text className="text-6xl mb-4">🔍</Text>
          <Text className="text-xl font-bold text-gray-800 mb-2">No Recommendations</Text>
          <Text className="text-gray-600 text-center">
            Try adjusting your filters or update your preferences for better matches
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={filteredRecommendations}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default PropertyRecommendationsScreen;
