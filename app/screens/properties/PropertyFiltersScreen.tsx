import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

/**
 * Filter options interface
 */
interface FilterOptions {
  priceRange: {
    min: number;
    max: number;
  };
  propertyType: string[];
  amenities: string[];
  roomFeatures: string[];
  distance: number;
  rating: number;
}

/**
 * Property Filters Screen - Advanced filtering for property search
 * Features: Price range, amenities, location filters, saved filters
 */
export const PropertyFiltersScreen = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: { min: 1000, max: 5000 },
    propertyType: [],
    amenities: [],
    roomFeatures: [],
    distance: 5,
    rating: 0,
  });

  const [savedFilters, setSavedFilters] = useState<FilterOptions[]>([]);

  /**
   * Property type options
   */
  const propertyTypes = [
    'Studio',
    'Shared Room',
    '1 Bedroom',
    '2 Bedrooms',
    'Apartment',
    'House',
  ];

  /**
   * Amenity options
   */
  const amenityOptions = [
    'WiFi',
    'Parking',
    'Security',
    'Laundry',
    'Kitchen',
    'Air Conditioning',
    'Gym',
    'Pool',
    'Garden',
    'Balcony',
  ];

  /**
   * Room feature options
   */
  const roomFeatures = [
    'Furnished',
    'Private Bathroom',
    'Shared Kitchen',
    'Study Area',
    'Storage Space',
    'Natural Light',
  ];

  /**
   * Price range options
   */
  const priceRanges = [
    { label: 'Under 2000 MAD', min: 0, max: 2000 },
    { label: '2000 - 3000 MAD', min: 2000, max: 3000 },
    { label: '3000 - 4000 MAD', min: 3000, max: 4000 },
    { label: '4000 - 5000 MAD', min: 4000, max: 5000 },
    { label: 'Above 5000 MAD', min: 5000, max: 10000 },
  ];

  /**
   * Distance options (in km)
   */
  const distanceOptions = [1, 2, 5, 10, 20];

  /**
   * Rating options
   */
  const ratingOptions = [0, 3, 4, 4.5];

  /**
   * Handle property type selection
   */
  const handlePropertyTypeToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      propertyType: prev.propertyType.includes(type)
        ? prev.propertyType.filter(t => t !== type)
        : [...prev.propertyType, type]
    }));
  };

  /**
   * Handle amenity selection
   */
  const handleAmenityToggle = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  /**
   * Handle room feature selection
   */
  const handleRoomFeatureToggle = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      roomFeatures: prev.roomFeatures.includes(feature)
        ? prev.roomFeatures.filter(f => f !== feature)
        : [...prev.roomFeatures, feature]
    }));
  };

  /**
   * Handle price range selection
   */
  const handlePriceRangeSelect = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: { min, max }
    }));
  };

  /**
   * Handle distance selection
   */
  const handleDistanceSelect = (distance: number) => {
    setFilters(prev => ({
      ...prev,
      distance
    }));
  };

  /**
   * Handle rating selection
   */
  const handleRatingSelect = (rating: number) => {
    setFilters(prev => ({
      ...prev,
      rating
    }));
  };

  /**
   * Reset all filters
   */
  const handleResetFilters = () => {
    setFilters({
      priceRange: { min: 1000, max: 5000 },
      propertyType: [],
      amenities: [],
      roomFeatures: [],
      distance: 5,
      rating: 0,
    });
  };

  /**
   * Apply filters
   */
  const handleApplyFilters = () => {
    Alert.alert('Filters Applied', 'Searching with your selected filters...');
    // TODO: Apply filters and navigate back to results
  };

  /**
   * Save current filters
   */
  const handleSaveFilters = () => {
    setSavedFilters(prev => [...prev, filters]);
    Alert.alert('Filters Saved', 'Your filter preferences have been saved');
  };

  /**
   * Render section header
   */
  const renderSectionHeader = (title: string) => (
    <Text className="text-lg font-bold text-gray-800 mb-4">{title}</Text>
  );

  /**
   * Render option chips
   */
  const renderOptionChips = (
    options: string[],
    selectedOptions: string[],
    onToggle: (option: string) => void
  ) => (
    <View className="flex-row flex-wrap mb-2">
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onToggle(option)}
          className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
            selectedOptions.includes(option)
              ? 'bg-purple-500 border-purple-500'
              : 'bg-white border-gray-200'
          }`}
        >
          <Text className={`font-medium ${
            selectedOptions.includes(option) ? 'text-white' : 'text-gray-700'
          }`}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Animated.View 
        entering={FadeInUp.delay(200).duration(600)}
        className="px-6 pt-4 pb-2 bg-white border-b border-gray-100"
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-3xl font-bold text-gray-800">Filters</Text>
          <TouchableOpacity
            onPress={handleResetFilters}
            className="bg-gray-100 px-4 py-2 rounded-full"
          >
            <Text className="text-gray-700 font-medium">Reset</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-gray-600 text-lg mt-1">
          Customize your search preferences
        </Text>
      </Animated.View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Price Range */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(600)}
          className="bg-white p-6 mb-4"
        >
          {renderSectionHeader('💰 Price Range')}
          <View className="flex-row flex-wrap">
            {priceRanges.map((range, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handlePriceRangeSelect(range.min, range.max)}
                className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                  filters.priceRange.min === range.min && filters.priceRange.max === range.max
                    ? 'bg-green-500 border-green-500'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`font-medium ${
                  filters.priceRange.min === range.min && filters.priceRange.max === range.max
                    ? 'text-white' : 'text-gray-700'
                }`}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Property Type */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(600)}
          className="bg-white p-6 mb-4"
        >
          {renderSectionHeader('🏠 Property Type')}
          {renderOptionChips(propertyTypes, filters.propertyType, handlePropertyTypeToggle)}
        </Animated.View>

        {/* Distance from University */}
        <Animated.View 
          entering={FadeInDown.delay(500).duration(600)}
          className="bg-white p-6 mb-4"
        >
          {renderSectionHeader('📍 Distance from University')}
          <View className="flex-row flex-wrap">
            {distanceOptions.map((distance, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDistanceSelect(distance)}
                className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                  filters.distance === distance
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`font-medium ${
                  filters.distance === distance ? 'text-white' : 'text-gray-700'
                }`}>
                  {distance}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Rating */}
        <Animated.View 
          entering={FadeInDown.delay(600).duration(600)}
          className="bg-white p-6 mb-4"
        >
          {renderSectionHeader('⭐ Minimum Rating')}
          <View className="flex-row flex-wrap">
            {ratingOptions.map((rating, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleRatingSelect(rating)}
                className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                  filters.rating === rating
                    ? 'bg-yellow-500 border-yellow-500'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`font-medium ${
                  filters.rating === rating ? 'text-white' : 'text-gray-700'
                }`}>
                  {rating === 0 ? 'Any' : `${rating}+ stars`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Amenities */}
        <Animated.View 
          entering={FadeInDown.delay(700).duration(600)}
          className="bg-white p-6 mb-4"
        >
          {renderSectionHeader('✨ Amenities')}
          {renderOptionChips(amenityOptions, filters.amenities, handleAmenityToggle)}
        </Animated.View>

        {/* Room Features */}
        <Animated.View 
          entering={FadeInDown.delay(800).duration(600)}
          className="bg-white p-6 mb-4"
        >
          {renderSectionHeader('🛏️ Room Features')}
          {renderOptionChips(roomFeatures, filters.roomFeatures, handleRoomFeatureToggle)}
        </Animated.View>

        {/* Filter Summary */}
        <Animated.View 
          entering={FadeInDown.delay(900).duration(600)}
          className="bg-purple-50 p-6 mb-4 mx-6 rounded-2xl border border-purple-100"
        >
          <Text className="text-lg font-bold text-purple-800 mb-3">Filter Summary</Text>
          <Text className="text-purple-700 mb-1">
            Price: {filters.priceRange.min} - {filters.priceRange.max} MAD
          </Text>
          <Text className="text-purple-700 mb-1">
            Distance: Within {filters.distance}km
          </Text>
          <Text className="text-purple-700 mb-1">
            Property Types: {filters.propertyType.length > 0 ? filters.propertyType.join(', ') : 'Any'}
          </Text>
          <Text className="text-purple-700 mb-1">
            Amenities: {filters.amenities.length} selected
          </Text>
          <Text className="text-purple-700">
            Room Features: {filters.roomFeatures.length} selected
          </Text>
        </Animated.View>

        {/* Bottom spacing */}
        <View className="h-32" />
      </ScrollView>

      {/* Bottom Action Buttons */}
      <Animated.View 
        entering={FadeInUp.delay(1000).duration(600)}
        className="bg-white border-t border-gray-200 p-6"
      >
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={handleSaveFilters}
            className="flex-1 bg-gray-100 py-4 rounded-2xl"
          >
            <Text className="text-gray-800 font-bold text-center">Save Filters</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleApplyFilters}
            className="flex-2 bg-purple-500 py-4 rounded-2xl"
            style={{
              shadowColor: '#8B5CF6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-white font-bold text-center text-lg">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default PropertyFiltersScreen;
