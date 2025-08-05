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
import { landlordService } from '../services/landlordService';
import { Booking } from '../types'; // Import the Booking type

export default function BookingManagementScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const user = useSelector((state: any) => state.auth.user);

  const [bookings, setBookings] = useState<Booking[]>([]); // Use the Booking type
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'confirmed' | 'cancelled' | 'completed' | 'all'>('pending');

  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const statusToFetch = selectedTab === 'all' ? undefined : selectedTab;
      const response = await landlordService.getMyBookings(statusToFetch);
      
      // Handle the paginated response structure from BookingsResponse
      if (response && response.data && Array.isArray(response.data.bookings)) {
        setBookings(response.data.bookings);
      } else {
        setBookings([]); // Ensure bookings is always an array
      }

    } catch (e: any) {
      setError(e.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, selectedTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, [fetchBookings]);

  const handleApproveBooking = async (bookingId: string) => {
    try {
      await landlordService.approveBooking(bookingId);
      console.log('Approve booking:', bookingId);
      fetchBookings(); // Refresh list
    } catch (e: any) {
      setError(e.message || 'Failed to approve booking');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await landlordService.rejectBooking(bookingId, 'Rejected by landlord');
      console.log('Reject booking:', bookingId);
      fetchBookings(); // Refresh list
    } catch (e: any) {
      setError(e.message || 'Failed to reject booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return currentTheme.colors.warning;
      case 'confirmed': return currentTheme.colors.success;
      case 'active': return currentTheme.colors.primary;
      case 'completed': return currentTheme.colors.secondary;
      case 'cancelled': return currentTheme.colors.error;
      default: return currentTheme.colors.text.secondary;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return currentTheme.colors.success;
      case 'pending': return currentTheme.colors.warning;
      case 'partial': return currentTheme.colors.warning;
      case 'failed': return currentTheme.colors.error;
      case 'refunded': return currentTheme.colors.secondary;
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
          {(['pending', 'confirmed', 'completed', 'cancelled', 'all'] as const).map((tab) => (
            <Button
              key={tab}
              action={selectedTab === tab ? 'primary' : 'secondary'}
              size="sm"
              style={{ 
                flex: 1,
                paddingVertical: currentTheme.spacing.sm,
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 40
              }}
              onPress={() => setSelectedTab(tab)}
            >
              <ButtonText style={{ 
                textAlign: 'center',
                fontSize: 12,
                fontWeight: selectedTab === tab ? '600' : '400'
              }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </ButtonText>
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
              {bookings.length === 0 ? (
                <Text size="md" style={{ color: currentTheme.colors.text.secondary, textAlign: 'center', marginTop: currentTheme.spacing.xl }}>
                  No {selectedTab} bookings found.
                </Text>
              ) : (
                bookings.map((booking: Booking) => ( // Use Booking type here
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
}: { booking: Booking; [key: string]: any }) { // Add type for booking prop
  return (
    <Card style={{ 
      padding: currentTheme.spacing.md, 
      borderRadius: currentTheme.borderRadius.card,
      backgroundColor: currentTheme.colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    }}>
      <Pressable onPress={onViewDetails} accessible accessibilityRole="button">
        <VStack space="md">
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
            <HStack space="xs" style={{ alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Badge variant="solid" style={{ backgroundColor: getStatusColor(booking.status) }}>
                <Text size="xs" style={{ color: 'white', fontWeight: '600' }}>{booking.status}</Text>
              </Badge>
              <Badge variant="outline" style={{ borderColor: getPaymentStatusColor(booking.paymentStatus) }}>
                <Text size="xs" style={{ color: getPaymentStatusColor(booking.paymentStatus), fontWeight: '500' }}>
                  {booking.paymentStatus}
                </Text>
              </Badge>
            </HStack>
          </HStack>

          {/* Payment and Financial Details */}
          <Divider style={{ marginVertical: currentTheme.spacing.xs }} />
          <VStack space="sm">
            <HStack style={{ justifyContent: 'space-between' }}>
              <VStack space="xs" style={{ flex: 1 }}>
                <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>Monthly Rent</Text>
                <Text size="sm" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                  {booking.monthlyRent} MAD
                </Text>
              </VStack>
              <VStack space="xs" style={{ flex: 1, alignItems: 'center' }}>
                <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>Security Deposit</Text>
                <Text size="sm" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                  {booking.securityDeposit} MAD
                </Text>
              </VStack>
              <VStack space="xs" style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>Total Amount</Text>
                <Text size="lg" style={{ fontWeight: '700', color: currentTheme.colors.primary }}>
                  {booking.totalAmount} MAD
                </Text>
              </VStack>
            </HStack>
            
            {/* Payment Method and Duration */}
            <HStack style={{ justifyContent: 'space-between', marginTop: currentTheme.spacing.xs }}>
              <VStack space="xs" style={{ flex: 1 }}>
                <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>Payment Method</Text>
                <Text size="sm" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                  {booking.paymentMethod}
                </Text>
              </VStack>
              <VStack space="xs" style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>Duration</Text>
                <Text size="sm" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                  {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                </Text>
              </VStack>
            </HStack>
          </VStack>

          {/* Payment Verification Status */}
          {booking.paymentVerification && (
            <>
              <Divider style={{ marginVertical: currentTheme.spacing.xs }} />
              <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>
                  Payment Verification
                </Text>
                <Badge 
                  variant="outline" 
                  style={{ 
                    borderColor: booking.paymentVerification.status === 'Verified' ? 
                      currentTheme.colors.success : 
                      booking.paymentVerification.status === 'Rejected' ? 
                        currentTheme.colors.error : 
                        currentTheme.colors.warning
                  }}
                >
                  <Text size="xs" style={{ 
                    color: booking.paymentVerification.status === 'Verified' ? 
                      currentTheme.colors.success : 
                      booking.paymentVerification.status === 'Rejected' ? 
                        currentTheme.colors.error : 
                        currentTheme.colors.warning,
                    fontWeight: '500'
                  }}>
                    {booking.paymentVerification.status}
                  </Text>
                </Badge>
              </HStack>
            </>
          )}

          {/* Action buttons for pending bookings */}
          {booking.status.toLowerCase() === 'pending' && (
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
          {booking.status.toLowerCase() !== 'pending' && (
            <VStack space="sm" style={{ marginTop: currentTheme.spacing.md }}>
              {/* Primary action row */}
              <HStack space="sm" style={{ justifyContent: 'space-between' }}>
                <Button 
                  action="secondary" 
                  variant="outline" 
                  size="sm" 
                  style={{ flex: 1 }}
                  onPress={onViewDetails}
                >
                  <ButtonText>View Details</ButtonText>
                </Button>
                
                {booking.status.toLowerCase() === 'confirmed' && (
                  <Button 
                    action="primary" 
                    size="sm" 
                    style={{ flex: 1 }}
                  >
                    <ButtonText>Contact Tenant</ButtonText>
                  </Button>
                )}
                
                {booking.status.toLowerCase() === 'completed' && booking.paymentStatus === 'paid' && (
                  <Button 
                    action="positive" 
                    size="sm" 
                    style={{ flex: 1 }}
                  >
                    <ButtonText>Generate Receipt</ButtonText>
                  </Button>
                )}
              </HStack>

              {/* Secondary actions row for payment proof and additional options */}
              {(booking.paymentProof || booking.status.toLowerCase() === 'completed') && (
                <HStack space="sm" style={{ justifyContent: 'center' }}>
                  {booking.paymentProof && (
                    <Button 
                      action="secondary" 
                      variant="outline" 
                      size="sm"
                      style={{ minWidth: 120 }}
                    >
                      <ButtonText>View Proof</ButtonText>
                    </Button>
                  )}
                  {booking.status.toLowerCase() === 'completed' && (
                    <Button 
                      action="secondary" 
                      variant="outline" 
                      size="sm"
                      style={{ minWidth: 120 }}
                    >
                      <ButtonText>Download Contract</ButtonText>
                    </Button>
                  )}
                </HStack>
              )}
            </VStack>
          )}
        </VStack>
      </Pressable>
    </Card>
  );
}