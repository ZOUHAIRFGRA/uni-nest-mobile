import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView, TouchableOpacity, Modal, Image as RNImage } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Divider } from '../../components/ui/divider';
import { useRoute, useNavigation } from '@react-navigation/native';
import { propertyService } from '../services/propertyService';
import { Spinner } from '../../components/ui/spinner';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HStack } from '@/components/ui/hstack';
import { useSelector } from 'react-redux';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export default function PropertyDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const propertyId = route.params?.id;
  const user = useSelector((state: any) => state.auth.user);

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  // Image modal state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  
  // Landlord-specific state
  const [propertyStats, setPropertyStats] = useState<any>(null);

  // Check if user owns this property
  const isOwner = property && user && property.landlordId && 
    (property.landlordId._id === user.id || property.landlordId === user.id);

  const fetchPropertyStats = useCallback(async () => {
    if (!propertyId) return;
    
    try {
      // Mock API call - would be implemented in landlordService
      const statsResponse = await Promise.resolve({ 
        data: { views: 45, inquiries: 12, occupancyRate: 85 } 
      });
      
      setPropertyStats(statsResponse.data);
    } catch (e: any) {
      console.error('Failed to fetch property stats:', e);
    }
  }, [propertyId]);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await propertyService.getPropertyById(propertyId);
        setProperty(response.data);
        
        // If landlord owns this property, fetch additional stats
        if (user?.role === 'Landlord' && response.data?.landlordId && 
            (response.data.landlordId._id === user.id || response.data.landlordId === user.id)) {
          fetchPropertyStats();
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };
    
    if (propertyId) fetchProperty();
  }, [propertyId, user, fetchPropertyStats]);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const { favorites } = await propertyService.getFavorites();
        setIsFavorite(Array.isArray(favorites) && favorites.some((fav: any) => fav._id === propertyId || fav.id === propertyId));
      } catch {}
    };
    if (propertyId) fetchFavoriteStatus();
  }, [propertyId]);

  const toggleFavorite = async () => {
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await propertyService.removeFromFavorites(propertyId);
        setIsFavorite(false);
      } else {
        await propertyService.addToFavorites(propertyId);
        setIsFavorite(true);
      }
    } catch {}
    setFavoriteLoading(false);
  };

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageModalVisible(true);
  };

  const closeImageModal = () => {
    setIsImageModalVisible(false);
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!property?.images || selectedImageIndex === null) return;
    
    const newIndex = direction === 'next' 
      ? (selectedImageIndex + 1) % property.images.length
      : (selectedImageIndex - 1 + property.images.length) % property.images.length;
    
    setSelectedImageIndex(newIndex);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: currentTheme.spacing.md }} showsVerticalScrollIndicator={false}>
        <VStack space="lg" style={{ width: '100%' }}>
          <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
            Property Details
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
          ) : property ? (
            <VStack space="md">
              {/* Landlord Management Panel */}
              {isOwner && (
                <Card style={{ padding: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.card, backgroundColor: currentTheme.colors.primary + '10' }}>
                  <VStack space="sm">
                    <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text size="lg" style={{ fontWeight: '700', color: currentTheme.colors.primary }}>Property Management</Text>
                      <Badge variant="solid" style={{ backgroundColor: property.isAvailable ? currentTheme.colors.success : currentTheme.colors.warning }}>
                        <Text size="xs" style={{ color: 'white' }}>{property.isAvailable ? 'Available' : 'Occupied'}</Text>
                      </Badge>
                    </HStack>
                    
                    {propertyStats && (
                      <HStack space="md" style={{ marginTop: currentTheme.spacing.sm }}>
                        <Box style={{ flex: 1, alignItems: 'center' }}>
                          <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>{propertyStats.views || 0}</Text>
                          <Text size="xs" style={{ color: currentTheme.colors.text.secondary }}>Views</Text>
                        </Box>
                        <Box style={{ flex: 1, alignItems: 'center' }}>
                          <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>{propertyStats.inquiries || 0}</Text>
                          <Text size="xs" style={{ color: currentTheme.colors.text.secondary }}>Inquiries</Text>
                        </Box>
                        <Box style={{ flex: 1, alignItems: 'center' }}>
                          <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>{propertyStats.occupancyRate || 0}%</Text>
                          <Text size="xs" style={{ color: currentTheme.colors.text.secondary }}>Occupancy</Text>
                        </Box>
                      </HStack>
                    )}
                    
                    <HStack space="sm" style={{ marginTop: currentTheme.spacing.md }}>
                      <Button action="primary" size="sm" style={{ flex: 1 }} onPress={() => navigation.navigate('Bookings')}>
                        <ButtonText>View Bookings</ButtonText>
                      </Button>
                      <Button action="secondary" size="sm" style={{ flex: 1 }} onPress={() => navigation.navigate('PropertyCreate', { mode: 'edit', id: property._id || property.id })}>
                        <ButtonText>Edit Property</ButtonText>
                      </Button>
                    </HStack>
                  </VStack>
                </Card>
              )}

              {/* Images carousel */}
              {property.images && property.images.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={{ marginBottom: currentTheme.spacing.md }}
                  contentContainerStyle={{ paddingHorizontal: 0 }}
                >
                  <Box style={{ flexDirection: 'row' }}>
                    {property.images.map((img: string, idx: number) => (
                      <TouchableOpacity 
                        key={idx} 
                        onPress={() => openImageModal(idx)} 
                        style={{ marginRight: idx === property.images.length - 1 ? 0 : 8 }}
                      >
                        <Box style={{ 
                          width: 300, 
                          height: 200, 
                          borderRadius: 12, 
                          overflow: 'hidden', 
                          backgroundColor: currentTheme.colors.card
                        }}>
                          <RNImage 
                            source={{ uri: img }} 
                            style={{ 
                              width: 300, 
                              height: 200, 
                              resizeMode: 'cover' 
                            }} 
                          />
                        </Box>
                      </TouchableOpacity>
                    ))}
                  </Box>
                </ScrollView>
              )}
              
              <Text size="2xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>{property.title}</Text>
              <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>{property.address || ''}</Text>
              <Text size="lg" style={{ color: currentTheme.colors.primary, fontWeight: '600' }}>{property.price} MAD / month</Text>
              <Text size="md" style={{ color: currentTheme.colors.text.primary }}>{property.description}</Text>
              <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
              
              {/* Property Details */}
              <VStack space="xs">
                <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>
                  Max Tenants: {property.maxTenants || '-'}
                </Text>
                <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>
                  Utilities Included: {property.utilitiesIncluded ? 'Yes' : 'No'}
                </Text>
                <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>
                  Room Type: {property.roomType || 'Private'}
                </Text>
                {property.amenities && Object.keys(property.amenities).some(key => property.amenities[key]) && (
                  <VStack space="xs" style={{ marginTop: currentTheme.spacing.sm }}>
                    <Text size="md" style={{ fontWeight: '600', color: currentTheme.colors.text.primary }}>Amenities:</Text>
                    <HStack space="xs" style={{ flexWrap: 'wrap' }}>
                      {Object.entries(property.amenities).filter(([_, value]) => value).map(([key, _]) => (
                        <Badge key={key} variant="outline" style={{ margin: 2 }}>
                          <Text size="xs">{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>
                )}
              </VStack>
              {/* Map integration */}
              {property.location && Array.isArray(property.location.coordinates) && property.location.coordinates.length === 2 && (
                <Box style={{ height: 220, borderRadius: 14, overflow: 'hidden', marginTop: 16, backgroundColor: '#F0F2F5' }}>
                  <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: property.location.coordinates[1],
                      longitude: property.location.coordinates[0],
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                  >
                    <UrlTile
                      urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      maximumZ={19}
                    />
                    <Marker
                      coordinate={{
                        latitude: property.location.coordinates[1],
                        longitude: property.location.coordinates[0],
                      }}
                      title={property.title}
                      description={property.address}
                    />
                  </MapView>
                </Box>
              )}
              <Button action="secondary" style={{ marginTop: currentTheme.spacing.sm }} onPress={() => navigation.navigate('PropertyMap', { propertyId })}>
                <ButtonText>View on Map</ButtonText>
              </Button>
              
              {/* Role-based action buttons */}
              {!isOwner && (
                <Button action="primary" style={{ marginTop: currentTheme.spacing.lg }} onPress={() =>  navigation.navigate('Bookings', {
      screen: 'BookingCreate',
      params: { 
        propertyId,
        monthlyRent: property.price,
        securityDeposit: property.price // Using rent amount as security deposit (common practice)
      }
    })}>
                  <ButtonText>Book This Property</ButtonText>
                </Button>
              )}
              
              {isOwner && (
                <VStack space="sm" style={{ marginTop: currentTheme.spacing.lg }}>
                  <HStack space="sm">
                    <Button 
                      action={property.isAvailable ? "secondary" : "primary"} 
                      size="sm" 
                      style={{ flex: 1 }}
                      onPress={() => {
                        // Toggle availability status - would integrate with backend
                        console.log('Toggle availability status');
                      }}
                    >
                      <ButtonText>{property.isAvailable ? 'Mark as Occupied' : 'Mark as Available'}</ButtonText>
                    </Button>
                    <Button action="secondary" size="sm" style={{ flex: 1 }} onPress={() => console.log('Navigate to maintenance')}>
                      <ButtonText>Maintenance</ButtonText>
                    </Button>
                  </HStack>
                  <Button action="primary" onPress={() => console.log('Navigate to analytics')}>
                    <ButtonText>View Analytics</ButtonText>
                  </Button>
                </VStack>
              )}
            </VStack>
          ) : null}
        </VStack>
        {/* Role-based floating action buttons */}
        <Box style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, flexDirection: 'row', alignItems: 'center' }}>
          {/* Edit icon for landlord owners */}
          {isOwner && (
            <TouchableOpacity onPress={() => navigation.navigate('PropertyCreate', { mode: 'edit', id: property._id || property.id })} style={{ marginRight: 16 }}>
              <MaterialCommunityIcons name="pencil" size={28} color={currentTheme.colors.primary} />
            </TouchableOpacity>
          )}
          {/* Favorite icon only for non-owners (students) */}
          {!isOwner && (
            <TouchableOpacity onPress={toggleFavorite} disabled={favoriteLoading}>
              <MaterialCommunityIcons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={32}
                color={isFavorite ? '#FF4C4C' : '#666'}
              />
            </TouchableOpacity>
          )}
        </Box>
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <TouchableOpacity 
          style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0, 0, 0, 0.9)', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}
          activeOpacity={1}
          onPress={closeImageModal}
        >
          {/* Close button */}
          <TouchableOpacity 
            style={{ 
              position: 'absolute', 
              top: 50, 
              right: 20, 
              zIndex: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 25,
              width: 50,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={closeImageModal}
          >
            <MaterialCommunityIcons name="close" size={24} color="white" />
          </TouchableOpacity>

          {/* Navigation buttons */}
          {property?.images && property.images.length > 1 && (
            <>
              <TouchableOpacity 
                style={{ 
                  position: 'absolute', 
                  left: 20, 
                  zIndex: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 25,
                  width: 50,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onPress={() => navigateImage('prev')}
              >
                <MaterialCommunityIcons name="chevron-left" size={28} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ 
                  position: 'absolute', 
                  right: 20, 
                  zIndex: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 25,
                  width: 50,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onPress={() => navigateImage('next')}
              >
                <MaterialCommunityIcons name="chevron-right" size={28} color="white" />
              </TouchableOpacity>
            </>
          )}

          {/* Current image */}
          {selectedImageIndex !== null && property?.images && (
            <TouchableOpacity 
              style={{ 
                width: '100%', 
                height: '90%', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}
              activeOpacity={1}
              onPress={() => {}} // Prevent closing when tapping image
            >
              <RNImage 
                source={{ uri: property.images[selectedImageIndex] }} 
                style={{ 
                  width: '95%', 
                  height: '95%', 
                  resizeMode: 'contain'
                }} 
              />
            </TouchableOpacity>
          )}

          {/* Image counter */}
          {property?.images && selectedImageIndex !== null && (
            <Box style={{ 
              position: 'absolute', 
              bottom: 50, 
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8
            }}>
              <Text style={{ color: 'white', fontSize: 14 }}>
                {selectedImageIndex + 1} / {property.images.length}
              </Text>
            </Box>
          )}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
} 