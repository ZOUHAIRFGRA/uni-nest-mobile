import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView, Platform, Image as RNImage } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Divider } from '../../components/ui/divider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_ENDPOINTS, PAYMENT_METHODS } from '../utils/config';
import { apiClient } from '../services/apiClient';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BookingPaymentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const bookingData = route.params?.bookingData || {};
  const roommates = route.params?.roommates || [];

  const [paymentMethod, setPaymentMethod] = useState('');
  const [instructions, setInstructions] = useState('');
  const [proofImage, setProofImage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSelectMethod = async (method: string) => {
    setPaymentMethod(method);
    setInstructions('');
    setError(null);
    try {
      // Fetch payment instructions from backend
      const res = await apiClient.get(API_ENDPOINTS.PAYMENTS.INSTRUCTIONS(method));
      setInstructions(res.data?.instructions || '');
    } catch (e: any) {
      setInstructions('');
      setError(e.message || 'Failed to fetch payment instructions');
    }
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
    if (!proofImage) return;
    setUploading(true);
    setError(null);
    try {
      // Simulate upload (replace with backend call if available)
      // const formData = new FormData();
      // formData.append('proof', { uri: proofImage.uri, name: 'proof.jpg', type: 'image/jpeg' });
      // await apiClient.post(API_ENDPOINTS.PAYMENTS.UPLOAD_PROOF(bookingData.id), formData);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || 'Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <VStack space="lg" style={{ flex: 1, padding: currentTheme.spacing.md }}>
        <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
          Payment
        </Text>
        <Text size="md" style={{ color: currentTheme.colors.text.secondary, marginBottom: currentTheme.spacing.xs }}>
          Select a payment method and upload proof to complete your booking.
        </Text>
        <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
        <Text size="lg" style={{ fontWeight: '600', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.xs }}>
          Payment Methods
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: currentTheme.spacing.md }}>
          <Box style={{ flexDirection: 'row' }}>
            {PAYMENT_METHODS.map((method) => (
              <Button
                key={method.id}
                action={paymentMethod === method.id ? 'primary' : 'secondary'}
                size="md"
                style={{ marginRight: currentTheme.spacing.sm, borderRadius: 10, minWidth: 120 }}
                onPress={() => handleSelectMethod(method.id)}
              >
                <ButtonText>{method.icon} {method.name}</ButtonText>
              </Button>
            ))}
          </Box>
        </ScrollView>
        {instructions && (
          <Box style={{ backgroundColor: currentTheme.colors.input, borderRadius: 8, padding: currentTheme.spacing.md, marginBottom: currentTheme.spacing.md }}>
            <Text size="md" style={{ color: currentTheme.colors.text.primary }}>{instructions}</Text>
          </Box>
        )}
        <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
        <Text size="lg" style={{ fontWeight: '600', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.xs }}>
          Upload Payment Proof
        </Text>
        <Button action="secondary" size="md" onPress={handlePickImage} style={{ marginBottom: currentTheme.spacing.sm }}>
          <ButtonText>{proofImage ? 'Change Image' : 'Pick Image'}</ButtonText>
        </Button>
        {proofImage && (
          <Box style={{ alignItems: 'center', marginBottom: currentTheme.spacing.sm }}>
            <RNImage source={{ uri: proofImage.uri }} style={{ width: 180, height: 180, borderRadius: 12 }} />
          </Box>
        )}
        <Button action="primary" size="md" onPress={handleUploadProof} disabled={uploading || !proofImage} style={{ marginBottom: currentTheme.spacing.md }}>
          <ButtonText>{uploading ? 'Uploading...' : 'Upload Proof'}</ButtonText>
        </Button>
        {error && (
          <Text size="md" style={{ color: currentTheme.colors.error, marginBottom: currentTheme.spacing.sm }}>{error}</Text>
        )}
        {success && (
          <Text size="md" style={{ color: currentTheme.colors.secondary, marginBottom: currentTheme.spacing.sm }}>Payment proof uploaded! Your booking will be confirmed soon.</Text>
        )}
        <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
        <Button action="secondary" size="md" variant="outline" onPress={() => navigation.goBack()}>
          <ButtonText>Back</ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
} 