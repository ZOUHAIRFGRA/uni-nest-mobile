import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types';

/**
 * Booking history item interface
 */
interface BookingHistoryItem {
  id: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice: number;
  startDate: string;
  endDate: string;
  status: 'completed' | 'active' | 'upcoming' | 'cancelled' | 'pending';
  bookingDate: string;
  totalAmount: number;
  landlordName: string;
  propertyImage?: string;
}

/**
 * Booking History Screen - Shows user's booking history
 * Features: Booking list, status filtering, booking details, actions
 */
export const BookingHistoryScreen = () => {
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  /**
   * Load booking history on component mount
   */
  useEffect(() => {
    loadBookingHistory();
  }, []);

  /**
   * Load booking history from API
   */
  const loadBookingHistory = async () => {
    try {
      setLoading(true);
      // Load user bookings from real API
      const bookingsData = await bookingService.getBookings();
      
      if (bookingsData && bookingsData.length > 0) {
        // Transform API data to match our interface
        const transformedBookings: BookingHistoryItem[] = bookingsData.map((booking: Booking) => ({
          id: booking._id,
          propertyTitle: booking.property?.title || 'Property Details Unavailable',
          propertyLocation: booking.property?.location?.address || 'Location not specified',
          propertyPrice: booking.property?.price || Math.round(booking.totalAmount / 6), // Estimate monthly rent
          startDate: booking.startDate,
          endDate: booking.endDate,
          status: booking.status === 'confirmed' ? 'active' : 
                 booking.status === 'pending' ? 'upcoming' : 
                 booking.status === 'cancelled' ? 'cancelled' : 
                 booking.status === 'completed' ? 'completed' : 'pending',
          bookingDate: booking.createdAt,
          totalAmount: booking.totalAmount,
          landlordName: booking.landlord?.firstName && booking.landlord?.lastName 
            ? `${booking.landlord.firstName} ${booking.landlord.lastName}`
            : 'Landlord Information Unavailable',
          propertyImage: booking.property?.images?.[0] || undefined,
        }));
        
        setBookings(transformedBookings);
      } else {
        // No bookings found
        setBookings([]);
        console.log('No bookings found for user');
      }
    } catch (error) {
      console.error('Error loading booking history:', error);
      Alert.alert('Error', 'Failed to load booking history');
      // Set empty array on error
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookingHistory();
    setRefreshing(false);
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };



  /**
   * Filter bookings based on active filter
   */
  const filteredBookings = bookings.filter(booking => {
    if (activeFilter === 'all') return true;
    return booking.status === activeFilter;
  });

  /**
   * Handle booking item press
   */
  const handleBookingPress = (booking: BookingHistoryItem) => {
    Alert.alert(
      booking.propertyTitle,
      `Status: ${booking.status}\nLandlord: ${booking.landlordName}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('View details:', booking.id) }
      ]
    );
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  /**
   * Render booking item
   */
  const renderBookingItem = ({ item, index }: { item: BookingHistoryItem; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(600)}
    >
      <TouchableOpacity
        onPress={() => handleBookingPress(item)}
        className="bg-white p-4 mb-4 rounded-2xl"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800 mb-1">
              {item.propertyTitle}
            </Text>
            <Text className="text-gray-600 mb-2">📍 {item.propertyLocation}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
            <Text className="text-white font-bold text-xs">
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-sm text-gray-500">Period</Text>
            <Text className="text-gray-800 font-medium">
              {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
            </Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500">Monthly Rent</Text>
            <Text className="text-lg font-bold text-purple-600">
              {item.propertyPrice} MAD
            </Text>
          </View>
        </View>

        <View className="border-t border-gray-100 pt-3 flex-row justify-between items-center">
          <View>
            <Text className="text-sm text-gray-500">Landlord</Text>
            <Text className="text-gray-800 font-medium">{item.landlordName}</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500">Total Paid</Text>
            <Text className="text-gray-800 font-bold">{item.totalAmount} MAD</Text>
          </View>
        </View>

        {/* Action buttons based on status */}
        {item.status === 'upcoming' && (
          <View className="flex-row mt-3 space-x-2">
            <TouchableOpacity 
              className="flex-1 bg-red-100 py-2 rounded-lg"
              onPress={() => Alert.alert('Cancel Booking', 'Cancel booking functionality will be implemented')}
            >
              <Text className="text-red-600 font-bold text-center text-sm">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-blue-100 py-2 rounded-lg"
              onPress={() => Alert.alert('Modify Booking', 'Modify booking functionality will be implemented')}
            >
              <Text className="text-blue-600 font-bold text-center text-sm">Modify</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'active' && (
          <View className="flex-row mt-3 space-x-2">
            <TouchableOpacity 
              className="flex-1 bg-green-100 py-2 rounded-lg"
              onPress={() => Alert.alert('Contact Landlord', 'Contact functionality will be implemented')}
            >
              <Text className="text-green-600 font-bold text-center text-sm">Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-purple-100 py-2 rounded-lg"
              onPress={() => Alert.alert('Pay Rent', 'Payment functionality will be implemented')}
            >
              <Text className="text-purple-600 font-bold text-center text-sm">Pay Rent</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'completed' && (
          <View className="flex-row mt-3">
            <TouchableOpacity 
              className="flex-1 bg-gray-100 py-2 rounded-lg"
              onPress={() => Alert.alert('Download Receipt', 'Receipt download functionality will be implemented')}
            >
              <Text className="text-gray-600 font-bold text-center text-sm">Download Receipt</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  /**
   * Render filter button
   */
  const renderFilterButton = (label: string, value: string, count: number) => (
    <TouchableOpacity
      onPress={() => handleFilterChange(value)}
      className={`px-4 py-2 rounded-full mr-3 ${
        activeFilter === value ? 'bg-purple-500' : 'bg-gray-100'
      }`}
    >
      <Text className={`font-medium ${
        activeFilter === value ? 'text-white' : 'text-gray-600'
      }`}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-4xl mb-4">📋</Text>
        <Text className="text-gray-600 mt-2">Loading booking history...</Text>
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
        <Text className="text-3xl font-bold text-gray-800 mb-2">
          Booking History
        </Text>
        <Text className="text-gray-600">
          View and manage your bookings
        </Text>
      </Animated.View>

      {/* Filters */}
      <Animated.View 
        entering={FadeInDown.delay(300).duration(600)}
        className="bg-white px-6 py-4 border-b border-gray-100"
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton('All', 'all', bookings.length)}
          {renderFilterButton('Active', 'active', bookings.filter(b => b.status === 'active').length)}
          {renderFilterButton('Upcoming', 'upcoming', bookings.filter(b => b.status === 'upcoming').length)}
          {renderFilterButton('Completed', 'completed', bookings.filter(b => b.status === 'completed').length)}
          {renderFilterButton('Cancelled', 'cancelled', bookings.filter(b => b.status === 'cancelled').length)}
        </ScrollView>
      </Animated.View>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Animated.View 
          entering={FadeInDown.delay(400).duration(600)}
          className="flex-1 justify-center items-center px-6"
        >
          <Text className="text-6xl mb-4">📋</Text>
          <Text className="text-xl font-bold text-gray-800 mb-2">No Bookings Found</Text>
          <Text className="text-gray-600 text-center">
            {activeFilter === 'all' 
              ? "You haven't made any bookings yet" 
              : `No ${activeFilter} bookings found`}
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      {/* Summary Stats */}
      {bookings.length > 0 && (
        <Animated.View 
          entering={FadeInUp.delay(500).duration(600)}
          className="bg-white border-t border-gray-200 p-4"
        >
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-purple-600">
                {bookings.length}
              </Text>
              <Text className="text-gray-600 text-sm">Total Bookings</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'active').length}
              </Text>
              <Text className="text-gray-600 text-sm">Active</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">
                {bookings.filter(b => b.status === 'upcoming').length}
              </Text>
              <Text className="text-gray-600 text-sm">Upcoming</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-600">
                {bookings.filter(b => b.status === 'completed').length}
              </Text>
              <Text className="text-gray-600 text-sm">Completed</Text>
            </View>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default BookingHistoryScreen;
