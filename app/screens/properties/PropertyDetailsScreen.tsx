import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { usePropertiesActions } from '../../store/hooks';
import { thunks } from '../../store/appThunks';
import { Property, User } from '../../types';

const { width } = Dimensions.get('window');

interface PropertyDetailsScreenProps {
  propertyId: string;
  onBack?: () => void;
  onBookNow?: (property: Property) => void;
}

/**
 * Property Details Screen - Shows comprehensive property information
 * Features: Image gallery, detailed info, amenities, landlord profile, booking
 */
export const PropertyDetailsScreen: React.FC<PropertyDetailsScreenProps> = ({
  propertyId,
  onBack,
  onBookNow,
}) => {
  const { currentProperty, loading, error, dispatch } = usePropertiesActions();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  /**
   * Load property details on component mount
   */
  useEffect(() => {
    loadPropertyDetails();
  }, [propertyId]);

  /**
   * Load property details from API
   */
  const loadPropertyDetails = async () => {
    try {
      await dispatch(thunks.properties.fetchPropertyDetails(propertyId));
    } catch (error) {
      console.error('Error loading property details:', error);
      Alert.alert('Error', 'Failed to load property details');
    }
  };

  /**
   * Handle image gallery navigation
   */
  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  /**
   * Handle favorite toggle
   */
  const handleFavoriteToggle = async () => {
    if (!currentProperty) return;
    
    try {
      await dispatch(thunks.properties.toggleFavorite(currentProperty._id));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite');
    }
  };

  /**
   * Handle booking
   */
  const handleBookNow = () => {
    if (!currentProperty) return;
    
    if (onBookNow) {
      onBookNow(currentProperty);
    } else {
      Alert.alert('Booking', 'Navigate to booking screen...');
    }
  };

  /**
   * Handle contact landlord
   */
  const handleContactLandlord = () => {
    Alert.alert('Contact', 'Opening chat with landlord...');
  };

  /**
   * Render image gallery
   */
  const renderImageGallery = () => {
    if (!currentProperty?.images || currentProperty.images.length === 0) {
      return (
        <View className="w-full h-64 bg-gray-200 rounded-2xl items-center justify-center">
          <Text className="text-4xl mb-2">🏠</Text>
          <Text className="text-gray-600">No images available</Text>
        </View>
      );
    }

    return (
      <View className="relative">
        <Image
          source={{ uri: currentProperty.images[currentImageIndex] }}
          className="w-full h-64 rounded-2xl"
          resizeMode="cover"
        />
        
        {/* Image indicators */}
        {currentProperty.images.length > 1 && (
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
            {currentProperty.images.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleImageChange(index)}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </View>
        )}

        {/* Action buttons */}
        <View className="absolute top-4 right-4 flex-row">
          <TouchableOpacity
            onPress={handleFavoriteToggle}
            className="bg-white/90 w-10 h-10 rounded-full items-center justify-center mr-2"
          >
            <Text className="text-xl">{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onBack}
            className="bg-white/90 w-10 h-10 rounded-full items-center justify-center"
          >
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /**
   * Render property info section
   */
  const renderPropertyInfo = () => {
    if (!currentProperty) return null;

    return (
      <View className="p-6">
        {/* Title and Price */}
        <View className="flex-row justify-between items-start mb-4">
          <Text className="text-2xl font-bold text-gray-800 flex-1 mr-4">
            {currentProperty.title}
          </Text>
          <Text className="text-2xl font-bold text-purple-600">
            {currentProperty.price} {currentProperty.currency}
          </Text>
        </View>

        {/* Location */}
        <View className="flex-row items-center mb-4">
          <Text className="text-lg mr-2">📍</Text>
          <Text className="text-gray-700 flex-1">{currentProperty.location.address}</Text>
        </View>

        {/* Property details */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-row items-center">
            <Text className="text-lg mr-2">🏠</Text>
            <Text className="text-gray-700 capitalize">{currentProperty.roomType}</Text>
          </View>
          
          <View className="flex-row items-center">
            <Text className="text-lg mr-1">⭐</Text>
            <Text className="text-gray-700">{currentProperty.rating || 'New'}</Text>
          </View>
        </View>

        {/* Description */}
        <Text className="text-gray-600 leading-6 mb-6">
          {currentProperty.description}
        </Text>

        {/* AI Score */}
        {currentProperty.aiScore && (
          <View className="bg-purple-50 p-4 rounded-2xl mb-6">
            <View className="flex-row items-center mb-2">
              <Text className="text-lg mr-2">🤖</Text>
              <Text className="text-lg font-bold text-purple-600">
                {currentProperty.aiScore}% Match
              </Text>
            </View>
            <Text className="text-gray-600">
              This property matches your preferences perfectly!
            </Text>
          </View>
        )}
      </View>
    );
  };

  /**
   * Render amenities section
   */
  const renderAmenities = () => {
    if (!currentProperty?.amenities || currentProperty.amenities.length === 0) {
      return null;
    }

    return (
      <View className="px-6 mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">Amenities</Text>
        <View className="flex-row flex-wrap">
          {currentProperty.amenities.map((amenity, index) => (
            <View key={index} className="bg-gray-100 px-4 py-2 rounded-full mr-3 mb-3">
              <Text className="text-gray-700 font-medium">{amenity}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  /**
   * Render landlord section
   */
  const renderLandlordSection = () => {
    if (!currentProperty?.landlord) return null;

    const landlord = currentProperty.landlord as User;

    return (
      <View className="px-6 mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">Landlord</Text>
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 bg-purple-500 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">
                {landlord.firstName?.charAt(0) || 'L'}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                {landlord.firstName} {landlord.lastName}
              </Text>
              <Text className="text-gray-600">Verified Landlord</Text>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={handleContactLandlord}
            className="bg-purple-500 py-3 rounded-xl"
          >
            <Text className="text-white font-bold text-center">Contact Landlord</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /**
   * Render action buttons
   */
  const renderActionButtons = () => {
    return (
      <View className="px-6 pb-6">
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={handleContactLandlord}
            className="flex-1 bg-gray-100 py-4 rounded-2xl"
          >
            <Text className="text-gray-700 font-bold text-center">💬 Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleBookNow}
            className="flex-2 bg-purple-500 py-4 rounded-2xl"
            style={{
              shadowColor: '#8B5CF6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-white font-bold text-center">Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text className="text-gray-600 mt-4">Loading property details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !currentProperty) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Text className="text-6xl mb-4">🏠</Text>
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Property Not Found
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          The property you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity
          onPress={onBack}
          className="bg-purple-500 px-8 py-4 rounded-2xl"
        >
          <Text className="text-white font-bold text-lg">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
          {renderImageGallery()}
        </Animated.View>

        {/* Property Info */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          {renderPropertyInfo()}
        </Animated.View>

        {/* Amenities */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)}>
          {renderAmenities()}
        </Animated.View>

        {/* Landlord Section */}
        <Animated.View entering={FadeInDown.delay(800).duration(600)}>
          {renderLandlordSection()}
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(1000).duration(600)}>
          {renderActionButtons()}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PropertyDetailsScreen;
