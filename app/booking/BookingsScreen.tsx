import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView, RefreshControl } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { HStack } from '../../components/ui/hstack';
import { Divider } from '../../components/ui/divider';
import { useNavigation } from '@react-navigation/native';
import { bookingService } from '../services/bookingService';
import { Spinner } from '../../components/ui/spinner';

export default function BookingsScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getBookings();
      setBookings(data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, [fetchBookings]);

  const goToDetails = (id: string) => navigation.navigate('BookingDetails', { id });
  const handleCancel = async (id: string) => {
    try {
      await bookingService.cancelBooking(id);
      fetchBookings();
    } catch (e: any) {
      setError(e.message || 'Failed to cancel booking');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <VStack space="lg" style={{ flex: 1, padding: currentTheme.spacing.md }}>
        <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
          My Bookings
        </Text>
        <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
        {loading ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Spinner size="large" />
          </Box>
        ) : error ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text size="md" style={{ color: currentTheme.colors.error }}>{error}</Text>
            <Button action="primary" onPress={fetchBookings} style={{ marginTop: currentTheme.spacing.md }}>
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
                <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>No bookings found.</Text>
              ) : (
                bookings.map((booking: any) => (
                  <Card
                    key={booking.id || booking._id}
                    style={{ padding: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.card, marginBottom: currentTheme.spacing.sm }}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`View booking for ${booking.property?.title || 'Property'}`}
                    onPress={() => goToDetails(booking.id || booking._id)}
                  >
                    <VStack space="xs">
                      <Text size="lg" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>{booking.property?.title || 'Property'}</Text>
                      <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>{booking.status}</Text>
                      <Text size="md" style={{ color: currentTheme.colors.primary, fontWeight: '600' }}>{booking.startDate} - {booking.endDate}</Text>
                      <HStack space="md" style={{ marginTop: currentTheme.spacing.sm }}>
                        <Button action="primary" onPress={() => goToDetails(booking.id || booking._id)}>
                          <ButtonText>View Details</ButtonText>
                        </Button>
                        {booking.status !== 'Cancelled' && (
                          <Button action="secondary" variant="outline" onPress={() => handleCancel(booking.id || booking._id)}>
                            <ButtonText>Cancel</ButtonText>
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </Card>
                ))
              )}
            </VStack>
          </ScrollView>
        )}
      </VStack>
    </SafeAreaView>
  );
} 