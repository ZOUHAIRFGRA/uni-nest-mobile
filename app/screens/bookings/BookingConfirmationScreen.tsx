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
 * Booking confirmation interface
 */
interface BookingDetails {
  id: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  bookingDate: string;
  landlordName: string;
  landlordPhone: string;
}

/**
 * Booking Confirmation Screen - Shows booking confirmation details
 * Features: Booking details, payment summary, next steps, contact options
 */
export const BookingConfirmationScreen = () => {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Load booking details on component mount
   */
  useEffect(() => {
    loadBookingDetails();
  }, []);

  /**
   * Load booking details from API or route params
   */
  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual booking ID from navigation params
      const mockBookingDetails: BookingDetails = {
        id: 'BK001',
        propertyTitle: 'Modern Studio in Agdal',
        propertyLocation: 'Agdal, Rabat',
        propertyPrice: 2500,
        startDate: '2024-02-01',
        endDate: '2024-08-01',
        totalAmount: 5000,
        status: 'confirmed',
        bookingDate: '2024-01-15',
        landlordName: 'Ahmed Benali',
        landlordPhone: '+212 600 123 456',
      };
      setBookingDetails(mockBookingDetails);
    } catch (error) {
      console.error('Error loading booking details:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle contact landlord
   */
  const handleContactLandlord = () => {
    if (bookingDetails) {
      Alert.alert(
        'Contact Landlord',
        `Call ${bookingDetails.landlordName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => Alert.alert('Calling...', `${bookingDetails.landlordPhone}`) }
        ]
      );
    }
  };

  /**
   * Handle download receipt
   */
  const handleDownloadReceipt = () => {
    Alert.alert('Download Receipt', 'Receipt download feature will be implemented');
    // TODO: Implement receipt download functionality
  };

  /**
   * Handle view property
   */
  const handleViewProperty = () => {
    Alert.alert('View Property', 'Navigate to property details...');
    // TODO: Navigate to property details screen
  };

  /**
   * Handle payment
   */
  const handleMakePayment = () => {
    Alert.alert('Payment', 'Navigate to payment screen...');
    // TODO: Navigate to payment screen
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-4xl mb-4">📋</Text>
        <Text className="text-gray-600 mt-2">Loading booking details...</Text>
      </SafeAreaView>
    );
  }

  if (!bookingDetails) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-4xl mb-4">❌</Text>
        <Text className="text-xl font-bold text-gray-800 mb-2">Booking Not Found</Text>
        <Text className="text-gray-600 text-center px-6">
          The booking details could not be loaded
        </Text>
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
        <View className="items-center">
          <Text className="text-6xl mb-4">✅</Text>
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            Booking Confirmed!
          </Text>
          <Text className="text-gray-600 text-lg text-center">
            Your booking request has been approved
          </Text>
        </View>
      </Animated.View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(600)}
          className="bg-white p-6 mb-4"
        >
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Booking Details
          </Text>
          
          <View className="bg-green-50 p-4 rounded-2xl border border-green-100 mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold text-gray-800">Booking ID</Text>
              <Text className="text-lg font-bold text-green-600">{bookingDetails.id}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Status</Text>
              <View className="bg-green-500 px-3 py-1 rounded-full">
                <Text className="text-white font-bold text-sm">
                  {bookingDetails.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <View className="space-y-3">
            <View>
              <Text className="text-gray-500 text-sm mb-1">Property</Text>
              <Text className="text-gray-800 font-medium">{bookingDetails.propertyTitle}</Text>
              <Text className="text-gray-600">📍 {bookingDetails.propertyLocation}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-gray-500 text-sm mb-1">Check-in</Text>
                <Text className="text-gray-800 font-medium">
                  {new Date(bookingDetails.startDate).toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-sm mb-1">Check-out</Text>
                <Text className="text-gray-800 font-medium">
                  {new Date(bookingDetails.endDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            <View>
              <Text className="text-gray-500 text-sm mb-1">Monthly Rent</Text>
              <Text className="text-2xl font-bold text-purple-600">
                {bookingDetails.propertyPrice} MAD
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Landlord Information */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(600)}
          className="bg-white p-6 mb-4"
        >
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Landlord Contact
          </Text>
          
          <View className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold text-lg">
                  {bookingDetails.landlordName.charAt(0)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-800">
                  {bookingDetails.landlordName}
                </Text>
                <Text className="text-gray-600">{bookingDetails.landlordPhone}</Text>
              </View>
            </View>
            
            <TouchableOpacity
              onPress={handleContactLandlord}
              className="bg-blue-500 py-3 rounded-xl"
            >
              <Text className="text-white font-bold text-center">
                📞 Contact Landlord
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Next Steps */}
        <Animated.View 
          entering={FadeInDown.delay(500).duration(600)}
          className="bg-white p-6 mb-4"
        >
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Next Steps
          </Text>
          
          <View className="space-y-4">
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-purple-500 rounded-full items-center justify-center mr-3 mt-1">
                <Text className="text-white font-bold">1</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium mb-1">Make Payment</Text>
                <Text className="text-gray-600 text-sm">
                  Complete your payment to secure the booking
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-purple-500 rounded-full items-center justify-center mr-3 mt-1">
                <Text className="text-white font-bold">2</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium mb-1">Contact Landlord</Text>
                <Text className="text-gray-600 text-sm">
                  Coordinate move-in details and key handover
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-purple-500 rounded-full items-center justify-center mr-3 mt-1">
                <Text className="text-white font-bold">3</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium mb-1">Move In</Text>
                <Text className="text-gray-600 text-sm">
                  Complete the move-in process on your start date
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Important Information */}
        <Animated.View 
          entering={FadeInDown.delay(600).duration(600)}
          className="bg-yellow-50 p-6 mb-8 mx-6 rounded-2xl border border-yellow-200"
        >
          <Text className="text-lg font-bold text-yellow-800 mb-2">📋 Important</Text>
          <Text className="text-yellow-700 leading-6">
            • Keep this confirmation for your records{'\n'}
            • Payment must be completed within 48 hours{'\n'}
            • Contact us if you need to modify your booking{'\n'}
            • Check property condition during move-in
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <Animated.View 
        entering={FadeInUp.delay(700).duration(600)}
        className="bg-white border-t border-gray-200 p-4"
      >
        <View className="flex-row space-x-3 mb-4">
          <TouchableOpacity
            onPress={handleViewProperty}
            className="flex-1 bg-gray-100 py-3 rounded-xl"
          >
            <Text className="text-gray-800 font-bold text-center">View Property</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleDownloadReceipt}
            className="flex-1 bg-gray-100 py-3 rounded-xl"
          >
            <Text className="text-gray-800 font-bold text-center">Download Receipt</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          onPress={handleMakePayment}
          className="bg-purple-500 py-4 rounded-2xl"
          style={{
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text className="text-white font-bold text-center text-lg">
            💳 Complete Payment
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default BookingConfirmationScreen;
