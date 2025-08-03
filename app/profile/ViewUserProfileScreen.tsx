import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Divider } from '../../components/ui/divider';
import { useRoute, useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';
import { Spinner } from '../../components/ui/spinner';
import { HStack } from '../../components/ui/hstack';
import { Image } from '@/components/ui/image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ViewUserProfileScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const userId = route.params?.id;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const profile = await authService.getUserById(userId);
        setUser(profile.data);
      } catch (e: any) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  function ProfileSection({ title, children, style = {} }: any) {
    return (
      <Box style={{ marginBottom: 24, backgroundColor: currentTheme.colors.card, borderRadius: 12, padding: 16, ...style }}>
        <Text size="lg" style={{ fontWeight: '700', marginBottom: 8 }}>{title}</Text>
        {children}
      </Box>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
        <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size="large" />
        </Box>
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
        <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text size="md" style={{ color: currentTheme.colors.error }}>{error}</Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: currentTheme.spacing.md }} showsVerticalScrollIndicator={false}>
        <VStack space="lg" style={{ width: '100%' }}>
          {/* Profile Image and Name */}
          <Box style={{ alignItems: 'center', marginBottom: currentTheme.spacing.md }}>
            <Image source={{ uri: user?.profileImage }} alt="Profile" style={{ width: 100, height: 100, borderRadius: 50 }} />
            <Text size="2xl" style={{ fontWeight: '700', marginTop: 8 }}>{user?.firstName} {user?.lastName}</Text>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>{user?.role} • {user?.university}</Text>
          </Box>
          {/* Basic Info */}
          <ProfileSection title="Basic Info">
            <Text><MaterialCommunityIcons name="email" size={16} /> {user?.email}</Text>
            <Text><MaterialCommunityIcons name="phone" size={16} /> {user?.phone}</Text>
            <Text><MaterialCommunityIcons name="map-marker" size={16} /> {user?.address}</Text>
            <Text><MaterialCommunityIcons name="school" size={16} /> {user?.studyField} ({user?.yearOfStudy} year)</Text>
            <Text><MaterialCommunityIcons name="account-star" size={16} /> {user?.subscriptionPlan} plan</Text>
            <Text><MaterialCommunityIcons name={user?.isVerified ? 'check-decagram' : 'alert-decagram'} size={16} color={user?.isVerified ? 'green' : 'orange'} /> {user?.isVerified ? 'Verified' : 'Not Verified'}</Text>
          </ProfileSection>
          {/* Preferences */}
          <ProfileSection title="Preferences">
            <Text>Budget: {user?.preferences?.budget?.min} - {user?.preferences?.budget?.max} MAD</Text>
            <Text>Room Type: {user?.preferences?.roomType}</Text>
            <Text>Max Commute: {user?.preferences?.maxCommuteTime} min</Text>
            <Text>Amenities: {Object.entries(user?.preferences?.amenities || {}).filter(([k, v]) => v).map(([k]) => k).join(', ')}</Text>
          </ProfileSection>
          {/* Lifestyle */}
          <ProfileSection title="Lifestyle">
            {Object.entries(user?.lifestyle || {}).map(([k, v]) => (
              <Text key={k}>{k}: {String(v)}</Text>
            ))}
          </ProfileSection>
          {/* AI Profile */}
          <ProfileSection title="AI Personality">
            {user?.aiProfile?.personalityScore && Object.entries(user.aiProfile.personalityScore).map(([trait, score]) => {
              const numScore = typeof score === 'number' ? score : Number(score) || 0;
              return (
                <Box key={trait} style={{ marginBottom: 4 }}>
                  <Text size="sm">{trait.charAt(0).toUpperCase() + trait.slice(1)}: {(numScore * 100).toFixed(0)}%</Text>
                  <Box style={{ height: 6, backgroundColor: '#eee', borderRadius: 3, marginTop: 2 }}>
                    <Box style={{ width: `${numScore * 100}%`, height: 6, backgroundColor: currentTheme.colors.primary, borderRadius: 3 }} />
                  </Box>
                </Box>
              );
            })}
            <Text size="xs" style={{ color: currentTheme.colors.text.secondary, marginTop: 4 }}>
              Last updated: {user?.aiProfile?.lastUpdated ? new Date(user.aiProfile.lastUpdated).toLocaleDateString() : 'N/A'}
            </Text>
          </ProfileSection>
          {/* Notification Settings */}
          <ProfileSection title="Notifications">
            {Object.entries(user?.notificationSettings || {}).map(([k, v]) => (
              <Text key={k}><MaterialCommunityIcons name={v ? 'check-circle' : 'close-circle'} size={16} color={v ? 'green' : 'red'} /> {k.charAt(0).toUpperCase() + k.slice(1)}: {v ? 'On' : 'Off'}</Text>
            ))}
          </ProfileSection>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
} 