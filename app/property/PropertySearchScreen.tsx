import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView, RefreshControl, Pressable } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input, InputField } from '../../components/ui/input';
import { HStack } from '../../components/ui/hstack';
import { Divider } from '../../components/ui/divider';
import { useNavigation } from '@react-navigation/native';
import { propertyService } from '../services/propertyService';
import { Spinner } from '../../components/ui/spinner';
import { Image } from '@/components/ui/image';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PropertySearchScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const user = useSelector((state: any) => state.auth.user);
  const isLandlord = user?.role === 'Landlord';

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (isLandlord && user?.id) {
        response = await propertyService.getPropertiesByLandlord(user.id);
      } else {
        response = await propertyService.getProperties({ query: search });
      }
      setProperties(response?.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load properties');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, isLandlord, user]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProperties();
  }, [fetchProperties]);

  const goToDetails = (id: string) => navigation.navigate('PropertyDetails', { id });
  const goToEdit = (id: string) => navigation.navigate('PropertyCreate', { mode: 'edit', id });
  const goToAdd = () => navigation.navigate('PropertyCreate', { mode: 'create' });
  const handleDelete = async (id: string) => {
    try {
      await propertyService.deleteProperty(id);
      fetchProperties();
    } catch (e: any) {
      setError(e.message || 'Failed to delete property');
    }
  };

  const FALLBACK_IMAGE = require('@/assets/images/placeholder.jpg');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <VStack space="lg" style={{ flex: 1, padding: currentTheme.spacing.md }}>
        <HStack space="md" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
            {isLandlord ? 'My Properties' : 'Search Properties'}
          </Text>
          {isLandlord && (
            <Button action="primary" size="sm" onPress={goToAdd} style={{ borderRadius: 24, paddingHorizontal: 16 }}>
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <ButtonText style={{ marginLeft: 6 }}>Add</ButtonText>
            </Button>
          )}
        </HStack>
        {!isLandlord && (
          <Input style={{ backgroundColor: currentTheme.colors.input, borderRadius: currentTheme.borderRadius.input, borderColor: currentTheme.colors.border }}>
            <InputField
              value={search}
              onChangeText={setSearch}
              placeholder="Search by location, title, etc."
              placeholderTextColor={currentTheme.colors.placeholder}
              style={{ fontFamily: currentTheme.typography.fontFamily }}
              allowFontScaling
              returnKeyType="search"
              onSubmitEditing={fetchProperties}
            />
          </Input>
        )}
        <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
        {loading ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Spinner size="large" />
          </Box>
        ) : error ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text size="md" style={{ color: currentTheme.colors.error }}>{error}</Text>
            <Button action="primary" onPress={fetchProperties} style={{ marginTop: currentTheme.spacing.md }}>
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
              {properties.length === 0 ? (
                <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>No properties found.</Text>
              ) : (
                properties.map((property: any) => (
                  <PropertyCard
                    key={property.id || property._id}
                    property={property}
                    goToDetails={goToDetails}
                    goToEdit={goToEdit}
                    handleDelete={handleDelete}
                    isLandlord={isLandlord}
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

function PropertyCard({ property, goToDetails, goToEdit, handleDelete, isLandlord, currentTheme, FALLBACK_IMAGE }: any) {
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
      <Card style={{ padding: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.card, position: 'relative' }}>
        <HStack space="md" style={{ alignItems: 'center' }}>
          {/* Property image with fallback */}
          <Box style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', backgroundColor: currentTheme.colors.card, marginRight: currentTheme.spacing.md }}>
            <Image
              source={{ uri: imageUrl }}
              onError={() => setImgError(true)}
              size="md"
              alt="property image"
              style={{ width: '100%', height: '100%' }}
            />
          </Box>
          <VStack space="xs" style={{ flex: 1 }}>
            <Text size="lg" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>{property.title}</Text>
            <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>{property.address || ''}</Text>
            <Text size="md" style={{ color: currentTheme.colors.primary, fontWeight: '600' }}>{property.price} MAD / month</Text>
          </VStack>
          {isLandlord && (
            <HStack space="xs" style={{ marginLeft: 8 }}>
              <Pressable onPress={() => goToEdit(property.id || property._id)} style={{ marginRight: 8 }}>
                <MaterialCommunityIcons name="pencil" size={22} color={currentTheme.colors.primary} />
              </Pressable>
              <Pressable onPress={() => handleDelete(property.id || property._id)}>
                <MaterialCommunityIcons name="delete" size={22} color={currentTheme.colors.error} />
              </Pressable>
            </HStack>
          )}
        </HStack>
      </Card>
    </Pressable>
  );
} 