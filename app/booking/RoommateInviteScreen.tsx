import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Button, ButtonText } from '../../components/ui/button';
import { Input, InputField } from '../../components/ui/input';
import { HStack } from '../../components/ui/hstack';
import { Divider } from '../../components/ui/divider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { bookingService } from '../services/bookingService';
import { roommateService } from '../services/roommateService';

export default function RoommateInviteScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const bookingData = route.params?.bookingData || {};

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [invited, setInvited] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    setSearching(true);
    setError(null);
    try {
      const res = await bookingService.searchUsers(search);
      setSearchResults(res || []);
    } catch (e: any) {
      setError(e.message || 'Failed to search users');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [search]);

  const handleInvite = async (user: any) => {
    setLoading(true);
    setError(null);
    try {
      // Send real invitation through backend
      await roommateService.sendInvitation({
        toUserId: user._id,
        propertyId: bookingData.propertyId,
        bookingData: {
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          monthlyRent: bookingData.monthlyRent || 0,
          securityDeposit: bookingData.securityDeposit || 0,
          totalAmount: bookingData.totalAmount || ((bookingData.monthlyRent || 0) + (bookingData.securityDeposit || 0))
        },
        message: `Would you like to be roommates for this property?`
      });
     
      // Add to local invited list for UI purposes
      setInvited((prev) => [...prev, { ...user, status: 'Pending' }]);
    } catch (e: any) {
      setError(e.message || 'Failed to invite roommate');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigation.navigate('BookingPayment', { bookingData, roommates: invited });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <VStack space="lg" style={{ flex: 1, padding: currentTheme.spacing.md }}>
        <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
          Invite Roommates
        </Text>
        <Text size="md" style={{ color: currentTheme.colors.text.secondary, marginBottom: currentTheme.spacing.xs }}>
          Search and invite roommates to join your booking. You can skip if booking solo.
        </Text>
        <Input style={{ backgroundColor: currentTheme.colors.input, borderRadius: currentTheme.borderRadius.input, borderColor: currentTheme.colors.border }}>
          <InputField
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or email"
            placeholderTextColor={currentTheme.colors.placeholder}
            style={{ fontFamily: currentTheme.typography.fontFamily }}
            allowFontScaling
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </Input>
        <Button action="primary" size="sm" onPress={handleSearch} disabled={searching || !search} style={{ alignSelf: 'flex-end', marginBottom: currentTheme.spacing.sm }}>
          <ButtonText>{searching ? 'Searching...' : 'Search'}</ButtonText>
        </Button>
        <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
        {error && (
          <Text size="md" style={{ color: currentTheme.colors.error, marginBottom: currentTheme.spacing.sm }}>{error}</Text>
        )}
        <Text size="lg" style={{ fontWeight: '600', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.xs }}>
          Search Results
        </Text>
        <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={false}>
          <VStack space="sm">
            {searchResults.length === 0 ? (
              <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>No users found.</Text>
            ) : (
              searchResults.map((user: any) => (
                <HStack key={user._id} space="md" style={{ alignItems: 'center', backgroundColor: currentTheme.colors.input, borderRadius: 8, padding: 8 }}>
                  <MaterialCommunityIcons name="account-circle" size={28} color={currentTheme.colors.primary} />
                  <VStack style={{ flex: 1 }}>
                    <Text size="md" style={{ color: currentTheme.colors.text.primary }}>{user.firstName} {user.lastName}</Text>
                    <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>{user.email}</Text>
                  </VStack>
                  <Button action="secondary" size="sm" onPress={() => handleInvite(user)} disabled={loading || invited.some((i) => i._id === user._id)}>
                    <ButtonText>{invited.some((i) => i._id === user._id) ? 'Invited' : 'Invite'}</ButtonText>
                  </Button>
                </HStack>
              ))
            )}
          </VStack>
        </ScrollView>
        <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
        <Text size="lg" style={{ fontWeight: '600', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.xs }}>
          Invited Roommates
        </Text>
        <ScrollView style={{ maxHeight: 120 }} showsVerticalScrollIndicator={false}>
          <VStack space="sm">
            {invited.length === 0 ? (
              <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>No roommates invited yet.</Text>
            ) : (
              invited.map((user: any) => (
                <HStack key={user._id} space="md" style={{ alignItems: 'center', backgroundColor: currentTheme.colors.input, borderRadius: 8, padding: 8 }}>
                  <MaterialCommunityIcons name="account-check" size={24} color={currentTheme.colors.secondary} />
                  <VStack style={{ flex: 1 }}>
                    <Text size="md" style={{ color: currentTheme.colors.text.primary }}>{user.firstName} {user.lastName}</Text>
                    <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>{user.email}</Text>
                  </VStack>
                  <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>{user.status}</Text>
                </HStack>
              ))
            )}
          </VStack>
        </ScrollView>
        <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
        <HStack space="md" style={{ justifyContent: 'flex-end' }}>
          <Button action="secondary" size="md" variant="outline" onPress={() => navigation.navigate('BookingPayment', { bookingData, roommates: [] })}>
            <ButtonText>Skip</ButtonText>
          </Button>
          <Button action="primary" size="md" onPress={handleContinue} disabled={loading}>
            <ButtonText>Continue</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </SafeAreaView>
  );
} 