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
import { matchingService } from '../services/matchingService';
import { Spinner } from '../../components/ui/spinner';
import { Image as CustomImage } from '../../components/ui/image';

export default function MatchDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const matchId = route.params?.id;

  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await matchingService.getMatchDetails(matchId);
        setMatch(response.data || response);
      } catch (e: any) {
        setError(e.message || 'Failed to load match details');
      } finally {
        setLoading(false);
      }
    };
    if (matchId) fetchMatch();
  }, [matchId]);

  const handleAction = async (status: 'Liked' | 'Passed') => {
    setActionLoading(true);
    try {
      await matchingService.updateMatchStatus(matchId, status);
      navigation.goBack();
    } catch (e: any) {
      setError(e.message || 'Failed to update match status');
    } finally {
      setActionLoading(false);
    }
  };

  const FALLBACK_IMAGE = require('@/assets/images/placeholder.jpg');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: currentTheme.spacing.md }} showsVerticalScrollIndicator={false}>
        <VStack space="lg" style={{ width: '100%' }}>
          <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
            Match Details
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
          ) : match ? (
            <VStack space="md">
              {/* Property image with fallback */}
              <Box style={{ width: '100%', height: 200, borderRadius: 14, overflow: 'hidden', backgroundColor: currentTheme.colors.card, alignItems: 'center', justifyContent: 'center' }}>
                <CustomImage
                  source={match.targetId && match.targetId.images && match.targetId.images[0] ? { uri: match.targetId.images[0] } : FALLBACK_IMAGE}
                  alt="property image"
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
              <Text size="2xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>{match.targetId?.title || match.targetId?.name || ''}</Text>
              <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>{match.targetId?.address || ''}</Text>
              <Text size="md" style={{ color: currentTheme.colors.primary, fontWeight: '600' }}>Score: {(match.compatibilityScore * 100).toFixed(0)}%</Text>
              <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>{match.matchFactors ? `Key Factors: ${Object.entries(match.matchFactors).map(([k, v]) => `${k}: ${v}`).join(', ')}` : ''}</Text>
              <Text size="md" style={{ color: currentTheme.colors.text.primary, marginTop: currentTheme.spacing.md }}>{match.explanation || match.summary || ''}</Text>
              <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
              <Box style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button action="secondary" variant="outline" onPress={() => handleAction('Passed')} disabled={actionLoading}>
                  <ButtonText>Pass</ButtonText>
                </Button>
                <Button action="primary" onPress={() => handleAction('Liked')} disabled={actionLoading}>
                  <ButtonText>Like</ButtonText>
                </Button>
              </Box>
            </VStack>
          ) : null}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
} 