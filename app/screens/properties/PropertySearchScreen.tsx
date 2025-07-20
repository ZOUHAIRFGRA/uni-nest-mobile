/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { usePropertiesActions } from '../../store/hooks';
import { thunks } from '../../store/appThunks';
import { Property, SearchFilters } from '../../types';

/**
 * Property Search Screen - Main search interface for properties
 * Features: Smart search, filters, AI recommendations, map view
 */
export const PropertySearchScreen = () => {
  const { properties, loading, error, filters, pagination, dispatch } = usePropertiesActions();
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [showResults, setShowResults] = useState(false);

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
   * Load properties from API
   */
  const loadProperties = useCallback(async (page = 1, isRefresh = false) => {
    try {
      const searchParams: SearchFilters = {
        page,
        limit: 10,
        sortBy: 'date',
        sortOrder: 'desc',
        query: searchQuery.trim() || undefined,
        ...filters,
      };

      await dispatch(thunks.properties.fetchProperties(searchParams));
      setShowResults(true);
    } catch (error) {
      console.error('Error loading properties:', error);
      Alert.alert('Error', 'Failed to load properties');
    }
  }, [dispatch, filters, searchQuery]);

  /**
   * Handle search submission
   */
  const handleSearch = () => {
    if (searchQuery.trim()) {
      loadProperties(1, true);
      // Save to recent searches
      if (!recentSearches.includes(searchQuery.trim())) {
        setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
      }
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
  const onRefresh = async () => {
    setRefreshing(true);
    await loadProperties(1, true);
    setRefreshing(false);
  };

  /**
   * Handle load more (pagination)
   */
  const onLoadMore = async () => {
    if (loadingMore || !pagination.hasMore) return;
    
    setLoadingMore(true);
    await loadProperties(pagination.currentPage + 1);
    setLoadingMore(false);
  };

  /**
   * Handle property selection
   */
  const handlePropertySelect = (property: Property) => {
    Alert.alert('Property Selected', `Opening details for: ${property.title}`);
    // TODO: Navigate to PropertyDetailsScreen
  };

  /**
   * Render property card
   */
  const renderPropertyCard = ({ item, index }: { item: Property; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(600)}
      className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100"
    >
      <TouchableOpacity
        onPress={() => handlePropertySelect(item)}
        activeOpacity={0.9}
      >
        {/* Property Image */}
        <View className="relative">
          <Image
            source={{ 
              uri: item.images?.[0] || 'https://via.placeholder.com/400x250/6366f1/ffffff?text=Property' 
            }}
            className="w-full h-48 rounded-t-2xl"
            resizeMode="cover"
          />
          {item.aiScore && (
            <View className="absolute top-3 left-3">
              <View className="bg-purple-500 px-2 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">
                  🤖 {item.aiScore}% Match
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Property Details */}
        <View className="p-4">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-xl font-bold text-gray-800 flex-1 mr-2">
              {item.title}
            </Text>
            <Text className="text-xl font-bold text-purple-600">
              {item.price} {item.currency}
            </Text>
          </View>

          <Text className="text-gray-600 mb-3" numberOfLines={2}>
            {item.description}
          </Text>

          <View className="flex-row items-center mb-3">
            <Text className="text-lg mr-2">📍</Text>
            <Text className="text-gray-700 flex-1">{item.location.address}</Text>
          </View>

          {/* Property Info */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">🏠</Text>
              <Text className="text-gray-700 capitalize">{item.roomType}</Text>
            </View>
            
            <View className="flex-row items-center">
              <Text className="text-lg mr-1">⭐</Text>
              <Text className="text-gray-700">{item.rating || 'New'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

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

        {/* Search Results */}
        {showResults && (
          <Animated.View 
            entering={FadeInDown.delay(1200).duration(600)}
            className="flex-1"
          >
            <View className="px-6 mb-4">
              <Text className="text-xl font-bold text-gray-800">
                Search Results ({properties.length} properties)
              </Text>
            </View>
            
            {loading && properties.length === 0 ? (
              <View className="flex-1 justify-center items-center py-20">
                <ActivityIndicator size="large" color="#6C63FF" />
                <Text className="text-gray-600 mt-4">Searching properties...</Text>
              </View>
            ) : properties.length > 0 ? (
              <FlatList
                data={properties}
                renderItem={renderPropertyCard}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                onEndReached={onLoadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={
                  loadingMore ? (
                    <View className="py-4">
                      <ActivityIndicator size="large" color="#6C63FF" />
                    </View>
                  ) : null
                }
              />
            ) : (
              <View className="flex-1 justify-center items-center py-20 px-6">
                <Text className="text-6xl mb-4">🔍</Text>
                <Text className="text-2xl font-bold text-gray-800 mb-2">
                  No Properties Found
                </Text>
                <Text className="text-gray-600 text-center mb-6">
                  Try adjusting your search criteria or check back later for new listings
                </Text>
                <TouchableOpacity 
                  onPress={() => loadProperties(1, true)}
                  className="bg-purple-500 px-8 py-4 rounded-2xl"
                  style={{
                    shadowColor: '#8B5CF6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Text className="text-white font-bold text-lg">Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        )}

        {/* Tips Section */}
        {!showResults && (
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
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PropertySearchScreen;
