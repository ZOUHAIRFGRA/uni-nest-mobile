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
import { Image } from '@/components/ui/image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PropertyRecommendationsScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const recs = await matchingService.generateRecommendations('property', 10);
      setRecommendations(recs);
    } catch (e: any) {
      setError(e.message || 'Failed to load recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    await fetchRecommendations();
    setRegenerating(false);
  };

  const goToDetails = (id: string) => navigation.navigate('PropertyDetails', { id });
  const FALLBACK_IMAGE = require('@/assets/images/placeholder.jpg');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <VStack space="lg" style={{ flex: 1, padding: currentTheme.spacing.md }}>
        <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
          AI Property Recommendations
        </Text>
        <Button
          action="primary"
          size="sm"
          style={{ alignSelf: 'flex-end', marginBottom: currentTheme.spacing.sm }}
          onPress={handleRegenerate}
          disabled={regenerating}
        >
          <ButtonText>{regenerating ? 'Regenerating...' : 'Regenerate Recommendations'}</ButtonText>
        </Button>
        <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
        {loading ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>Loading recommendations...</Text>
          </Box>
        ) : error ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text size="md" style={{ color: currentTheme.colors.error }}>{error}</Text>
            <Button action="primary" onPress={fetchRecommendations} style={{ marginTop: currentTheme.spacing.md }}>
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
              {recommendations.length === 0 ? (
                <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>No recommendations found.</Text>
              ) : (
                recommendations.map((property: any, idx: number) => (
                  <PropertyRecommendationCard
                    key={property.id || property._id || idx}
                    property={property}
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

function PropertyRecommendationCard({ property, goToDetails, currentTheme, FALLBACK_IMAGE }: any) {
  const [imgError, setImgError] = React.useState(false);
  const imageUrl = !imgError && property.images && property.images[0]
    ? { uri: property.images[0] }
    : FALLBACK_IMAGE;
  return (
    <Pressable
      key={property.id || property._id}
      style={{ marginBottom: currentTheme.spacing.sm }}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`View property ${property.title}`}
      onPress={() => goToDetails(property.id || property._id)}
    >
      <Card style={{ padding: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.card, borderWidth: 2, borderColor: currentTheme.colors.primary + '80', shadowColor: currentTheme.colors.primary, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 }}>
        <HStack space="md" style={{ alignItems: 'center' }}>
          {/* Property image with fallback */}
          <Box style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', backgroundColor: currentTheme.colors.card, marginRight: currentTheme.spacing.md, borderWidth: 2, borderColor: currentTheme.colors.primary + '40' }}>
            <Image
              source={imageUrl}
              onError={() => setImgError(true)}
              size="md"
              alt="property image"
              style={{ width: '100%', height: '100%' }}
            />
            {/* AI icon overlay */}
            <Box style={{ position: 'absolute', top: 4, right: 4, backgroundColor: currentTheme.colors.primary, borderRadius: 12, padding: 2, zIndex: 2 }}>
              <MaterialCommunityIcons name="robot-excited-outline" size={18} color="#fff" />
            </Box>
          </Box>
          <VStack space="xs" style={{ flex: 1 }}>
            <Text size="lg" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>{property.title}</Text>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>{property.address || ''}</Text>
            <Text size="md" style={{ color: currentTheme.colors.primary, fontWeight: '600' }}>{property.price} MAD / month</Text>
            {property.score && (
              <Text size="sm" style={{ color: currentTheme.colors.secondary, fontWeight: '600' }}>AI Score: {Math.round(property.score * 100)}%</Text>
            )}
            {property.why && (
              <Text size="sm" style={{ color: currentTheme.colors.text.secondary, fontStyle: 'italic', marginTop: 2 }}>Why recommended: {property.why}</Text>
            )}
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
} 