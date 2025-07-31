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
import { useNavigation } from '@react-navigation/native';
import { matchingService } from '../services/matchingService';
import { Spinner } from '../../components/ui/spinner';
import { Image as CustomImage } from '@/components/ui/image';

export default function MatchesScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [type, setType] = useState<'Property' | 'Roommate'>('Property');
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await matchingService.getMatches(type, 1, 10);
      // console.log('🔍 [MATCHES FETCHED FROM SCREEN]', res);
      setMatches(res.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load matches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [type]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMatches();
  }, [fetchMatches]);

  const goToDetails = (id: string) => navigation.navigate('MatchDetails', { id });

  const FALLBACK_IMAGE = require('@/assets/images/placeholder.jpg');

  function MatchCard({ match, goToDetails, currentTheme, FALLBACK_IMAGE }: any) {
    const property = match.targetId || {};
    const [imgError, setImgError] = React.useState(false);
    const imageUrl = !imgError && property.images && property.images[0] ? { uri: property.images[0] } : FALLBACK_IMAGE;
    const matchFactors = match.matchFactors ? Object.entries(match.matchFactors).map(([k, v]) => `${k}: ${v}`) : [];
    return (
      <Pressable
        key={match._id}
        style={{ marginBottom: currentTheme.spacing.sm }}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`View match for ${property.title}`}
        onPress={() => goToDetails(match._id)}
      >
        <Card style={{ padding: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.card }}>
          <HStack space="md" style={{ alignItems: 'center' }}>
            {/* Property image with fallback */}
            <Box style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', backgroundColor: currentTheme.colors.card, marginRight: currentTheme.spacing.md }}>
              <CustomImage
                source={imageUrl}
                onError={() => setImgError(true)}
                alt="property image"
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
            <VStack space="xs" style={{ flex: 1 }}>
              <Text size="lg" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>{property.title}</Text>
              <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>{property.address || ''}</Text>
              <Text size="md" style={{ color: currentTheme.colors.primary, fontWeight: '600' }}>Score: {(match.compatibilityScore * 100).toFixed(0)}%</Text>
              {matchFactors.length > 0 && (
                <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
                  Factors: {matchFactors.join(', ')}
                </Text>
              )}
            </VStack>
          </HStack>
        </Card>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <VStack space="lg" style={{ flex: 1, padding: currentTheme.spacing.md }}>
        <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
          AI Recommendations
        </Text>
        <HStack space="md" style={{ marginBottom: currentTheme.spacing.sm }}>
          <Button action={type === 'Property' ? 'primary' : 'secondary'} onPress={() => setType('Property')}>
            <ButtonText>Properties</ButtonText>
          </Button>
          <Button action={type === 'Roommate' ? 'primary' : 'secondary'} onPress={() => setType('Roommate')}>
            <ButtonText>Roommates</ButtonText>
          </Button>
        </HStack>
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
                <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>No matches found.</Text>
              ) : (
                matches.map((match: any) => (
                  <MatchCard
                    key={match._id}
                    match={match}
                    goToDetails={goToDetails}
                    currentTheme={currentTheme}
                    FALLBACK_IMAGE={FALLBACK_IMAGE}
                  />
                ))
              )}
            </VStack>
          </ScrollView>
        )}
      </VStack>
    </SafeAreaView>
  );
} 