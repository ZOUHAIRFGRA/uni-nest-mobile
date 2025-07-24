import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Divider } from '../../components/ui/divider';
import { useRoute, useNavigation } from '@react-navigation/native';
import { bookingService } from '../services/bookingService';
import { Spinner } from '../../components/ui/spinner';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BookingDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const bookingId = route.params?.id;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await bookingService.getBookingById(bookingId);
        setBooking(data);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: currentTheme.spacing.md }} showsVerticalScrollIndicator={false}>
        <VStack space="lg" style={{ width: '100%' }}>
          <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
            Booking Details
          </Text>
          <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
          {loading ? (
            <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Spinner size="large" />
            </Box>
          ) : error ? (
            <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text size="md" style={{ color: currentTheme.colors.error }}>{error}</Text>
            </Box>
          ) : booking ? (
            <VStack space="md">
              <Text size="2xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>{booking.property?.title || 'Property'}</Text>
              <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>{booking.status}</Text>
              <Text size="md" style={{ color: currentTheme.colors.primary, fontWeight: '600' }}>{booking.startDate} - {booking.endDate}</Text>
              <Text size="md" style={{ color: currentTheme.colors.text.primary }}>{booking.property?.description}</Text>
              {/* Timeline visualization */}
              <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
              <BookingTimeline status={booking.status} paymentStatus={booking.paymentStatus} theme={currentTheme} />
              {/* Payment state */}
              <Text size="md" style={{ color: booking.paymentStatus === 'Paid' ? currentTheme.colors.secondary : currentTheme.colors.warning, fontWeight: '600' }}>
                Payment Status: {booking.paymentStatus || 'N/A'}
              </Text>
              <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>
                Total Amount: {booking.totalAmount} MAD
              </Text>
              {/* Roommates info */}
              {booking.roommates && booking.roommates.length > 0 && (
                <VStack space="xs" style={{ marginTop: currentTheme.spacing.sm }}>
                  <Text size="md" style={{ color: currentTheme.colors.text.primary, fontWeight: '600' }}>Roommates</Text>
                  {booking.roommates.map((rm: any) => (
                    <Box key={rm._id || rm.email} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <MaterialCommunityIcons name="account-circle" size={20} color={currentTheme.colors.primary} />
                      <Text size="sm" style={{ color: currentTheme.colors.text.secondary, marginLeft: 6 }}>{rm.firstName} {rm.lastName} ({rm.status || 'Pending'})</Text>
                    </Box>
                  ))}
                </VStack>
              )}
              {/* Dispute action */}
              {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                <Button action="secondary" variant="outline" onPress={() => navigation.navigate('DisputeScreen', { bookingId })} style={{ marginTop: currentTheme.spacing.md }}>
                  <ButtonText>Raise Dispute</ButtonText>
                </Button>
              )}
              <Box style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: currentTheme.spacing.md }}>
                {booking.status !== 'Cancelled' && (
                  <Button action="secondary" variant="outline" onPress={handleCancel} disabled={actionLoading}>
                    <ButtonText>Cancel Booking</ButtonText>
                  </Button>
                )}
                <Button action="primary" onPress={() => navigation.navigate('PaymentScreen', { bookingId })}>
                  <ButtonText>View Payment</ButtonText>
                </Button>
              </Box>
            </VStack>
          ) : null}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

function BookingTimeline({ status, paymentStatus, theme }: any) {
  // Define stages and icons
  const stages = [
    { key: 'Requested', label: 'Requested', icon: 'calendar-clock' },
    { key: 'Payment Pending', label: 'Payment', icon: 'credit-card' },
    { key: 'Confirmed', label: 'Confirmed', icon: 'check-circle' },
    { key: 'Active', label: 'Active', icon: 'home' },
    { key: 'Completed', label: 'Completed', icon: 'flag-checkered' },
    { key: 'Cancelled', label: 'Cancelled', icon: 'close-circle' },
  ];
  // Determine current stage
  const currentIdx = stages.findIndex(s => s.key.toLowerCase() === status?.toLowerCase());
  return (
    <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: theme.spacing.sm }}>
      {stages.map((stage, idx) => (
        <Box key={stage.key} style={{ alignItems: 'center', flex: 1 }}>
          <MaterialCommunityIcons
            name={stage.icon as any}
            size={24}
            color={
              idx < currentIdx
                ? theme.colors.secondary
                : idx === currentIdx
                ? theme.colors.primary
                : theme.colors.border
            }
          />
          <Text size="xs" style={{ color: idx <= currentIdx ? theme.colors.primary : theme.colors.text.secondary, textAlign: 'center' }}>{stage.label}</Text>
          {idx < stages.length - 1 && (
            <Box style={{ height: 2, backgroundColor: idx < currentIdx ? theme.colors.secondary : theme.colors.border, width: '100%', marginVertical: 2 }} />
          )}
        </Box>
      ))}
    </Box>
  );
} 