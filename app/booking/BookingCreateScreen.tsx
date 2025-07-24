import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView, Platform } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Input, InputField } from '../../components/ui/input';
import { Divider } from '../../components/ui/divider';
import { useRoute, useNavigation } from '@react-navigation/native';
import { bookingService } from '../services/bookingService';
import { Spinner } from '../../components/ui/spinner';
import DateTimePicker from '@react-native-community/datetimepicker';

const steps = ['Dates', 'Roommates', 'Payment', 'Confirm'];

export default function BookingCreateScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const propertyId = route.params?.propertyId;
  const [monthlyRent, setMonthlyRent] = useState<number | null>(route.params?.monthlyRent ?? null);
  const [securityDeposit, setSecurityDeposit] = useState<number | null>(route.params?.securityDeposit ?? null);

  const [step, setStep] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [roommates, setRoommates] = useState<string>(''); // Comma-separated user IDs or emails
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const next = () => {
    if (step === 0) {
      // After selecting dates, go to RoommateInviteScreen
      const bookingData = {
        propertyId,
        startDate,
        endDate,
        monthlyRent,
        securityDeposit,
      };
      navigation.navigate('RoommateInvite', { bookingData });
    } else {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleBooking = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    // Validation
    if (!propertyId || !startDate || !endDate || !paymentMethod || monthlyRent == null || securityDeposit == null) {
      setError('All fields are required, including rent and deposit.');
      setLoading(false);
      return;
    }
    try {
      const bookingData: any = {
        propertyId,
        startDate: startDate?.toISOString().split('T')[0],
        endDate: endDate?.toISOString().split('T')[0],
        roommates: roommates.split(',').map((r) => r.trim()).filter(Boolean),
        paymentMethod,
        monthlyRent,
        securityDeposit,
      };
      console.log('📝 Creating booking with payload:', bookingData);
      const booking = await bookingService.createBooking(bookingData);
      setSuccess(true);
      navigation.replace('BookingDetails', { id: booking._id });
    } catch (e: any) {
      setError(e.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <VStack space="md">
            <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>Select Dates</Text>
            <Button action="secondary" onPress={() => setShowStartPicker(true)}>
              <ButtonText>{startDate ? startDate.toDateString() : 'Select Start Date'}</ButtonText>
            </Button>
            {showStartPicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setShowStartPicker(false);
                  if (date) setStartDate(date);
                }}
                minimumDate={new Date()}
              />
            )}
            <Button action="secondary" onPress={() => setShowEndPicker(true)}>
              <ButtonText>{endDate ? endDate.toDateString() : 'Select End Date'}</ButtonText>
            </Button>
            {showEndPicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setShowEndPicker(false);
                  if (date) setEndDate(date);
                }}
                minimumDate={startDate || new Date()}
              />
            )}
          </VStack>
        );
      // Remove the inline roommate input step
      case 1:
        return null;
      case 2:
        return (
          <VStack space="md">
            <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>Payment Method</Text>
            <Input style={{ backgroundColor: currentTheme.colors.input, borderRadius: currentTheme.borderRadius.input, borderColor: currentTheme.colors.border }}>
              <InputField
                value={paymentMethod}
                onChangeText={setPaymentMethod}
                placeholder="e.g. WafaCash, CashPlus, Bank Transfer, Cash"
                style={{ fontFamily: currentTheme.typography.fontFamily }}
                allowFontScaling
              />
            </Input>
          </VStack>
        );
      case 3:
        return (
          <VStack space="md">
            <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>Confirm Booking</Text>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>Start: {startDate?.toDateString() || '-'}</Text>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>End: {endDate?.toDateString() || '-'}</Text>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>Roommates: {roommates || 'None'}</Text>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>Payment Method: {paymentMethod || '-'}</Text>
          </VStack>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: currentTheme.spacing.md }} showsVerticalScrollIndicator={false}>
        <VStack space="lg" style={{ width: '100%' }}>
          <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
            Create Booking
          </Text>
          <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
          {error && (
            <Text size="md" style={{ color: currentTheme.colors.error }}>{error}</Text>
          )}
          {success && (
            <Text size="md" style={{ color: currentTheme.colors.secondary }}>Booking created successfully!</Text>
          )}
          <VStack space="md">
            {/* Progress indicator */}
            <Box style={{ flexDirection: 'row', marginBottom: currentTheme.spacing.md }}>
              {steps.map((label, idx) => (
                <Box
                  key={label}
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 8,
                    backgroundColor: idx <= step ? currentTheme.colors.primary : currentTheme.colors.border,
                    marginRight: idx < steps.length - 1 ? 4 : 0,
                  }}
                />
              ))}
            </Box>
            {/* Show rent and deposit on confirm step */}
            {step === 3 && (
              <VStack space="sm">
                <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>Monthly Rent: {monthlyRent != null ? `MAD ${monthlyRent}` : '-'}</Text>
                <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>Security Deposit: {securityDeposit != null ? `MAD ${securityDeposit}` : '-'}</Text>
              </VStack>
            )}
            {renderStep()}
            <Box style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: currentTheme.spacing.md }}>
              <Button action="secondary" variant="outline" onPress={prev} disabled={step === 0 || loading}>
                <ButtonText>Back</ButtonText>
              </Button>
              {step === steps.length - 1 ? (
                <Button action="primary" onPress={handleBooking} disabled={loading}>
                  <ButtonText>{loading ? 'Booking...' : 'Book Now'}</ButtonText>
                </Button>
              ) : (
                <Button action="primary" onPress={next}>
                  <ButtonText>Next</ButtonText>
                </Button>
              )}
            </Box>
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
} 