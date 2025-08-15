import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, useColorScheme } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { HStack } from '../../components/ui/hstack';
import { authService } from '../services/authService';

export default function RoommatePreferencesScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');

  const [smokingHabits, setSmokingHabits] = useState('No');
  const [alcoholConsumption, setAlcoholConsumption] = useState('No');
  const [petFriendly, setPetFriendly] = useState(false);
  const [sleepSchedule, setSleepSchedule] = useState('Flexible');
  const [socialLevel, setSocialLevel] = useState('Moderate');
  const [cleanlinessLevel, setCleanlinessLevel] = useState('Moderate');
  const [noiseLevel, setNoiseLevel] = useState('Moderate');
  const [guestPolicy, setGuestPolicy] = useState('Occasionally');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savePreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.updatePreferencesOnBackend({}, {
        smokingHabits,
        alcoholConsumption,
        petFriendly,
        sleepSchedule,
        socialLevel,
        cleanlinessLevel,
        noiseLevel,
        guestPolicy,
      });
      navigation.goBack();
      // Optionally: trigger a refresh of matches (handled by parent on focus)
    } catch (e: any) {
      setError(e.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: currentTheme.spacing.md }}>
        <VStack space="lg" style={{ width: '100%' }}>
          <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>
            Roommate Preferences
          </Text>
          {error && (
            <Text size="md" style={{ color: currentTheme.colors.error, marginBottom: currentTheme.spacing.sm }}>{error}</Text>
          )}
          {/* Smoking Habits */}
          <Box>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary, marginBottom: currentTheme.spacing.xs }}>Smoking Habits</Text>
            <Picker selectedValue={smokingHabits} onValueChange={setSmokingHabits} style={{ color: currentTheme.colors.text.primary }}>
              <Picker.Item label="No" value="No" />
              <Picker.Item label="Occasionally" value="Occasionally" />
              <Picker.Item label="Yes" value="Yes" />
            </Picker>
          </Box>
        
          {/* Pet Friendly */}
          <Box>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary, marginBottom: currentTheme.spacing.xs }}>Pet Friendly</Text>
            <Picker selectedValue={petFriendly ? 'Yes' : 'No'} onValueChange={v => setPetFriendly(v === 'Yes')} style={{ color: currentTheme.colors.text.primary }}>
              <Picker.Item label="No" value="No" />
              <Picker.Item label="Yes" value="Yes" />
            </Picker>
          </Box>
          {/* Sleep Schedule */}
          <Box>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary, marginBottom: currentTheme.spacing.xs }}>Sleep Schedule</Text>
            <Picker selectedValue={sleepSchedule} onValueChange={setSleepSchedule} style={{ color: currentTheme.colors.text.primary }}>
              <Picker.Item label="Early" value="Early" />
              <Picker.Item label="Late" value="Late" />
              <Picker.Item label="Flexible" value="Flexible" />
            </Picker>
          </Box>
          {/* Social Level */}
          <Box>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary, marginBottom: currentTheme.spacing.xs }}>Social Level</Text>
            <Picker selectedValue={socialLevel} onValueChange={setSocialLevel} style={{ color: currentTheme.colors.text.primary }}>
              <Picker.Item label="Introvert" value="Introvert" />
              <Picker.Item label="Moderate" value="Moderate" />
              <Picker.Item label="Extrovert" value="Extrovert" />
            </Picker>
          </Box>
          {/* Cleanliness Level */}
          <Box>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary, marginBottom: currentTheme.spacing.xs }}>Cleanliness Level</Text>
            <Picker selectedValue={cleanlinessLevel} onValueChange={setCleanlinessLevel} style={{ color: currentTheme.colors.text.primary }}>
              <Picker.Item label="Low" value="Low" />
              <Picker.Item label="Moderate" value="Moderate" />
              <Picker.Item label="High" value="High" />
            </Picker>
          </Box>
          {/* Noise Level */}
          <Box>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary, marginBottom: currentTheme.spacing.xs }}>Noise Level</Text>
            <Picker selectedValue={noiseLevel} onValueChange={setNoiseLevel} style={{ color: currentTheme.colors.text.primary }}>
              <Picker.Item label="Low" value="Low" />
              <Picker.Item label="Moderate" value="Moderate" />
              <Picker.Item label="High" value="High" />
            </Picker>
          </Box>
          {/* Guest Policy */}
          <Box>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary, marginBottom: currentTheme.spacing.xs }}>Guest Policy</Text>
            <Picker selectedValue={guestPolicy} onValueChange={setGuestPolicy} style={{ color: currentTheme.colors.text.primary }}>
              <Picker.Item label="Never" value="Never" />
              <Picker.Item label="Occasionally" value="Occasionally" />
              <Picker.Item label="Frequently" value="Frequently" />
            </Picker>
          </Box>
          <HStack space="md" style={{ marginTop: currentTheme.spacing.lg }}>
            <Button action="secondary" variant="outline" onPress={() => navigation.goBack()} style={{ flex: 1 }} disabled={loading}>
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button action="primary" onPress={savePreferences} style={{ flex: 1 }} disabled={loading}>
              <ButtonText>{loading ? 'Saving...' : 'Save'}</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
} 