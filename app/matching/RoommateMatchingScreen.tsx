import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView, RefreshControl, Pressable } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { HStack } from '../../components/ui/hstack';
import { Divider } from '../../components/ui/divider';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { matchingService } from '../services/matchingService';
import { Spinner } from '../../components/ui/spinner';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RoommateMatchingScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await matchingService.getMatches('Roommate', 1, 10);
      setMatches(response.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load matches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Refetch matches when screen is focused (after editing preferences)
  useFocusEffect(
    useCallback(() => {
      fetchMatches();
    }, [fetchMatches])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMatches();
  }, [fetchMatches]);

  const goToDetails = (id: string) => navigation.navigate('MatchDetails', { id });

  const handleMatchAction = async (id: string, action: 'Liked' | 'Passed') => {
    setActionLoading(id + action);
    try {
      await matchingService.updateMatchStatus(id, action);
      await fetchMatches();
    } catch (e) {
      // Optionally show error
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <VStack space="lg" style={{ flex: 1, padding: currentTheme.spacing.md }}>
        <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
          Roommate Matches
        </Text>
        <Button action="secondary" onPress={() => navigation.navigate('RoommatePreferences')} style={{ alignSelf: 'flex-end', marginBottom: currentTheme.spacing.sm }}>
          <ButtonText>Edit Preferences</ButtonText>
        </Button>
        <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
        {loading ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Spinner size="large" />
          </Box>
        ) : error ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text size="md" style={{ color: currentTheme.colors.error }}>{error}</Text>
            <Button action="primary" onPress={fetchMatches} style={{ marginTop: currentTheme.spacing.md }}>
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
              {matches.length === 0 ? (
                <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>No roommate matches found.</Text>
              ) : (
                matches.map((match: any) => (
                  <Pressable
                    key={match._id}
                    style={{ marginBottom: currentTheme.spacing.sm }}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`View match ${match.title || match.name}`}
                    onPress={() => goToDetails(match._id)}
                  >
                    <Card style={{ padding: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.card, borderWidth: 1, borderColor: currentTheme.colors.primary + '60', shadowColor: currentTheme.colors.primary, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 }}>
                      <HStack space="md" style={{ alignItems: 'center' }}>
                        {/* AI Icon/Glow */}
                        <Box style={{ marginRight: currentTheme.spacing.sm, alignItems: 'center', justifyContent: 'center' }}>
                          <MaterialCommunityIcons name="brain" size={28} color={currentTheme.colors.primary} style={{ textShadowColor: currentTheme.colors.primary, textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } }} />
                        </Box>
                        <VStack space="xs" style={{ flex: 1 }}>
                          <Text size="lg" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>{match.title || match.name || 'Roommate Match'}</Text>
                          <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>{match.description || match.summary || ''}</Text>
                          <Text size="md" style={{ color: currentTheme.colors.primary, fontWeight: '600' }}>Score: {match.score || '-'}</Text>
                        </VStack>
                      </HStack>
                      {/* Accept/Decline Actions */}
                      <HStack space="md" style={{ marginTop: currentTheme.spacing.sm, justifyContent: 'flex-end' }}>
                        <Button action="primary" size="sm" onPress={() => handleMatchAction(match._id, 'Liked')} disabled={actionLoading === match._id + 'Liked'}>
                          <ButtonText>{actionLoading === match._id + 'Liked' ? 'Accepting...' : 'Accept'}</ButtonText>
                        </Button>
                        <Button action="secondary" variant="outline" size="sm" onPress={() => handleMatchAction(match._id, 'Passed')} disabled={actionLoading === match._id + 'Passed'}>
                          <ButtonText>{actionLoading === match._id + 'Passed' ? 'Declining...' : 'Decline'}</ButtonText>
                        </Button>
                      </HStack>
                    </Card>
                  </Pressable>
                ))
              )}
            </VStack>
          </ScrollView>
        )}
      </VStack>
    </SafeAreaView>
  );
} 