import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView, Image, Pressable } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { HStack } from '../../components/ui/hstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Divider } from '../../components/ui/divider';
import { useRoute, useNavigation } from '@react-navigation/native';
import { bookingService } from '../services/bookingService';
import { Spinner } from '../../components/ui/spinner';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Booking } from '../types';

export default function BookingDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const bookingId = route.params?.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setError(null);
      try {
        const response: any = await bookingService.getBookingById(bookingId);
        // Handle both direct booking object and wrapped response
        setBooking(response.data || response);
      } catch (e: any) {
        setError(e.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    if (bookingId) fetchBooking();
  }, [bookingId]);

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await bookingService.cancelBooking(bookingId);
      navigation.goBack();
    } catch (e: any) {
      setError(e.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
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

  const getVerificationColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified': return currentTheme.colors.success;
      case 'pending': return currentTheme.colors.warning;
      case 'rejected': return currentTheme.colors.error;
      default: return currentTheme.colors.text.secondary;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, padding: currentTheme.spacing.md }} 
        showsVerticalScrollIndicator={false}
      >
        <VStack space="lg" style={{ width: '100%' }}>
          {/* Header */}
          <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>
              Booking Details
            </Text>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="close" size={24} color={currentTheme.colors.text.primary} />
            </Pressable>
          </HStack>

          {loading ? (
            <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
              <Spinner size="large" />
              <Text size="md" style={{ color: currentTheme.colors.text.secondary, marginTop: currentTheme.spacing.md }}>
                Loading booking details...
              </Text>
            </Box>
          ) : error ? (
            <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
              <MaterialCommunityIcons name="alert-circle" size={48} color={currentTheme.colors.error} />
              <Text size="md" style={{ color: currentTheme.colors.error, marginTop: currentTheme.spacing.md, textAlign: 'center' }}>
                {error}
              </Text>
              <Button action="primary" onPress={() => window.location.reload()} style={{ marginTop: currentTheme.spacing.md }}>
                <ButtonText>Try Again</ButtonText>
              </Button>
            </Box>
          ) : booking ? (
            <VStack space="lg">
              {/* Status Overview */}
              <Card style={{ padding: currentTheme.spacing.md, backgroundColor: currentTheme.colors.surface }}>
                <VStack space="md">
                  <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>
                      Booking Status
                    </Text>
                    <HStack space="sm">
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
                  
                  {booking.paymentVerification && (
                    <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
                        Payment Verification
                      </Text>
                      <Badge variant="outline" style={{ borderColor: getVerificationColor(booking.paymentVerification.status) }}>
                        <Text size="xs" style={{ 
                          color: getVerificationColor(booking.paymentVerification.status), 
                          fontWeight: '500' 
                        }}>
                          {booking.paymentVerification.status}
                        </Text>
                      </Badge>
                    </HStack>
                  )}
                </VStack>
              </Card>

              {/* Property Information */}
              <Card style={{ padding: currentTheme.spacing.md, backgroundColor: currentTheme.colors.surface }}>
                <VStack space="md">
                  <HStack style={{ alignItems: 'center' }}>
                    <MaterialCommunityIcons name="home" size={24} color={currentTheme.colors.primary} />
                    <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginLeft: currentTheme.spacing.xs }}>
                      Property Details
                    </Text>
                  </HStack>
                  
                  <VStack space="sm">
                    <Text size="lg" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                      {booking.propertyId?.title}
                    </Text>
                    <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
                      {booking.propertyId?.address}
                    </Text>
                    <Text size="sm" style={{ color: currentTheme.colors.text.secondary, lineHeight: 20 }}>
                      {booking.propertyId?.description}
                    </Text>
                    
                    <Divider style={{ marginVertical: currentTheme.spacing.xs }} />
                    
                    <HStack style={{ justifyContent: 'space-between' }}>
                      <VStack style={{ flex: 1 }}>
                        <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>Room Type</Text>
                        <Text size="sm" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                          {booking.propertyId?.roomType}
                        </Text>
                      </VStack>
                      <VStack style={{ flex: 1, alignItems: 'center' }}>
                        <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>Max Tenants</Text>
                        <Text size="sm" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                          {booking.propertyId?.maxTenants}
                        </Text>
                      </VStack>
                      <VStack style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>Distance to Uni</Text>
                        <Text size="sm" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                          {booking.propertyId?.distanceToUniversity}m
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Property Images */}
                    {booking.propertyId?.images && booking.propertyId.images.length > 0 && (
                      <VStack space="xs" style={{ marginTop: currentTheme.spacing.sm }}>
                        <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>Property Images</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <HStack space="sm">
                            {booking.propertyId.images.slice(0, 3).map((image, index) => (
                              <Image
                                key={index}
                                source={{ uri: image }}
                                style={{
                                  width: 80,
                                  height: 60,
                                  borderRadius: currentTheme.borderRadius.small,
                                  backgroundColor: currentTheme.colors.surface
                                }}
                                resizeMode="cover"
                              />
                            ))}
                          </HStack>
                        </ScrollView>
                      </VStack>
                    )}
                  </VStack>
                </VStack>
              </Card>

              {/* Tenant Information */}
              <Card style={{ padding: currentTheme.spacing.md, backgroundColor: currentTheme.colors.surface }}>
                <VStack space="md">
                  <HStack style={{ alignItems: 'center' }}>
                    <MaterialCommunityIcons name="account" size={24} color={currentTheme.colors.primary} />
                    <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginLeft: currentTheme.spacing.xs }}>
                      Tenant Information
                    </Text>
                  </HStack>
                  
                  <HStack space="md" style={{ alignItems: 'center' }}>
                    <Image
                      source={{ uri: booking.studentId?.profileImage }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: currentTheme.colors.surface
                      }}
                      resizeMode="cover"
                    />
                    <VStack space="xs" style={{ flex: 1 }}>
                      <Text size="lg" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                        {booking.studentId?.firstName} {booking.studentId?.lastName}
                      </Text>
                      <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
                        {booking.studentId?.email}
                      </Text>
                      <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
                        {booking.studentId?.phone}
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </Card>

              {/* Landlord Information */}
              <Card style={{ padding: currentTheme.spacing.md, backgroundColor: currentTheme.colors.surface }}>
                <VStack space="md">
                  <HStack style={{ alignItems: 'center' }}>
                    <MaterialCommunityIcons name="account-tie" size={24} color={currentTheme.colors.primary} />
                    <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginLeft: currentTheme.spacing.xs }}>
                      Landlord Information
                    </Text>
                  </HStack>
                  
                  <HStack space="md" style={{ alignItems: 'center' }}>
                    <Image
                      source={{ uri: booking.landlordId?.profileImage }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: currentTheme.colors.surface
                      }}
                      resizeMode="cover"
                    />
                    <VStack space="xs" style={{ flex: 1 }}>
                      <Text size="lg" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                        {booking.landlordId?.firstName} {booking.landlordId?.lastName}
                      </Text>
                      <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
                        {booking.landlordId?.email}
                      </Text>
                      <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
                        {booking.landlordId?.phone}
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </Card>

              {/* Financial Details */}
              <Card style={{ padding: currentTheme.spacing.md, backgroundColor: currentTheme.colors.surface }}>
                <VStack space="md">
                  <HStack style={{ alignItems: 'center' }}>
                    <MaterialCommunityIcons name="currency-usd" size={24} color={currentTheme.colors.primary} />
                    <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginLeft: currentTheme.spacing.xs }}>
                      Financial Details
                    </Text>
                  </HStack>
                  
                  <VStack space="sm">
                    <HStack style={{ justifyContent: 'space-between' }}>
                      <VStack style={{ flex: 1 }}>
                        <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>Monthly Rent</Text>
                        <Text size="md" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                          {booking.monthlyRent} MAD
                        </Text>
                      </VStack>
                      <VStack style={{ flex: 1, alignItems: 'center' }}>
                        <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>Security Deposit</Text>
                        <Text size="md" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                          {booking.securityDeposit} MAD
                        </Text>
                      </VStack>
                      <VStack style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>Total Amount</Text>
                        <Text size="lg" style={{ fontWeight: '700', color: currentTheme.colors.primary }}>
                          {booking.totalAmount} MAD
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <Divider style={{ marginVertical: currentTheme.spacing.xs }} />
                    
                    <HStack style={{ justifyContent: 'space-between' }}>
                      <VStack style={{ flex: 1 }}>
                        <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>Payment Method</Text>
                        <Text size="sm" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                          {booking.paymentMethod}
                        </Text>
                      </VStack>
                      <VStack style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>Duration</Text>
                        <Text size="sm" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Payment Proof */}
                    {booking.paymentProof && (
                      <VStack space="xs" style={{ marginTop: currentTheme.spacing.sm }}>
                        <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>Payment Proof</Text>
                        <Image
                          source={{ uri: booking.paymentProof }}
                          style={{
                            width: '100%',
                            height: 120,
                            borderRadius: currentTheme.borderRadius.small,
                            backgroundColor: currentTheme.colors.surface
                          }}
                          resizeMode="cover"
                        />
                      </VStack>
                    )}
                  </VStack>
                </VStack>
              </Card>

              {/* Timeline */}
              <Card style={{ padding: currentTheme.spacing.md, backgroundColor: currentTheme.colors.surface }}>
                <VStack space="md">
                  <HStack style={{ alignItems: 'center' }}>
                    <MaterialCommunityIcons name="timeline" size={24} color={currentTheme.colors.primary} />
                    <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginLeft: currentTheme.spacing.xs }}>
                      Booking Timeline
                    </Text>
                  </HStack>
                  <BookingTimeline status={booking.status} paymentStatus={booking.paymentStatus} theme={currentTheme} />
                </VStack>
              </Card>

              {/* Roommates */}
              {booking.roommates && booking.roommates.length > 0 && (
                <Card style={{ padding: currentTheme.spacing.md, backgroundColor: currentTheme.colors.surface }}>
                  <VStack space="md">
                    <HStack style={{ alignItems: 'center' }}>
                      <MaterialCommunityIcons name="account-group" size={24} color={currentTheme.colors.primary} />
                      <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginLeft: currentTheme.spacing.xs }}>
                        Roommates ({booking.roommates.length})
                      </Text>
                    </HStack>
                    {booking.roommates.map((roommate: any, index: number) => (
                      <HStack key={index} space="md" style={{ alignItems: 'center', paddingVertical: currentTheme.spacing.xs }}>
                        <MaterialCommunityIcons name="account-circle" size={40} color={currentTheme.colors.primary} />
                        <VStack style={{ flex: 1 }}>
                          <Text size="md" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                            {roommate.firstName} {roommate.lastName}
                          </Text>
                          <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
                            {roommate.email}
                          </Text>
                        </VStack>
                        <Badge variant="outline">
                          <Text size="xs" style={{ color: currentTheme.colors.text.secondary }}>
                            {roommate.status || 'Pending'}
                          </Text>
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Card>
              )}

              {/* Action Buttons */}
              <VStack space="md" style={{ marginTop: currentTheme.spacing.md }}>
                {booking.status.toLowerCase() !== 'cancelled' && booking.status.toLowerCase() !== 'completed' && (
                  <Button 
                    action="secondary" 
                    variant="outline" 
                    onPress={() => navigation.navigate('DisputeScreen', { bookingId })}
                  >
                    <ButtonText>Raise Dispute</ButtonText>
                  </Button>
                )}
                
                <HStack space="md">
                  {booking.status.toLowerCase() !== 'cancelled' && (
                    <Button 
                      action="secondary" 
                      variant="outline" 
                      style={{ flex: 1 }}
                      onPress={handleCancel} 
                      disabled={actionLoading}
                    >
                      <ButtonText>Cancel Booking</ButtonText>
                    </Button>
                  )}
                  <Button 
                    action="primary" 
                    style={{ flex: 1 }}
                    onPress={() => navigation.navigate('BookingPaymentScreen', { bookingId })}
                  >
                    <ButtonText>Payment Details</ButtonText>
                  </Button>
                </HStack>
                
                {booking.paymentProof && (
                  <Button action="secondary" variant="outline">
                    <ButtonText>View Full Payment Proof</ButtonText>
                  </Button>
                )}
              </VStack>
            </VStack>
          ) : null}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

