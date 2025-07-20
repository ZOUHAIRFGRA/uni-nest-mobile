/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useBookingsActions } from '../../store/hooks';
import { thunks } from '../../store/appThunks';
import { Property, Booking } from '../../types';

interface BookingRequestScreenProps {
  property: Property;
  onBack?: () => void;
  onBookingSuccess?: (booking: Booking) => void;
}

/**
 * Booking Request Screen - Handles property booking process
 * Features: Date selection, payment method, booking confirmation
 */
export const BookingRequestScreen: React.FC<BookingRequestScreenProps> = ({
  property,
  onBack,
  onBookingSuccess,
}) => {
  const { loading, error, dispatch } = useBookingsActions();
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [paymentMethod, setPaymentMethod] = useState<'WafaCash' | 'CashPlus' | 'Bank Transfer' | 'Cash'>('WafaCash');
  const [duration, setDuration] = useState(1); // months

  /**
   * Calculate total amount
   */
  const calculateTotal = () => {
    return property.price * duration;
  };

  /**
   * Handle date change
   */
  const handleDurationChange = (months: number) => {
    setDuration(months);
    const newEndDate = new Date(startDate);
    newEndDate.setMonth(newEndDate.getMonth() + months);
    setEndDate(newEndDate);
  };

  /**
   * Handle booking submission
   */
  const handleSubmitBooking = async () => {
    try {
      const bookingData = {
        propertyId: property._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        paymentMethod,
        totalAmount: calculateTotal(),
        message: `Booking request for ${property.title}`,
      };

      const result = await dispatch(thunks.bookings.createBooking(bookingData));
      
      if (result.payload) {
        Alert.alert(
          'Booking Submitted!',
          'Your booking request has been sent to the landlord. You will receive a confirmation soon.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onBookingSuccess && result.payload) {
                  onBookingSuccess(result.payload);
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Failed to submit booking request. Please try again.');
    }
  };

  /**
   * Render payment method option
   */
  const renderPaymentMethod = (method: typeof paymentMethod, label: string, icon: string) => (
    <TouchableOpacity
      onPress={() => setPaymentMethod(method)}
      className={`p-4 rounded-2xl border-2 mb-3 ${
        paymentMethod === method
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <View className="flex-row items-center">
        <Text className="text-2xl mr-3">{icon}</Text>
        <View className="flex-1">
          <Text className={`font-bold text-lg ${
            paymentMethod === method ? 'text-purple-600' : 'text-gray-800'
          }`}>
            {label}
          </Text>
          <Text className="text-gray-600 text-sm">
            {method === 'WafaCash' && 'Mobile money transfer'}
            {method === 'CashPlus' && 'Mobile payment service'}
            {method === 'Bank Transfer' && 'Direct bank transfer'}
            {method === 'Cash' && 'Pay in cash on delivery'}
          </Text>
        </View>
        {paymentMethod === method && (
          <Text className="text-purple-500 text-xl">✓</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  /**
   * Render duration selector
   */
  const renderDurationSelector = () => (
    <View className="mb-6">
      <Text className="text-xl font-bold text-gray-800 mb-4">Duration</Text>
      <View className="flex-row space-x-3">
        {[1, 3, 6, 12].map((months) => (
          <TouchableOpacity
            key={months}
            onPress={() => handleDurationChange(months)}
            className={`flex-1 py-3 px-4 rounded-2xl border-2 ${
              duration === months
                ? 'border-purple-500 bg-purple-500'
                : 'border-gray-200 bg-white'
            }`}
          >
            <Text className={`font-bold text-center ${
              duration === months ? 'text-white' : 'text-gray-700'
            }`}>
              {months} {months === 1 ? 'Month' : 'Months'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  /**
   * Render property summary
   */
  const renderPropertySummary = () => (
    <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
      <Text className="text-xl font-bold text-gray-800 mb-3">Property Summary</Text>
      
      <View className="flex-row items-center mb-3">
        <Text className="text-lg mr-2">🏠</Text>
        <Text className="text-gray-700 flex-1">{property.title}</Text>
      </View>
      
      <View className="flex-row items-center mb-3">
        <Text className="text-lg mr-2">📍</Text>
        <Text className="text-gray-700 flex-1">{property.location.address}</Text>
      </View>
      
      <View className="flex-row items-center mb-3">
        <Text className="text-lg mr-2">💰</Text>
        <Text className="text-gray-700 flex-1">
          {property.price} {property.currency} per month
        </Text>
      </View>
      
      <View className="flex-row items-center">
        <Text className="text-lg mr-2">📅</Text>
        <Text className="text-gray-700 flex-1">
          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  /**
   * Render cost breakdown
   */
  const renderCostBreakdown = () => (
    <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
      <Text className="text-xl font-bold text-gray-800 mb-3">Cost Breakdown</Text>
      
      <View className="space-y-2 mb-4">
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Monthly Rent</Text>
          <Text className="text-gray-800">{property.price} {property.currency}</Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Duration</Text>
          <Text className="text-gray-800">{duration} {duration === 1 ? 'month' : 'months'}</Text>
        </View>
        
        <View className="border-t border-gray-200 pt-2">
          <View className="flex-row justify-between">
            <Text className="font-bold text-lg">Total Amount</Text>
            <Text className="font-bold text-lg text-purple-600">
              {calculateTotal()} {property.currency}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Animated.View 
        entering={FadeInUp.delay(200).duration(600)}
        className="px-6 pt-4 pb-2"
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={onBack} className="p-2">
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">Book Property</Text>
          <View className="w-10" />
        </View>
      </Animated.View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Property Summary */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          {renderPropertySummary()}
        </Animated.View>

        {/* Duration Selector */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)}>
          {renderDurationSelector()}
        </Animated.View>

        {/* Cost Breakdown */}
        <Animated.View entering={FadeInDown.delay(800).duration(600)}>
          {renderCostBreakdown()}
        </Animated.View>

        {/* Payment Method */}
        <Animated.View entering={FadeInDown.delay(1000).duration(600)}>
          <Text className="text-xl font-bold text-gray-800 mb-4">Payment Method</Text>
          
          {renderPaymentMethod('WafaCash', 'WafaCash', '💳')}
          {renderPaymentMethod('CashPlus', 'CashPlus', '💰')}
          {renderPaymentMethod('Bank Transfer', 'Bank Transfer', '🏦')}
          {renderPaymentMethod('Cash', 'Cash', '💵')}
        </Animated.View>

        {/* Important Notes */}
        <Animated.View 
          entering={FadeInDown.delay(1200).duration(600)}
          className="bg-yellow-50 p-4 rounded-2xl mb-6 border border-yellow-200"
        >
          <Text className="text-lg font-bold text-yellow-800 mb-2">⚠️ Important Notes</Text>
          <Text className="text-yellow-700 text-sm leading-5">
            • Your booking request will be sent to the landlord for approval{'\n'}
            • Payment instructions will be provided after approval{'\n'}
            • You can cancel the booking within 24 hours{'\n'}
            • Contact the landlord for any questions
          </Text>
        </Animated.View>

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>

      {/* Submit Button */}
      <Animated.View 
        entering={FadeInUp.delay(1400).duration(600)}
        className="bg-white border-t border-gray-200 p-6"
      >
        <TouchableOpacity
          onPress={handleSubmitBooking}
          disabled={loading}
          className={`bg-purple-500 py-4 rounded-2xl ${
            loading ? 'opacity-70' : ''
          }`}
          style={{
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {loading ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-bold text-lg ml-2">Submitting...</Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-lg text-center">
              Submit Booking Request
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default BookingRequestScreen;
