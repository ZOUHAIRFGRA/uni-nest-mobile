/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

/**
 * Booking Request Screen - Create a new booking request
 * Features: Property selection, date picker, roommate options, booking summary
 */
export const BookingRequestScreen = () => {
  const [selectedProperty, setSelectedProperty] = useState({
    id: '1',
    title: 'Modern Studio in Agdal',
    price: 2500,
    location: 'Agdal, Rabat',
    type: 'Studio',
  });
  
  const [bookingDates, setBookingDates] = useState({
    startDate: '',
    endDate: '',
  });
  
  const [specialRequests, setSpecialRequests] = useState('');
  const [needsRoommate, setNeedsRoommate] = useState(false);

  /**
   * Handle booking submission
   */
  const handleSubmitBooking = () => {
    if (!bookingDates.startDate || !bookingDates.endDate) {
      Alert.alert('Error', 'Please select booking dates');
      return;
    }
    
    Alert.alert(
      'Booking Request',
      `Submit booking request for ${selectedProperty.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit', 
          onPress: () => {
            Alert.alert('Success', 'Booking request submitted successfully!');
            // TODO: Navigate to confirmation screen
          }
        }
      ]
    );
  };

  /**
   * Calculate booking summary
   */
  const calculateBookingSummary = () => {
    const monthlyRent = selectedProperty.price;
    const securityDeposit = monthlyRent;
    const serviceFee = Math.round(monthlyRent * 0.1);
    const total = monthlyRent + securityDeposit + serviceFee;
    
    return {
      monthlyRent,
      securityDeposit,
      serviceFee,
      total,
    };
  };

  const summary = calculateBookingSummary();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Animated.View 
        entering={FadeInUp.delay(200).duration(600)}
        className="px-6 pt-4 pb-2 bg-white border-b border-gray-100"
      >
        <Text className="text-3xl font-bold text-gray-800">
          Book Property
        </Text>
        <Text className="text-gray-600 text-lg">
          Complete your booking request
        </Text>
      </Animated.View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Property Summary */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(600)}
          className="bg-white p-6 mb-4"
        >
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Property Details
          </Text>
          <View className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
            <Text className="text-lg font-bold text-gray-800 mb-1">
              {selectedProperty.title}
            </Text>
            <Text className="text-gray-600 mb-2">📍 {selectedProperty.location}</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-2xl font-bold text-purple-600">
                {selectedProperty.price} MAD/month
              </Text>
              <View className="bg-blue-50 px-3 py-1 rounded-full">
                <Text className="text-blue-600 font-medium">{selectedProperty.type}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Booking Dates */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(600)}
          className="bg-white p-6 mb-4"
        >
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Booking Dates
          </Text>
          
          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-medium mb-2">Start Date</Text>
              <TextInput
                value={bookingDates.startDate}
                onChangeText={(text) => setBookingDates(prev => ({ ...prev, startDate: text }))}
                placeholder="YYYY-MM-DD"
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-800"
              />
            </View>
            
            <View>
              <Text className="text-gray-700 font-medium mb-2">End Date</Text>
              <TextInput
                value={bookingDates.endDate}
                onChangeText={(text) => setBookingDates(prev => ({ ...prev, endDate: text }))}
                placeholder="YYYY-MM-DD"
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-800"
              />
            </View>
          </View>
        </Animated.View>

        {/* Roommate Options */}
        <Animated.View 
          entering={FadeInDown.delay(500).duration(600)}
          className="bg-white p-6 mb-4"
        >
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Roommate Preferences
          </Text>
          
          <TouchableOpacity
            onPress={() => setNeedsRoommate(!needsRoommate)}
            className="flex-row items-center"
          >
            <View className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
              needsRoommate ? 'bg-purple-500 border-purple-500' : 'border-gray-300'
            }`}>
              {needsRoommate && (
                <Text className="text-white text-sm">✓</Text>
              )}
            </View>
            <Text className="text-gray-700 font-medium flex-1">
              I need help finding a roommate
            </Text>
          </TouchableOpacity>
          
          {needsRoommate && (
            <View className="mt-4 p-4 bg-blue-50 rounded-2xl">
              <Text className="text-blue-800 font-medium mb-2">🤖 AI Roommate Matching</Text>
              <Text className="text-blue-600">
                We&apos;ll use our AI system to find compatible roommates based on your preferences and lifestyle.
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Special Requests */}
        <Animated.View 
          entering={FadeInDown.delay(600).duration(600)}
          className="bg-white p-6 mb-4"
        >
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Special Requests
          </Text>
          
          <TextInput
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder="Any special requests or questions for the landlord..."
            multiline
            numberOfLines={4}
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-800"
            textAlignVertical="top"
          />
        </Animated.View>

        {/* Booking Summary */}
        <Animated.View 
          entering={FadeInDown.delay(700).duration(600)}
          className="bg-white p-6 mb-4"
        >
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Booking Summary
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Monthly Rent</Text>
              <Text className="text-gray-800 font-medium">{summary.monthlyRent} MAD</Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Security Deposit</Text>
              <Text className="text-gray-800 font-medium">{summary.securityDeposit} MAD</Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Service Fee (10%)</Text>
              <Text className="text-gray-800 font-medium">{summary.serviceFee} MAD</Text>
            </View>
            
            <View className="border-t border-gray-200 pt-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-bold text-gray-800">Total</Text>
                <Text className="text-2xl font-bold text-purple-600">{summary.total} MAD</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Important Notes */}
        <Animated.View 
          entering={FadeInDown.delay(800).duration(600)}
          className="bg-yellow-50 p-6 mb-8 mx-6 rounded-2xl border border-yellow-200"
        >
          <Text className="text-lg font-bold text-yellow-800 mb-2">📋 Important Notes</Text>
          <Text className="text-yellow-700 leading-6">
            • This is a booking request, not a confirmed booking{'\n'}
            • The landlord will review and respond within 24 hours{'\n'}
            • Payment is required only after landlord confirmation{'\n'}
            • Security deposit is refundable at the end of tenancy
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action Button */}
      <Animated.View 
        entering={FadeInUp.delay(900).duration(600)}
        className="bg-white border-t border-gray-200 p-6"
      >
        <TouchableOpacity
          onPress={handleSubmitBooking}
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
            Submit Booking Request
          </Text>
        </TouchableOpacity>
        
        <Text className="text-gray-500 text-center mt-3 text-sm">
          By submitting, you agree to our Terms of Service and Privacy Policy
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

export default BookingRequestScreen;