function BookingTimeline({ status, paymentStatus, theme }: any) {
  // Define stages and icons based on actual booking statuses
  const stages = [
    { key: 'pending', label: 'Requested', icon: 'calendar-clock' },
    { key: 'confirmed', label: 'Confirmed', icon: 'check-circle' },
    { key: 'active', label: 'Active', icon: 'home' },
    { key: 'completed', label: 'Completed', icon: 'flag-checkered' },
    { key: 'cancelled', label: 'Cancelled', icon: 'close-circle' },
  ];

  // Determine current stage
  const currentStage = status?.toLowerCase();
  const currentIdx = stages.findIndex(s => s.key === currentStage);

  return (
    <VStack space="md">
      <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        {stages.map((stage, idx) => {
          const isActive = idx === currentIdx;
          const isCompleted = idx < currentIdx;
          const isCancelled = currentStage === 'cancelled' && stage.key === 'cancelled';
          
          return (
            <VStack key={stage.key} style={{ alignItems: 'center', flex: 1 }}>
              <Box style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 
                  isActive || isCancelled ? theme.colors.primary :
                  isCompleted ? theme.colors.success :
                  theme.colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: theme.spacing.xs
              }}>
                <MaterialCommunityIcons
                  name={stage.icon as any}
                  size={20}
                  color={
                    isActive || isCompleted || isCancelled ? 'white' : theme.colors.text.secondary
                  }
                />
              </Box>
              <Text 
                size="xs" 
                style={{ 
                  color: isActive || isCompleted || isCancelled ? 
                    theme.colors.primary : 
                    theme.colors.text.secondary, 
                  textAlign: 'center',
                  fontWeight: isActive ? '600' : '400'
                }}
              >
                {stage.label}
              </Text>
            </VStack>
          );
        })}
      </HStack>
      
      {/* Progress bar */}
      <Box style={{ 
        height: 4, 
        backgroundColor: theme.colors.border, 
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        <Box style={{
          height: '100%',
          backgroundColor: currentStage === 'cancelled' ? theme.colors.error : theme.colors.success,
          width: currentStage === 'cancelled' ? '100%' : `${Math.max(0, (currentIdx / (stages.length - 2)) * 100)}%`,
          borderRadius: 2
        }} />
      </Box>
    </VStack>
  );
} 