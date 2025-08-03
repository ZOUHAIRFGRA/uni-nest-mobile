import React, { useEffect, useState } from 'react';
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
import { Spinner } from '../../components/ui/spinner';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../services/apiClient';
import { Image } from '@/components/ui/image';

export default function PaymentScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const bookingId = route.params?.bookingId;

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPayment = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/payments/${bookingId}`);
        setPayment(response.data);
      } catch (e: any) {
        setError(e.message || 'Failed to load payment');
      } finally {
        setLoading(false);
      }
    };
    if (bookingId) fetchPayment();
  }, [bookingId]);

  const pickProofImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setProofImage(result.assets[0].uri);
    }
  };

  const handleUploadProof = async () => {
    if (!proofImage) return;
    setUploading(true);
    setError(null);
    setSuccess(false);
    try {
      // Upload proof image to backend
      const formData = new FormData();
      formData.append('image', {
        uri: proofImage,
        name: 'payment-proof.jpg',
        type: 'image/jpeg',
      } as any);
      await apiClient.post(`/payments/${payment._id || payment.id}/proof`, formData);
      setSuccess(true);
      setProofImage(null);
      navigation.goBack();
    } catch (e: any) {
      setError(e.message || 'Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: currentTheme.spacing.md }} showsVerticalScrollIndicator={false}>
        <VStack space="lg" style={{ width: '100%' }}>
          <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
            Payment
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
          ) : payment ? (
            <VStack space="md">
              <Text size="lg" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>Amount: {payment.amount} MAD</Text>
              <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>Status: {payment.status}</Text>
              <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>Method: {payment.paymentMethod}</Text>
              <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>Instructions: {payment.instructions || 'See payment provider for details.'}</Text>
              <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
              <Text size="md" style={{ color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>Upload Payment Proof</Text>
              {proofImage && (
                <Box style={{ width: 120, height: 90, borderRadius: 8, overflow: 'hidden', backgroundColor: currentTheme.colors.card, marginBottom: 8 }}>
                  <Image source={{ uri: proofImage }} alt="Payment proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              )}
              <Button action="secondary" onPress={pickProofImage} style={{ marginBottom: currentTheme.spacing.sm }}>
                <ButtonText>{proofImage ? 'Change Image' : 'Pick Image'}</ButtonText>
              </Button>
              <Button action="primary" onPress={handleUploadProof} disabled={uploading || !proofImage}>
                <ButtonText>{uploading ? 'Uploading...' : 'Upload Proof'}</ButtonText>
              </Button>
              {success && (
                <Text size="md" style={{ color: currentTheme.colors.secondary }}>Proof uploaded successfully!</Text>
              )}
            </VStack>
          ) : null}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
} 