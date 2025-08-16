import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView, Image as RNImage } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { HStack } from '../../components/ui/hstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Divider } from '../../components/ui/divider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PAYMENT_METHODS } from '../utils/config';
import { bookingService } from '../services/bookingService';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Spinner } from '../../components/ui/spinner';
import { Booking } from '../types';

export default function BookingPaymentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const bookingId = route.params?.bookingId;
  const bookingData = route.params?.bookingData;

  // Booking data state
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('');
  const [proofImage, setProofImage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const initializeBooking = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (bookingId) {
          // Fetch existing booking for viewing/editing
          const response: any = await bookingService.getBookingById(bookingId);
          setBooking(response.data || response);
        } else if (bookingData) {
          // Prepare booking data for display but don't create booking yet
          const roommates = route.params?.roommates || [];
          const monthlyRent = bookingData.monthlyRent || 0;
          const securityDeposit = bookingData.securityDeposit || 0;
          const totalAmount = monthlyRent + securityDeposit;
          
          // Create a temporary booking object for display
          const tempBooking = {
            propertyId: bookingData.propertyId,
            startDate: bookingData.startDate,
            endDate: bookingData.endDate,
            monthlyRent,
            securityDeposit,
            totalAmount,
            roommates,
            paymentStatus: 'Pending',
            status: 'Pending',
            paymentMethod: null
          };
          
          setBooking(tempBooking as any);
        } else {
          setError('No booking data provided');
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    
    initializeBooking();
  }, [bookingId, bookingData, route.params?.roommates]);

  const handleSelectMethod = async (method: string) => {
    setPaymentMethod(method);
    setError(null);
    // Remove instructions fetching - just set the payment method
  };

  const handlePickImage = async () => {
    setError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProofImage(result.assets[0]);
    }
  };

  const handleUploadProof = async () => {
    if (!proofImage || !paymentMethod) return;
    
    setUploading(true);
    setError(null);
    
    try {
      // First, create the booking with payment details
      if (bookingData && !booking?._id) {
        const roommates = route.params?.roommates || [];
        const roommateIds = roommates.map((r: any) => r._id).filter(Boolean);
        const monthlyRent = bookingData.monthlyRent || 0;
        const securityDeposit = bookingData.securityDeposit || 0;
        const totalAmount = monthlyRent + securityDeposit;
        
        const newBookingData = {
          propertyId: bookingData.propertyId,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          monthlyRent,
          securityDeposit,
          totalAmount,
          roommates: roommateIds,
          paymentMethod // Use selected payment method
        };
        
        const createdBooking = await bookingService.createBooking(newBookingData);
        setBooking(createdBooking);
        
        // Upload payment proof to the created booking
        const formData = new FormData();
        formData.append('proof', {
          uri: proofImage.uri,
          name: 'payment_proof.jpg',
          type: 'image/jpeg',
        } as any);
        
        await bookingService.uploadPaymentProof(createdBooking._id, formData);
        
        setSuccess(true);
        
        // Navigate to booking details or success screen
        setTimeout(() => {
          navigation.replace('BookingDetails', { id: createdBooking._id });
        }, 2000);
      } else if (booking?._id) {
        // For existing bookings, just upload proof
        const formData = new FormData();
        formData.append('proof', {
          uri: proofImage.uri,
          name: 'payment_proof.jpg',
          type: 'image/jpeg',
        } as any);
        
        await bookingService.uploadPaymentProof(booking._id, formData);
        setSuccess(true);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to submit payment');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return currentTheme.colors.success;
      case 'pending': return currentTheme.colors.warning;
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

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
        <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size="large" />
          <Text size="md" style={{ color: currentTheme.colors.text.secondary, marginTop: currentTheme.spacing.md }}>
            Loading payment details...
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  if (error || !booking) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
        <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: currentTheme.spacing.md }}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={currentTheme.colors.error} />
          <Text size="md" style={{ color: currentTheme.colors.error, marginTop: currentTheme.spacing.md, textAlign: 'center' }}>
            {error || 'Booking not found'}
          </Text>
          <Button action="primary" onPress={() => navigation.goBack()} style={{ marginTop: currentTheme.spacing.md }}>
            <ButtonText>Go Back</ButtonText>
          </Button>
        </Box>
      </SafeAreaView>
    );
  }

  const isPaid = booking?.paymentStatus?.toLowerCase() === 'paid';
  const isCompleted = booking?.status?.toLowerCase() === 'completed';
  const isNewBooking = !booking?._id; // True if this is a new booking being created

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, padding: currentTheme.spacing.md }} 
        showsVerticalScrollIndicator={false}
      >
        <VStack space="lg" style={{ flex: 1 }}>
          {/* Header */}
          <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>
              {isPaid ? 'Payment Details' : 'Make Payment'}
            </Text>
            <Button action="secondary" variant="outline" size="sm" onPress={() => navigation.goBack()}>
              <ButtonText>Back</ButtonText>
            </Button>
          </HStack>

          {/* Payment Status Overview */}
          <Card style={{ padding: currentTheme.spacing.md, backgroundColor: currentTheme.colors.surface }}>
            <VStack space="md">
              <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>
                  Payment Status
                </Text>
                <HStack space="sm">
                  <Badge variant="solid" style={{ backgroundColor: getStatusColor(booking.paymentStatus) }}>
                    <Text size="xs" style={{ color: 'white', fontWeight: '600' }}>
                      {booking.paymentStatus}
                    </Text>
                  </Badge>
                  {booking.paymentVerification && (
                    <Badge variant="outline" style={{ borderColor: getVerificationColor(booking.paymentVerification.status) }}>
                      <Text size="xs" style={{ 
                        color: getVerificationColor(booking.paymentVerification.status), 
                        fontWeight: '500' 
                      }}>
                        {booking.paymentVerification.status}
                      </Text>
                    </Badge>
                  )}
                </HStack>
              </HStack>
            </VStack>
          </Card>

          {/* Financial Summary */}
          <Card style={{ padding: currentTheme.spacing.md, backgroundColor: currentTheme.colors.surface }}>
            <VStack space="md">
              <HStack style={{ alignItems: 'center' }}>
                <MaterialCommunityIcons name="currency-usd" size={24} color={currentTheme.colors.primary} />
                <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginLeft: currentTheme.spacing.xs }}>
                  Payment Summary
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
                      {paymentMethod || booking.paymentMethod || 'Not selected'}
                    </Text>
                  </VStack>
                  <VStack style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text size="xs" style={{ color: currentTheme.colors.text.secondary, fontWeight: '500' }}>Property</Text>
                    <Text size="sm" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                      {booking.propertyId?.title || 'Property'}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </Card>

          {/* Conditional Content Based on Payment Status */}
          {isPaid ? (
            // Show payment details for paid bookings
            <VStack space="lg">
              {/* Payment Proof */}
              {booking.paymentProof && (
                <Card style={{ padding: currentTheme.spacing.md, backgroundColor: currentTheme.colors.surface }}>
                  <VStack space="md">
                    <HStack style={{ alignItems: 'center' }}>
                      <MaterialCommunityIcons name="file-image" size={24} color={currentTheme.colors.primary} />
                      <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginLeft: currentTheme.spacing.xs }}>
                        Payment Proof
                      </Text>
                    </HStack>
                    <RNImage 
                      source={{ uri: booking.paymentProof }} 
                      style={{ 
                        width: '100%', 
                        height: 200, 
                        borderRadius: currentTheme.borderRadius.medium,
                        backgroundColor: currentTheme.colors.surface 
                      }}
                      resizeMode="cover"
                    />
                  </VStack>
                </Card>
              )}

              {/* Payment History/Timeline */}
              <Card style={{ padding: currentTheme.spacing.md, backgroundColor: currentTheme.colors.surface }}>
                <VStack space="md">
                  <HStack style={{ alignItems: 'center' }}>
                    <MaterialCommunityIcons name="timeline" size={24} color={currentTheme.colors.primary} />
                    <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginLeft: currentTheme.spacing.xs }}>
                      Payment Timeline
                    </Text>
                  </HStack>
                  
                  <VStack space="sm">
                    <HStack style={{ alignItems: 'center' }}>
                      <MaterialCommunityIcons name="check-circle" size={20} color={currentTheme.colors.success} />
                      <VStack style={{ marginLeft: currentTheme.spacing.sm }}>
                        <Text size="sm" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                          Payment Completed
                        </Text>
                        <Text size="xs" style={{ color: currentTheme.colors.text.secondary }}>
                          {new Date(booking.updatedAt).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    {booking.paymentVerification && (
                      <HStack style={{ alignItems: 'center' }}>
                        <MaterialCommunityIcons 
                          name={booking.paymentVerification.status === 'Verified' ? 'shield-check' : 'clock'} 
                          size={20} 
                          color={getVerificationColor(booking.paymentVerification.status)} 
                        />
                        <VStack style={{ marginLeft: currentTheme.spacing.sm }}>
                          <Text size="sm" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                            Payment {booking.paymentVerification.status}
                          </Text>
                          <Text size="xs" style={{ color: currentTheme.colors.text.secondary }}>
                            {booking.paymentVerification.verifiedAt ? 
                              new Date(booking.paymentVerification.verifiedAt).toLocaleDateString() :
                              'Verification in progress'
                            }
                          </Text>
                        </VStack>
                      </HStack>
                    )}
                  </VStack>
                </VStack>
              </Card>

              {/* Actions for completed payment */}
              <VStack space="md">
                {isCompleted && (
                  <Button action="primary">
                    <ButtonText>Download Receipt</ButtonText>
                  </Button>
                )}
                <Button action="secondary" variant="outline">
                  <ButtonText>Contact Support</ButtonText>
                </Button>
              </VStack>
            </VStack>
          ) : (
            // Show payment form for unpaid bookings
            <VStack space="lg">
              <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>
                Select a payment method and upload proof to complete your booking.
              </Text>

              {/* Payment Methods */}
              <Card style={{ padding: currentTheme.spacing.md, backgroundColor: currentTheme.colors.surface }}>
                <VStack space="md">
                  <Text size="lg" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>
                    Payment Methods
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <HStack space="sm">
                      {PAYMENT_METHODS.map((method) => (
                        <Button
                          key={method.id}
                          action={paymentMethod === method.id ? 'primary' : 'secondary'}
                          size="md"
                          style={{ borderRadius: 10, minWidth: 120 }}
                          onPress={() => handleSelectMethod(method.id)}
                        >
                          <ButtonText>{method.icon} {method.name}</ButtonText>
                        </Button>
                      ))}
                    </HStack>
                  </ScrollView>
                </VStack>
              </Card>

              {/* Upload Payment Proof */}
              <Card style={{ padding: currentTheme.spacing.md, backgroundColor: currentTheme.colors.surface }}>
                <VStack space="md">
                  <HStack style={{ alignItems: 'center' }}>
                    <MaterialCommunityIcons name="camera" size={24} color={currentTheme.colors.primary} />
                    <Text size="lg" style={{ fontWeight: '600', color: currentTheme.colors.text.primary, marginLeft: currentTheme.spacing.xs }}>
                      Upload Payment Proof
                    </Text>
                  </HStack>
                  
                  <Button action="secondary" size="md" onPress={handlePickImage}>
                    <ButtonText>{proofImage ? 'Change Image' : 'Pick Image'}</ButtonText>
                  </Button>
                  
                  {proofImage && (
                    <Box style={{ alignItems: 'center' }}>
                      <RNImage 
                        source={{ uri: proofImage.uri }} 
                        style={{ 
                          width: 200, 
                          height: 200, 
                          borderRadius: currentTheme.borderRadius.medium 
                        }} 
                        resizeMode="cover"
                      />
                    </Box>
                  )}
                  
                  <Button 
                    action="primary" 
                    size="md" 
                    onPress={handleUploadProof} 
                    disabled={uploading || !proofImage || !paymentMethod}
                  >
                    <ButtonText>{uploading ? 'Creating Booking...' : (isNewBooking ? 'Create Booking & Submit Payment' : 'Submit Payment Proof')}</ButtonText>
                  </Button>
                </VStack>
              </Card>

              {/* Status Messages */}
              {error && (
                <Card style={{ padding: currentTheme.spacing.md, backgroundColor: currentTheme.colors.error + '20' }}>
                  <HStack style={{ alignItems: 'center' }}>
                    <MaterialCommunityIcons name="alert-circle" size={20} color={currentTheme.colors.error} />
                    <Text size="sm" style={{ color: currentTheme.colors.error, marginLeft: currentTheme.spacing.xs }}>
                      {error}
                    </Text>
                  </HStack>
                </Card>
              )}
              
              {success && (
                <Card style={{ padding: currentTheme.spacing.md, backgroundColor: currentTheme.colors.success + '20' }}>
                  <HStack style={{ alignItems: 'center' }}>
                    <MaterialCommunityIcons name="check-circle" size={20} color={currentTheme.colors.success} />
                    <Text size="sm" style={{ color: currentTheme.colors.success, marginLeft: currentTheme.spacing.xs }}>
                      Payment proof uploaded successfully! Your booking will be confirmed soon.
                    </Text>
                  </HStack>
                </Card>
              )}
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
} 