import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView, RefreshControl, Pressable } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { HStack } from '../../components/ui/hstack';
import { Divider } from '../../components/ui/divider';
import { useNavigation } from '@react-navigation/native';
import { Spinner } from '../../components/ui/spinner';
import { Badge } from '../../components/ui/badge';
import { useSelector } from 'react-redux';

export default function BookingManagementScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const user = useSelector((state: any) => state.auth.user);

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'active' | 'completed' | 'all'>('pending');

  // Filter bookings based on selected tab
  const filteredBookings = bookings.filter(booking => {
    switch (selectedTab) {
      case 'pending':
        return booking.status === 'Pending';
      case 'active':
        return booking.status === 'Confirmed' || booking.status === 'Active';
      case 'completed':
        return booking.status === 'Completed' || booking.status === 'Cancelled';
      case 'all':
      default:
        return true;
    }
  });

  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      // Mock API call - would be implemented in landlordService
      const response = await Promise.resolve({
        data: [
          {
            _id: '1',
            propertyId: { title: 'Modern Apartment Downtown', images: ['https://example.com/img1.jpg'] },
            studentId: { firstName: 'Ahmed', lastName: 'Ben Ali', email: 'ahmed@example.com' },
            startDate: '2025-02-01',
            endDate: '2025-07-31',
            monthlyRent: 1200,
            totalAmount: 1800,
            status: 'Pending',
            paymentStatus: 'Pending',
            createdAt: '2025-01-15T10:30:00.000Z'
          },
          {
            _id: '2', 
            propertyId: { title: 'Student House Near University', images: ['https://example.com/img2.jpg'] },
            studentId: { firstName: 'Fatima', lastName: 'El Mansouri', email: 'fatima@example.com' },
            startDate: '2025-01-15',
            endDate: '2025-06-15',
            monthlyRent: 1000,
            totalAmount: 1500,
            status: 'Confirmed',
            paymentStatus: 'Paid',
            createdAt: '2025-01-10T09:15:00.000Z'
          }
        ]
      });
      setBookings(response.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, [fetchBookings]);

  const handleApproveBooking = async (bookingId: string) => {
    try {
      // Mock API call - would be implemented in landlordService
      await Promise.resolve();
      console.log('Approve booking:', bookingId);
      fetchBookings(); // Refresh list
    } catch (e: any) {
      setError(e.message || 'Failed to approve booking');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      // Mock API call - would be implemented in landlordService
      await Promise.resolve();
      console.log('Reject booking:', bookingId);
      fetchBookings(); // Refresh list
    } catch (e: any) {
      setError(e.message || 'Failed to reject booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return currentTheme.colors.warning;
      case 'Confirmed': return currentTheme.colors.success;
      case 'Active': return currentTheme.colors.primary;
      case 'Completed': return currentTheme.colors.secondary;
      case 'Cancelled': return currentTheme.colors.error;
      default: return currentTheme.colors.text.secondary;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return currentTheme.colors.success;
      case 'Pending': return currentTheme.colors.warning;
      case 'Failed': return currentTheme.colors.error;
      default: return currentTheme.colors.text.secondary;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <VStack space="lg" style={{ flex: 1, padding: currentTheme.spacing.md }}>
        <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>
          Booking Management
        </Text>
        
        {/* Tab Navigation */}
        <HStack space="xs" style={{ marginBottom: currentTheme.spacing.md }}>
          {(['pending', 'active', 'completed', 'all'] as const).map((tab) => (
            <Button
              key={tab}
              action={selectedTab === tab ? 'primary' : 'secondary'}
              size="sm"
              style={{ flex: 1 }}
              onPress={() => setSelectedTab(tab)}
            >
              <ButtonText>{tab.charAt(0).toUpperCase() + tab.slice(1)}</ButtonText>
            </Button>
          ))}
        </HStack>

        <Divider />

        {loading ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Spinner size="large" />
          </Box>
        ) : error ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text size="md" style={{ color: currentTheme.colors.error, marginBottom: currentTheme.spacing.md }}>
              {error}
            </Text>
            <Button action="primary" onPress={fetchBookings}>
              <ButtonText>Retry</ButtonText>
            </Button>
          </Box>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
          >
            <VStack space="md">
              {filteredBookings.length === 0 ? (
                <Text size="md" style={{ color: currentTheme.colors.text.secondary, textAlign: 'center', marginTop: currentTheme.spacing.xl }}>
                  No {selectedTab} bookings found.
                </Text>
              ) : (
                filteredBookings.map((booking: any) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    currentTheme={currentTheme}
                    onApprove={handleApproveBooking}
                    onReject={handleRejectBooking}
                    onViewDetails={() => navigation.navigate('BookingDetails', { id: booking._id })}
                    getStatusColor={getStatusColor}
                    getPaymentStatusColor={getPaymentStatusColor}
                  />
                ))
              )}
            </VStack>
          </ScrollView>
        )}
      </VStack>
    </SafeAreaView>
  );
}

