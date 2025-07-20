import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Property } from '../../types';
import { propertyService } from '../../services/propertyService';
import { bookingService } from '../../services/bookingService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PropertyDetailsScreenProps {
  propertyId?: string; // For now, we'll use a default property ID for testing
}

/**
 * Property Details Screen - Detailed view of a single property
 * Features: Image gallery, amenities, booking, contact landlord
 */
export const PropertyDetailsScreen = ({ propertyId = '64f7b8c9d4e5f1234567890a' }: PropertyDetailsScreenProps) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  /**
   * Check if property is in favorites
   */
  const checkFavoriteStatus = async (propertyId: string) => {
    try {
      const response = await propertyService.getFavorites();
      if (response.success && response.data) {
        const isFav = response.data.some(fav => fav._id === propertyId);
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
      // Silently fail - not critical
    }
  };

  /**
   * Load property details from API
   */
  const loadPropertyDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await propertyService.getPropertyById(propertyId);
      
      if (response.success && response.data) {
        setProperty(response.data);
        // Check if property is in favorites
        await checkFavoriteStatus(response.data._id);
      } else {
        console.error('Failed to load property details:', response.message);
        Alert.alert('Error', response.message || 'Failed to load property details');
      }
    } catch (error) {
      console.error('Error loading property details:', error);
      Alert.alert('Error', 'Failed to load property details. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  /**
   * Handle booking request
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  /**
   * Load property details on component mount
   */
  useEffect(() => {
    loadPropertyDetails();
  }, [loadPropertyDetails]);

  /**
   * Handle booking request
   */
  /**
   * Handle contact landlord
   */
  const handleContactLandlord = () => {
    if (property && property.landlord) {
      const landlordName = `${property.landlord.firstName} ${property.landlord.lastName}`;
      
      Alert.alert(
        'Contact Landlord',
        `Contact ${landlordName}`,
        [
          { text: 'Cancel', style: 'cancel' },
          ...(property.landlord.phone ? [{
            text: 'Call',
            onPress: () => {
              Linking.openURL(`tel:${property.landlord!.phone}`).catch(() => {
                Alert.alert('Error', 'Unable to make phone call');
              });
            }
          }] : []),
          {
            text: 'Email',
            onPress: () => {
              Linking.openURL(`mailto:${property.landlord!.email}`).catch(() => {
                Alert.alert('Error', 'Unable to open email client');
              });
            }
          }
        ]
      );
    }
  };

  /**
   * Handle booking request
   */
  const handleBookNow = () => {
    if (!property) return;

    Alert.alert(
      'Book Property',
      `Book ${property.title} for ${property.price} MAD/month?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Book', 
          onPress: async () => {
            try {
              // Calculate booking dates (e.g., from today for 1 month)
              const startDate = new Date().toISOString();
              const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
              
              await bookingService.createBooking({
                propertyId: property._id,
                startDate,
                endDate,
                message: `Booking request for ${property.title}`
              });
              
              Alert.alert('Success', 'Booking request sent successfully!');
            } catch (error) {
              console.error('Error creating booking:', error);
              Alert.alert('Error', 'Failed to send booking request. Please try again.');
            }
          }
        }
      ]
    );
  };

  /**
   * Handle favorite toggle
   */
  const handleFavoriteToggle = async () => {
    if (!property) return;
    
    try {
      if (isFavorite) {
        await propertyService.removeFromFavorites(property._id);
        setIsFavorite(false);
        Alert.alert('Success', 'Removed from favorites');
      } else {
        await propertyService.addToFavorites(property._id);
        setIsFavorite(true);
        Alert.alert('Success', 'Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  /**
   * Render image gallery
   */
  const renderImageGallery = () => {
    const images = property?.images && property.images.length > 0 
      ? property.images 
      : ['https://via.placeholder.com/400x300/6366f1/ffffff?text=No+Image+Available'];
    
    return (
      <View className="relative">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setCurrentImageIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={{ width: SCREEN_WIDTH, height: 300 }}
              className="bg-gray-200"
            />
          ))}
        </ScrollView>

        {/* Image Indicators */}
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
          {images.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </View>

        {/* Back Button */}
        <TouchableOpacity className="absolute top-12 left-4 bg-black/30 p-2 rounded-full">
          <Text className="text-white text-lg">←</Text>
        </TouchableOpacity>

        {/* Favorite Button */}
        <TouchableOpacity
          onPress={handleFavoriteToggle}
          className="absolute top-12 right-4 bg-black/30 p-2 rounded-full"
        >
          <Text className="text-lg">{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        {/* Compatibility Score */}
        <View className="absolute bottom-16 right-4 bg-purple-500 px-3 py-1 rounded-full">
          <Text className="text-white font-bold">
            {property?.aiScore ? Math.round(property.aiScore * 100) : 85}% Match
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-xl">🏠</Text>
        <Text className="text-gray-600 mt-2">Loading property details...</Text>
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-4xl mb-4">🏠</Text>
        <Text className="text-xl font-bold text-gray-800 mb-2">Property Not Found</Text>
        <Text className="text-gray-600 text-center px-6">
          The property you are looking for is not available
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Image Gallery */}
      {renderImageGallery()}

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Property Header */}
        <Animated.View 
          entering={FadeInUp.delay(300).duration(600)}
          className="p-6"
        >
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            {property.title}
          </Text>
          <Text className="text-gray-600 text-lg mb-4">📍 {property.location.address}, {property.location.city}</Text>

          {/* Price and Details */}
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-3xl font-bold text-purple-600">
                {property.price} MAD
              </Text>
              <Text className="text-gray-600">per month</Text>
            </View>
            <View className="items-end">
              <View className="bg-blue-50 px-3 py-1 rounded-full mb-1">
                <Text className="text-blue-600 font-medium">{property.roomType}</Text>
              </View>
              <Text className="text-gray-600">{property.location.nearbyUniversities[0] || 'Near University'}</Text>
            </View>
          </View>

          {/* Rating and Reviews */}
          <View className="flex-row items-center mb-4">
            <Text className="text-yellow-500 mr-1">⭐</Text>
            <Text className="text-gray-800 font-medium mr-2">{property.rating}</Text>
            <Text className="text-gray-600">({property.reviews.length} reviews)</Text>
          </View>
        </Animated.View>

        {/* Room Details */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(600)}
          className="px-6 mb-6"
        >
          <Text className="text-xl font-bold text-gray-800 mb-4">Room Details</Text>
          <View className="bg-gray-50 p-4 rounded-2xl">
            <View className="flex-row justify-between mb-3">
              <View className="items-center">
                <Text className="text-2xl mb-1">🛏️</Text>
                <Text className="text-gray-600 text-sm">Room Type</Text>
                <Text className="font-bold capitalize">{property.roomType}</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl mb-1">🪑</Text>
                <Text className="text-gray-600 text-sm">Furnished</Text>
                <Text className="font-bold">{property.features.furnished ? 'Yes' : 'No'}</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl mb-1">�</Text>
                <Text className="text-gray-600 text-sm">WiFi</Text>
                <Text className="font-bold">{property.features.wifi ? 'Yes' : 'No'}</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl mb-1">🅿️</Text>
                <Text className="text-gray-600 text-sm">Parking</Text>
                <Text className="font-bold">{property.features.parking ? 'Yes' : 'No'}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Description */}
        <Animated.View 
          entering={FadeInDown.delay(500).duration(600)}
          className="px-6 mb-6"
        >
          <Text className="text-xl font-bold text-gray-800 mb-3">Description</Text>
          <Text className="text-gray-600 leading-6">{property.description}</Text>
        </Animated.View>

        {/* Amenities */}
        <Animated.View 
          entering={FadeInDown.delay(600).duration(600)}
          className="px-6 mb-6"
        >
          <Text className="text-xl font-bold text-gray-800 mb-4">Amenities</Text>
          <View className="flex-row flex-wrap">
            {property.amenities.map((amenity, index) => (
              <View key={index} className="bg-green-50 px-3 py-2 rounded-full mr-2 mb-2 border border-green-100">
                <Text className="text-green-600 font-medium">✓ {amenity}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Features */}
        <Animated.View 
          entering={FadeInDown.delay(700).duration(600)}
          className="px-6 mb-6"
        >
          <Text className="text-xl font-bold text-gray-800 mb-4">Features</Text>
          <View className="flex-row flex-wrap">
            {Object.entries(property.features)
              .filter(([_, value]) => value === true)
              .map(([feature, _], index) => (
                <View key={index} className="bg-blue-50 px-3 py-2 rounded-full mr-2 mb-2 border border-blue-100">
                  <Text className="text-blue-600 font-medium capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                </View>
              ))}
          </View>
        </Animated.View>

        {/* Landlord Info */}
        <Animated.View 
          entering={FadeInDown.delay(800).duration(600)}
          className="px-6 mb-6"
        >
          <Text className="text-xl font-bold text-gray-800 mb-4">Landlord</Text>
          <View className="bg-gray-50 p-4 rounded-2xl">
            {property.landlord ? (
              <>
                <View className="flex-row items-center mb-3">
                  <View className="w-12 h-12 bg-purple-500 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold text-lg">
                      {property.landlord.firstName.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800">
                      {property.landlord.firstName} {property.landlord.lastName}
                      {property.landlord.isVerified && (
                        <Text className="text-green-500"> ✓</Text>
                      )}
                    </Text>
                    <Text className="text-gray-600">{property.landlord.email}</Text>
                  </View>
                </View>
                <Text className="text-gray-600 text-sm">
                  {property.landlord.phone || 'Contact through the app'}
                </Text>
              </>
            ) : (
              <Text className="text-gray-600">Landlord information not available</Text>
            )}
          </View>
        </Animated.View>

        {/* Bottom spacing */}
        <View className="h-32" />
      </ScrollView>

      {/* Bottom Action Buttons */}
      <Animated.View 
        entering={FadeInUp.delay(900).duration(600)}
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6"
      >
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={handleContactLandlord}
            className="flex-1 bg-gray-100 py-4 rounded-2xl"
          >
            <Text className="text-gray-800 font-bold text-center">Contact</Text>
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
            <Text className="text-white font-bold text-center text-lg">Book Now</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default PropertyDetailsScreen;
