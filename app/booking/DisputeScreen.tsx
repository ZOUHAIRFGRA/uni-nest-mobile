import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Input, InputField } from '../../components/ui/input';
import { Divider } from '../../components/ui/divider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_ENDPOINTS } from '../utils/config';
import { apiClient } from '../services/apiClient';

export default function DisputeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const bookingId = route.params?.bookingId;

  const [dispute, setDispute] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDispute = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(`${API_ENDPOINTS.BOOKINGS.DETAILS(bookingId)}/dispute`);
        setDispute(res.data || null);
      } catch (e: any) {
        setError(e.message || 'Failed to load dispute');
      } finally {
        setLoading(false);
      }
    };
    if (bookingId) fetchDispute();
  }, [bookingId]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post(`${API_ENDPOINTS.BOOKINGS.DETAILS(bookingId)}/dispute`, { reason });
      setSuccess(true);
      setReason('');
    } catch (e: any) {
      setError(e.message || 'Failed to submit dispute');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDispute = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`${API_ENDPOINTS.BOOKINGS.DETAILS(bookingId)}/dispute`);
      setDispute(null);
    } catch (e: any) {
      setError(e.message || 'Failed to cancel dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <VStack space="lg" style={{ flex: 1, padding: currentTheme.spacing.md }}>
        <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
          Dispute Resolution
        </Text>
        <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
        {error && (
          <Text size="md" style={{ color: currentTheme.colors.error, marginBottom: currentTheme.spacing.sm }}>{error}</Text>
        )}
        {dispute ? (
          <Box style={{ backgroundColor: currentTheme.colors.input, borderRadius: 8, padding: currentTheme.spacing.md, marginBottom: currentTheme.spacing.md }}>
            <Text size="md" style={{ color: currentTheme.colors.text.primary, fontWeight: '600' }}>Dispute Status: {dispute.status}</Text>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary, marginTop: 4 }}>Reason: {dispute.reason}</Text>
            {dispute.response && (
              <Text size="md" style={{ color: currentTheme.colors.secondary, marginTop: 8 }}>Response: {dispute.response}</Text>
            )}
            {dispute.status === 'Open' && (
              <Button action="secondary" size="md" variant="outline" onPress={handleCancelDispute} style={{ marginTop: currentTheme.spacing.md }}>
                <ButtonText>Cancel Dispute</ButtonText>
              </Button>
            )}
          </Box>
        ) : (
          <>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary, marginBottom: currentTheme.spacing.sm }}>
              If you have an issue with this booking, you can raise a dispute. Our team will review and respond as soon as possible.
            </Text>
            <Input style={{ backgroundColor: currentTheme.colors.input, borderRadius: currentTheme.borderRadius.input, borderColor: currentTheme.colors.border }}>
              <InputField
                value={reason}
                onChangeText={setReason}
                placeholder="Describe your issue..."
                placeholderTextColor={currentTheme.colors.placeholder}
                style={{ fontFamily: currentTheme.typography.fontFamily }}
                allowFontScaling
                multiline
                numberOfLines={4}
              />
            </Input>
            <Button action="primary" size="md" onPress={handleSubmit} disabled={loading || !reason.trim()} style={{ marginTop: currentTheme.spacing.md }}>
              <ButtonText>{loading ? 'Submitting...' : 'Submit Dispute'}</ButtonText>
            </Button>
            {success && (
              <Text size="md" style={{ color: currentTheme.colors.secondary, marginTop: currentTheme.spacing.sm }}>Dispute submitted! You will be notified when there is a response.</Text>
            )}
          </>
        )}
        <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
        <Button action="secondary" size="md" variant="outline" onPress={() => navigation.goBack()}>
          <ButtonText>Back</ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
} 