import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Property, SearchFilters } from '../../types';
import { propertyService } from '../../services/propertyService';

/**
 * Properties list screen - shows available properties with search and filters
 */
export const PropertiesListScreen = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    type: 'All',
    bedrooms: 'Any',
  });

  /**
   * Load properties on component mount
   */
  useEffect(() => {
    loadProperties();
  }, []);

  /**
   * Filter properties based on search query and filters
   */
  const filterProperties = React.useCallback(() => {
    let filtered = properties;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= parseInt(filters.maxPrice));
    }

    // Room Type filter
    if (filters.type !== 'All') {
      filtered = filtered.filter(property => property.roomType === filters.type.toLowerCase());
    }

    setFilteredProperties(filtered);
  }, [searchQuery, filters, properties]);

  /**
   * Filter properties when search or filters change
   */
  useEffect(() => {
    filterProperties();
  }, [filterProperties]);

  /**
   * Load properties from API
   */
  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyService.getProperties();
      
      if (response.success && response.data) {
        setProperties(response.data);
      } else {
        console.error('Failed to load properties:', response.message);
        Alert.alert('Error', response.message || 'Failed to load properties');
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      Alert.alert('Error', 'Failed to load properties. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle search with API
   */
  const handleSearch = React.useCallback(async (query: string) => {
    if (!query.trim()) {
      // If search is empty, reload all properties
      await loadProperties();
      return;
    }

    try {
      setLoading(true);
      const searchFilters: SearchFilters = {
        query: query,
        priceRange: filters.minPrice && filters.maxPrice ? {
          min: parseInt(filters.minPrice),
          max: parseInt(filters.maxPrice)
        } : undefined,
      };

      const response = await propertyService.searchProperties(query, searchFilters);
      
      if (response.success && response.data) {
        setProperties(response.data);
      } else {
        console.error('Search failed:', response.message);
        Alert.alert('Error', 'Search failed. Please try again.');
      }
    } catch (error) {
      console.error('Error searching properties:', error);
      Alert.alert('Error', 'Search failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Debounced search
   */
  const debouncedSearch = React.useMemo(
    () => {
      const timeoutRef = { current: null as NodeJS.Timeout | null };
      
      return (query: string) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          handleSearch(query);
        }, 500);
      };
    },
    [handleSearch]
  );

  /**
   * Handle search query change
   */
  const onSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  /**
   * Handle refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  };

  /**
   * Navigate to property details
   */
  const navigateToPropertyDetails = (propertyId: string) => {
    Alert.alert('Navigation', `Navigate to property ${propertyId} details`);
  };

  /**
   * Handle property favorite toggle
   */
  const toggleFavorite = async (propertyId: string) => {
    try {
      // TODO: Check if property is already favorited
      await propertyService.addToFavorites(propertyId);
      Alert.alert('Success', 'Property added to favorites!');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  /**
   * Get landlord display name
   */
  const getLandlordName = (landlord?: any) => {
    if (!landlord) return 'Unknown';
    if (typeof landlord === 'string') return 'Landlord';
    return `${landlord.firstName || ''} ${landlord.lastName || ''}`.trim() || 'Landlord';
  };

  /**
   * Get property type display
   */
  const getPropertyTypeDisplay = (roomType: string) => {
    switch (roomType) {
      case 'studio': return 'Studio';
      case 'single': return 'Single Room';
      case 'shared': return 'Shared Room';
      case 'apartment': return 'Apartment';
      default: return roomType;
    }
  };

  /**
   * Render property card
   */
  const renderPropertyCard = (property: Property, index: number) => (
    <Animated.View
      key={property._id}
      entering={FadeInDown.delay(index * 100).duration(600)}
      className="mb-4"
    >
      <TouchableOpacity
        onPress={() => navigateToPropertyDetails(property._id)}
        className="bg-white rounded-2xl shadow-sm border border-gray-100"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* Property Image */}
        <View className="h-48 bg-gray-200 rounded-t-2xl relative">
          {property.images && property.images.length > 0 ? (
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-gray-500">Image: {property.images[0]}</Text>
            </View>
          ) : (
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-4xl">🏠</Text>
            </View>
          )}
          
          {/* AI Score Badge */}
          {property.aiScore && (
            <View className="absolute top-3 left-3 bg-purple-500 rounded-full px-3 py-1">
              <Text className="text-white text-sm font-bold">
                {property.aiScore}% Match
              </Text>
            </View>
          )}
          
          {/* Favorite Button */}
          <TouchableOpacity
            onPress={() => toggleFavorite(property._id)}
            className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full items-center justify-center"
            style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }}
          >
            <Text className="text-red-500 text-lg">🤍</Text>
          </TouchableOpacity>
        </View>

        {/* Property Details */}
        <View className="p-4">
          {/* Title and Price */}
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-bold text-gray-800 flex-1 mr-2">
              {property.title}
            </Text>
            <Text className="text-lg font-bold text-purple-600">
              {property.price} {property.currency || 'MAD'}/month
            </Text>
          </View>

          {/* Address */}
          <View className="flex-row items-center mb-3">
            <Text className="text-gray-500 mr-1">📍</Text>
            <Text className="text-gray-600 flex-1">{property.location.address}</Text>
          </View>

          {/* Property Info */}
          <View className="flex-row items-center mb-3">
            <View className="flex-row items-center mr-4">
              <Text className="text-gray-500 mr-1">🏠</Text>
              <Text className="text-sm text-gray-600">
                {getPropertyTypeDisplay(property.roomType)}
              </Text>
            </View>
            <View className="flex-row items-center mr-4">
              <Text className="text-gray-500 mr-1">⭐</Text>
              <Text className="text-sm text-gray-600">{property.rating || 'New'}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-500 mr-1">�</Text>
              <Text className="text-sm text-gray-600">
                {property.available ? 'Available' : 'Occupied'}
              </Text>
            </View>
          </View>

          {/* Amenities */}
          <View className="flex-row flex-wrap mb-3">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <View
                key={idx}
                className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-1"
              >
                <Text className="text-xs text-gray-600">{amenity}</Text>
              </View>
            ))}
            {property.amenities.length > 3 && (
              <View className="bg-gray-100 rounded-full px-3 py-1">
                <Text className="text-xs text-gray-600">
                  +{property.amenities.length - 3} more
                </Text>
              </View>
            )}
          </View>

          {/* Landlord Info */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center mr-2">
                <Text className="text-sm font-bold text-gray-600">
                  {getLandlordName(property.landlord).charAt(0)}
                </Text>
              </View>
              <Text className="text-sm text-gray-600">{getLandlordName(property.landlord)}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-yellow-500 mr-1">⭐</Text>
              <Text className="text-sm text-gray-600">{property.rating || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  /**
   * Render filter buttons
   */
  const renderFilterButtons = () => (
    <Animated.View
      entering={FadeInUp.delay(200).duration(600)}
      className="mb-4"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-6"
      >
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          className="bg-purple-500 rounded-full px-4 py-2 mr-3"
        >
          <Text className="text-white font-medium">🔍 Filters</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => Alert.alert('Sort', 'Open sort options')}
          className="bg-white border border-gray-200 rounded-full px-4 py-2 mr-3"
        >
          <Text className="text-gray-700 font-medium">📊 Sort</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => Alert.alert('Map', 'Open map view')}
          className="bg-white border border-gray-200 rounded-full px-4 py-2"
        >
          <Text className="text-gray-700 font-medium">🗺️ Map</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Animated.View 
        entering={FadeInUp.duration(600)}
        className="px-6 pt-4 pb-2"
      >
        <Text className="text-2xl font-bold text-gray-800 mb-4">Find Properties</Text>
        
        {/* Search Bar */}
        <View className="relative">
          <TextInput
            value={searchQuery}
            onChangeText={onSearchQueryChange}
            placeholder="Search properties or locations..."
            placeholderTextColor="#9CA3AF"
            className="bg-white border border-gray-200 rounded-2xl px-4 py-3 pr-12 text-gray-800"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2,
            }}
          />
          <View className="absolute right-4 top-3">
            <Text className="text-gray-400 text-lg">🔍</Text>
          </View>
        </View>
      </Animated.View>

      {/* Filter Buttons */}
      {renderFilterButtons()}

      {/* Properties List */}
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Results Count */}
        <Animated.View entering={FadeInUp.delay(300).duration(600)}>
          <Text className="text-gray-600 mb-4">
            {filteredProperties.length} properties found
          </Text>
        </Animated.View>

        {/* Properties */}
        {loading ? (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-500">Loading properties...</Text>
          </View>
        ) : filteredProperties.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-4xl mb-4">🏠</Text>
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              No Properties Found
            </Text>
            <Text className="text-gray-600 text-center">
              Try adjusting your search criteria or filters
            </Text>
          </View>
        ) : (
          filteredProperties.map((property: Property, index: number) => renderPropertyCard(property, index))
        )}
        
        <View className="h-20" />
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text className="text-2xl text-gray-400">×</Text>
              </TouchableOpacity>
            </View>

            {/* Room Type Filter */}
            <View className="mb-6">
              <Text className="text-md font-semibold text-gray-800 mb-3">Room Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {['All', 'Private Room', 'Shared Room', 'Entire Place'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFilters(prev => ({ ...prev, type }))}
                    className={`px-4 py-2 rounded-full border ${
                      filters.type === type
                        ? 'bg-purple-500 border-purple-500'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text className={`text-sm ${
                      filters.type === type ? 'text-white' : 'text-gray-600'
                    }`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range */}
            <View className="mb-6">
              <Text className="text-md font-semibold text-gray-800 mb-3">Price Range</Text>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-sm text-gray-600 mb-1">Min Price</Text>
                  <TextInput
                    value={filters.minPrice}
                    onChangeText={(text) => setFilters(prev => ({ ...prev, minPrice: text }))}
                    placeholder="0"
                    keyboardType="numeric"
                    className="border border-gray-200 rounded-lg px-3 py-2"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-600 mb-1">Max Price</Text>
                  <TextInput
                    value={filters.maxPrice}
                    onChangeText={(text) => setFilters(prev => ({ ...prev, maxPrice: text }))}
                    placeholder="No limit"
                    keyboardType="numeric"
                    className="border border-gray-200 rounded-lg px-3 py-2"
                  />
                </View>
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              onPress={() => {
                setShowFilterModal(false);
                // Trigger filtering
                filterProperties();
              }}
              className="bg-purple-500 rounded-xl py-4 mt-4"
            >
              <Text className="text-white text-center font-semibold text-md">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PropertiesListScreen;
