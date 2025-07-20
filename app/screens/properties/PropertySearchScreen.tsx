/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

/**
 * Property Search Screen - Main search interface for properties
 * Features: Smart search, filters, AI recommendations, map view
 */
export const PropertySearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularLocations, setPopularLocations] = useState<string[]>([
    'Rabat Centre',
    'Agdal',
    'Hay Riad',
    'Souissi',
    'Temara',
    'Salé'
  ]);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Load recent searches from storage
   */
  useEffect(() => {
    loadRecentSearches();
  }, []);

  /**
   * Load recent searches from AsyncStorage
   */
  const loadRecentSearches = async () => {
    try {
      // TODO: Implement AsyncStorage loading
      const searches = ['Studio Agdal', 'Apartment Rabat', 'Room sharing'];
      setRecentSearches(searches);
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  /**
   * Handle search submission
   */
  const handleSearch = () => {
    if (searchQuery.trim()) {
      Alert.alert('Search', `Searching for: ${searchQuery}`);
      // TODO: Navigate to results screen
      // TODO: Save to recent searches
    }
  };

  /**
   * Handle quick search selection
   */
  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    handleSearch();
  };

  /**
   * Handle refresh
   */
  const onRefresh = () => {
    setRefreshing(true);
    loadRecentSearches();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(600)}
          className="px-6 pt-4 pb-6"
        >
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            Find Your Perfect Home
          </Text>
          <Text className="text-gray-600 text-lg">
            Discover student housing with AI-powered recommendations
          </Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(600)}
          className="px-6 mb-6"
        >
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <View className="flex-row items-center px-4 py-4">
              <Text className="text-xl mr-3">🔍</Text>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by location, university, or keywords..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-gray-800 text-lg"
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  className="p-2"
                >
                  <Text className="text-gray-400">✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Search Button */}
          <TouchableOpacity
            onPress={handleSearch}
            className="bg-purple-500 mt-4 py-4 rounded-2xl"
            style={{
              shadowColor: '#8B5CF6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-white text-lg font-bold text-center">
              Search Properties
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View 
          entering={FadeInDown.delay(600).duration(600)}
          className="px-6 mb-6"
        >
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap">
            <TouchableOpacity className="bg-white p-4 rounded-2xl mr-3 mb-3 shadow-sm border border-gray-100">
              <Text className="text-2xl mb-2">🗺️</Text>
              <Text className="text-gray-700 font-medium">Map View</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-white p-4 rounded-2xl mr-3 mb-3 shadow-sm border border-gray-100">
              <Text className="text-2xl mb-2">🔧</Text>
              <Text className="text-gray-700 font-medium">Filters</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-white p-4 rounded-2xl mr-3 mb-3 shadow-sm border border-gray-100">
              <Text className="text-2xl mb-2">❤️</Text>
              <Text className="text-gray-700 font-medium">Favorites</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-white p-4 rounded-2xl mr-3 mb-3 shadow-sm border border-gray-100">
              <Text className="text-2xl mb-2">🤖</Text>
              <Text className="text-gray-700 font-medium">AI Match</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <Animated.View 
            entering={FadeInDown.delay(800).duration(600)}
            className="px-6 mb-6"
          >
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Recent Searches
            </Text>
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleQuickSearch(search)}
                className="bg-white p-4 rounded-xl mb-2 shadow-sm border border-gray-100"
              >
                <View className="flex-row items-center">
                  <Text className="text-lg mr-3">🕒</Text>
                  <Text className="text-gray-700 font-medium flex-1">{search}</Text>
                  <Text className="text-gray-400">→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* Popular Locations */}
        <Animated.View 
          entering={FadeInDown.delay(1000).duration(600)}
          className="px-6 mb-6"
        >
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Popular Locations
          </Text>
          <View className="flex-row flex-wrap">
            {popularLocations.map((location, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleQuickSearch(location)}
                className="bg-blue-50 px-4 py-2 rounded-full mr-2 mb-2 border border-blue-100"
              >
                <Text className="text-blue-600 font-medium">{location}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Tips Section */}
        <Animated.View 
          entering={FadeInDown.delay(1200).duration(600)}
          className="px-6 mb-8"
        >
          <View className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border border-purple-100">
            <Text className="text-xl font-bold text-gray-800 mb-2">💡 Search Tips</Text>
            <Text className="text-gray-600 leading-6">
              • Use specific keywords like "Studio", "Shared room", or "1BR"{'\n'}
              • Include your university name for nearby options{'\n'}
              • Try budget ranges like "under 3000 MAD"{'\n'}
              • Use AI Match for personalized recommendations
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PropertySearchScreen;
