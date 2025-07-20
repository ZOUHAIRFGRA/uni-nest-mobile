import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from '../../store/hooks';
import { thunks } from '../../store/appThunks';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Modern iOS-style Property List Screen
 */
export const PropertyListScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: { min: 0, max: 10000 },
    roomType: 'all',
    amenities: [] as string[],
  });

  // Animation values
  const searchBarScale = useSharedValue(1);
  const filtersOpacity = useSharedValue(0);
  const cardsTranslateY = useSharedValue(30);

  // Get data from Redux store
  const properties = useSelector((state: any) => state.properties.properties || []);
  const loading = useSelector((state: any) => state.properties.loading);
  const pagination = useSelector((state: any) => state.properties.pagination);

  useEffect(() => {
    // Load properties on mount
    loadProperties();
    
    // Animate elements
    cardsTranslateY.value = withSpring(0, { damping: 15, stiffness: 150 });
  }, []);

  const loadProperties = async () => {
    try {
      await dispatch(thunks.properties.fetchProperties());
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadProperties();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    searchBarScale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    setTimeout(() => {
      searchBarScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, 100);
    
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
    filtersOpacity.value = withTiming(showFilters ? 0 : 1, { duration: 300 });
  };

  // Animated styles
  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchBarScale.value }],
  }));

  const filtersAnimatedStyle = useAnimatedStyle(() => ({
    opacity: filtersOpacity.value,
    transform: [
      {
        translateY: interpolate(
          filtersOpacity.value,
          [0, 1],
          [-20, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardsTranslateY.value }],
  }));

  /**
   * Render search bar
   */
  const renderSearchBar = () => (
    <Animated.View 
      style={searchBarAnimatedStyle}
      className="px-6 pt-4 pb-4"
    >
      <View className="flex-row items-center space-x-3">
        {/* Search Input */}
        <View className="flex-1">
          <View className="bg-white rounded-2xl shadow-lg border border-gray-100 flex-row items-center px-4 py-3">
            <Text className="text-gray-400 mr-3">🔍</Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search properties..."
              className="flex-1 text-gray-800 text-base"
              placeholderTextColor="#9CA3AF"
              onSubmitEditing={handleSearch}
            />
          </View>
        </View>

        {/* Filters Button */}
        <TouchableOpacity
          onPress={toggleFilters}
          className="bg-white w-12 h-12 rounded-2xl items-center justify-center shadow-lg border border-gray-100"
          activeOpacity={0.8}
        >
          <Text className="text-gray-600 text-lg">⚙️</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  /**
   * Render filters
   */
  const renderFilters = () => (
    <Animated.View 
      style={filtersAnimatedStyle}
      className="px-6 pb-4"
    >
      <View className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <Text className="text-gray-800 font-semibold text-base mb-3">
          Filters
        </Text>
        
        {/* Price Range */}
        <View className="mb-4">
          <Text className="text-gray-600 text-sm mb-2">Price Range</Text>
          <View className="flex-row space-x-2">
            {[
              { label: 'Any', min: 0, max: 10000 },
              { label: 'Under $500', min: 0, max: 500 },
              { label: '$500-$1000', min: 500, max: 1000 },
              { label: '$1000+', min: 1000, max: 10000 },
            ].map((range) => (
              <TouchableOpacity
                key={range.label}
                className={`px-3 py-2 rounded-xl border ${
                  selectedFilters.priceRange.min === range.min &&
                  selectedFilters.priceRange.max === range.max
                    ? 'bg-purple-100 border-purple-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
                onPress={() => setSelectedFilters({
                  ...selectedFilters,
                  priceRange: { min: range.min, max: range.max }
                })}
              >
                <Text className={`text-xs font-medium ${
                  selectedFilters.priceRange.min === range.min &&
                  selectedFilters.priceRange.max === range.max
                    ? 'text-purple-600'
                    : 'text-gray-600'
                }`}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Room Type */}
        <View className="mb-4">
          <Text className="text-gray-600 text-sm mb-2">Room Type</Text>
          <View className="flex-row space-x-2">
            {['all', 'Private', 'Shared', 'Studio'].map((type) => (
              <TouchableOpacity
                key={type}
                className={`px-3 py-2 rounded-xl border ${
                  selectedFilters.roomType === type
                    ? 'bg-purple-100 border-purple-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
                onPress={() => setSelectedFilters({
                  ...selectedFilters,
                  roomType: type
                })}
              >
                <Text className={`text-xs font-medium ${
                  selectedFilters.roomType === type
                    ? 'text-purple-600'
                    : 'text-gray-600'
                }`}>
                  {type === 'all' ? 'All' : type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Apply Filters Button */}
        <TouchableOpacity
          className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl py-3 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold">Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  /**
   * Render property card
   */
  const renderPropertyCard = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(600)}
      className="mb-4"
    >
      <TouchableOpacity
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        activeOpacity={0.8}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        {/* Property Image */}
        <View className="w-full h-48 bg-gray-200 relative">
          {item.images && item.images[0] ? (
            <Image
              source={{ uri: item.images[0] }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 items-center justify-center">
              <Text className="text-gray-500 text-4xl">🏠</Text>
            </View>
          )}
          
          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            className="absolute bottom-0 left-0 right-0 h-20"
          />
          
          {/* Price badge */}
          <View className="absolute top-4 right-4 bg-white/90 backdrop-blur-xl rounded-xl px-3 py-2">
            <Text className="text-purple-600 font-bold text-lg">
              ${item.price}/mo
            </Text>
          </View>

          {/* Favorite button */}
          <TouchableOpacity className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-xl rounded-full items-center justify-center">
            <Text className="text-gray-400 text-lg">❤️</Text>
          </TouchableOpacity>
        </View>

        {/* Property Info */}
        <View className="p-4">
          <Text className="text-gray-800 font-bold text-lg mb-2" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-gray-500 text-sm mb-3" numberOfLines={1}>
            📍 {item.address}
          </Text>

          {/* Amenities */}
          <View className="flex-row flex-wrap mb-3">
            {item.amenities && Object.entries(item.amenities).slice(0, 4).map(([key, value]: [string, any]) => (
              value && (
                <View key={key} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-1">
                  <Text className="text-gray-600 text-xs">
                    {key === 'wifi' && '📶 WiFi'}
                    {key === 'parking' && '🚗 Parking'}
                    {key === 'laundry' && '👕 Laundry'}
                    {key === 'gym' && '💪 Gym'}
                    {key === 'security' && '🔒 Security'}
                    {key === 'furnished' && '🪑 Furnished'}
                    {key === 'airConditioning' && '❄️ AC'}
                    {key === 'heating' && '🔥 Heating'}
                    {key === 'kitchen' && '🍳 Kitchen'}
                    {key === 'balcony' && '🌿 Balcony'}
                  </Text>
                </View>
              )
            ))}
          </View>

          {/* Property details */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-4">
              <View className="flex-row items-center">
                <Text className="text-gray-400 text-sm mr-1">👥</Text>
                <Text className="text-gray-600 text-sm">{item.maxTenants} tenants</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-gray-400 text-sm mr-1">🏠</Text>
                <Text className="text-gray-600 text-sm">{item.roomType}</Text>
              </View>
            </View>
            
            <View className="flex-row items-center">
              <Text className="text-gray-400 text-sm mr-1">⭐</Text>
              <Text className="text-gray-600 text-sm">4.8</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <Animated.View 
      entering={FadeInUp.duration(600)}
      className="flex-1 items-center justify-center py-20"
    >
      <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
        <Text className="text-4xl">🏠</Text>
      </View>
      <Text className="text-gray-600 text-lg font-semibold mb-2">
        No properties found
      </Text>
      <Text className="text-gray-500 text-center px-8">
        Try adjusting your search criteria or filters to find more properties.
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-100">
        <View className="px-6 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-800 mb-1">
            Explore Properties
          </Text>
          <Text className="text-gray-500 text-sm">
            Find your perfect home
          </Text>
        </View>
        
        {renderSearchBar()}
        {showFilters && renderFilters()}
      </View>

      {/* Property List */}
      <Animated.View style={cardsAnimatedStyle} className="flex-1">
        {loading && properties.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">Loading properties...</Text>
          </View>
        ) : (
          <FlatList
            data={properties}
            renderItem={renderPropertyCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#667eea"
                colors={['#667eea']}
              />
            }
            ListEmptyComponent={renderEmptyState}
            onEndReached={() => {
              // TODO: Load more properties
              console.log('Load more properties');
            }}
            onEndReachedThreshold={0.1}
          />
        )}
      </Animated.View>

      {/* Bottom spacing for tab bar */}
      <View className="h-32" />
    </SafeAreaView>
  );
};
