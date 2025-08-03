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
import { propertyService } from '../services/propertyService';
import { Spinner } from '../../components/ui/spinner';
import { Image } from '@/components/ui/image';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');

  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const FALLBACK_IMAGE = require('@/assets/images/placeholder.jpg');

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await propertyService.getFavorites();
      // console.log('🔍 [FAVORITES FETCHED]', response);
      setFavorites(response.favorites || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFavorites();
  }, [fetchFavorites]);

  const goToDetails = (id: string) => navigation.navigate('PropertyDetails', { id });
  const handleRemove = async (id: string) => {
    try {
      await propertyService.removeFromFavorites(id);
      fetchFavorites();
    } catch (e: any) {
      setError(e.message || 'Failed to remove from favorites');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <VStack space="lg" style={{ flex: 1, padding: currentTheme.spacing.md }}>
        <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
          My Favorites
        </Text>
        <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
        {loading ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Spinner size="large" />
          </Box>
        ) : error ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text size="md" style={{ color: currentTheme.colors.error }}>{error}</Text>
            <Button action="primary" onPress={fetchFavorites} style={{ marginTop: currentTheme.spacing.md }}>
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
              {favorites.length === 0 ? (
                <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>No favorite properties found.</Text>
              ) : (
                favorites.map((property: any) => (
                  <FavoriteCard
                    key={property.id || property._id}
                    property={property}
                    goToDetails={goToDetails}
                    handleRemove={handleRemove}
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

function FavoriteCard({ property, goToDetails, handleRemove, currentTheme, FALLBACK_IMAGE }: any) {
  const [imgError, setImgError] = React.useState(false);
  const imageUrl = !imgError && property.images && property.images[0] ? { uri: property.images[0] } : FALLBACK_IMAGE;
  return (
    <Pressable
      key={property.id || property._id}
      style={{ marginBottom: currentTheme.spacing.sm }}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`View property ${property.title}`}
      onPress={() => goToDetails(property.id || property._id)}
    >
      <Card style={{ padding: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.card }}>
        <HStack space="md" style={{ alignItems: 'center' }}>
          <Box style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', backgroundColor: currentTheme.colors.card, marginRight: currentTheme.spacing.md }}>
            <Image
              source={imageUrl}
              onError={() => setImgError(true)}
              alt="property image"
              style={{ width: '100%', height: '100%' }}
            />
          </Box>
          <VStack space="xs" style={{ flex: 1 }}>
            <Text size="lg" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>{property.title}</Text>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>{property.address || ''}</Text>
            <Text size="md" style={{ color: currentTheme.colors.primary, fontWeight: '600' }}>{property.price} MAD / month</Text>
          </VStack>
          <Button action="secondary" variant="outline" size="sm" onPress={() => handleRemove(property.id || property._id)}>
            <ButtonText>Remove</ButtonText>
          </Button>
        </HStack>
      </Card>
    </Pressable>
  );
} 