function BookingCard({ 
  booking, 
  currentTheme, 
  onApprove, 
  onReject, 
  onViewDetails, 
  getStatusColor, 
  getPaymentStatusColor 
}: any) {
  return (
    <Card style={{ padding: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.card }}>
      <Pressable onPress={onViewDetails} accessible accessibilityRole="button">
        <VStack space="sm">
          {/* Header with property and status */}
          <HStack style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <VStack space="xs" style={{ flex: 1 }}>
              <Text size="lg" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>
                {booking.propertyId?.title || 'Property'}
              </Text>
              <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
                {booking.studentId?.firstName} {booking.studentId?.lastName}
              </Text>
              <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
                {booking.studentId?.email}
              </Text>
            </VStack>
            <VStack space="xs" style={{ alignItems: 'flex-end' }}>
              <Badge variant="solid" style={{ backgroundColor: getStatusColor(booking.status) }}>
                <Text size="xs" style={{ color: 'white' }}>{booking.status}</Text>
              </Badge>
              <Badge variant="outline" style={{ borderColor: getPaymentStatusColor(booking.paymentStatus) }}>
                <Text size="xs" style={{ color: getPaymentStatusColor(booking.paymentStatus) }}>
                  {booking.paymentStatus}
                </Text>
              </Badge>
            </VStack>
          </HStack>

          {/* Booking details */}
          <Divider style={{ marginVertical: currentTheme.spacing.xs }} />
          <HStack style={{ justifyContent: 'space-between' }}>
            <VStack space="xs">
              <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>Duration</Text>
              <Text size="sm" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                {booking.startDate} - {booking.endDate}
              </Text>
            </VStack>
            <VStack space="xs" style={{ alignItems: 'flex-end' }}>
              <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>Total Amount</Text>
              <Text size="lg" style={{ fontWeight: '700', color: currentTheme.colors.primary }}>
                {booking.totalAmount} MAD
              </Text>
            </VStack>
          </HStack>

          {/* Action buttons for pending bookings */}
          {booking.status === 'Pending' && (
            <HStack space="sm" style={{ marginTop: currentTheme.spacing.md }}>
              <Button 
                action="secondary" 
                variant="outline" 
                size="sm" 
                style={{ flex: 1 }}
                onPress={(e: any) => {
                  e.stopPropagation();
                  onReject(booking._id);
                }}
              >
                <ButtonText>Reject</ButtonText>
              </Button>
              <Button 
                action="primary" 
                size="sm" 
                style={{ flex: 1 }}
                onPress={(e: any) => {
                  e.stopPropagation();
                  onApprove(booking._id);
                }}
              >
                <ButtonText>Approve</ButtonText>
              </Button>
            </HStack>
          )}

          {/* Quick actions for other statuses */}
          {booking.status !== 'Pending' && (
            <HStack space="sm" style={{ marginTop: currentTheme.spacing.md, justifyContent: 'flex-end' }}>
              <Button action="secondary" size="sm" onPress={onViewDetails}>
                <ButtonText>View Details</ButtonText>
              </Button>
              {booking.status === 'Confirmed' && (
                <Button action="primary" size="sm">
                  <ButtonText>Contact Tenant</ButtonText>
                </Button>
              )}
            </HStack>
          )}
        </VStack>
      </Pressable>
    </Card>
  );
}
