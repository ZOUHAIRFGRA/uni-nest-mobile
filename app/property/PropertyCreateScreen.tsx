import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView, Platform } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Input, InputField } from '../../components/ui/input';
import { Divider } from '../../components/ui/divider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { propertyService } from '../services/propertyService';
import { Spinner } from '../../components/ui/spinner';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from '@/components/ui/image';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { HStack } from '../../components/ui/hstack';

export default function PropertyFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  
  // Get mode and propertyId from route params
  const mode = route.params?.mode || 'create';
  const propertyId = route.params?.id;
  const isEditMode = mode === 'edit';

  const [form, setForm] = useState<any>({ title: '', description: '', price: '', address: '', maxTenants: '', utilitiesIncluded: false, location: '', images: [] });
  const [loading, setLoading] = useState(isEditMode); // Start loading if edit mode
  const [saving, setSaving] = useState(false);
  const [compressingImages, setCompressingImages] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState<any>(null);
  const [selectingLocation, setSelectingLocation] = useState(false);
  // Add required fields
  const [distanceToUniversity, setDistanceToUniversity] = useState('');
  const [distanceToBusStop, setDistanceToBusStop] = useState('');
  const [amenities, setAmenities] = useState<{ [key: string]: boolean }>({ wifi: false, parking: false, laundry: false, gym: false, security: false, furnished: false, airConditioning: false, heating: false, kitchen: false, balcony: false });
  const [roomType, setRoomType] = useState('Private');
  const [isAvailable, setIsAvailable] = useState(true);

  // Fetch property data if in edit mode
  useEffect(() => {
    const fetchProperty = async () => {
      if (!isEditMode || !propertyId) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await propertyService.getPropertyById(propertyId);
        const p = response.data;
        setForm({
          title: p.title || '',
          description: p.description || '',
          price: p.price ? String(p.price) : '',
          address: p.address || '',
          maxTenants: p.maxTenants ? String(p.maxTenants) : '',
          utilitiesIncluded: !!p.utilitiesIncluded,
          location: '',
          images: Array.isArray(p.images) ? p.images : [],
        });
        setDistanceToUniversity(p.distanceToUniversity ? String(p.distanceToUniversity) : '');
        setDistanceToBusStop(p.distanceToBusStop ? String(p.distanceToBusStop) : '');
        setAmenities(p.amenities || { wifi: false, parking: false, laundry: false, gym: false, security: false, furnished: false, airConditioning: false, heating: false, kitchen: false, balcony: false });
        setRoomType(p.roomType || 'Private');
        setIsAvailable(p.isAvailable !== undefined ? !!p.isAvailable : true);
        if (p.location && p.location.coordinates && p.location.coordinates.length === 2) {
          setLocation({ latitude: p.location.coordinates[1], longitude: p.location.coordinates[0] });
          setMapRegion({
            latitude: p.location.coordinates[1],
            longitude: p.location.coordinates[0],
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [isEditMode, propertyId]);

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      if (!location) { // Only set if not already set from edit mode
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        setMapRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    })();
  }, [location]); // Added location as dependency

  const handleChange = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  // Compress image to reduce upload time
  const compressImage = async (uri: string) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 1024 } }, // Resize to max width of 1024px
        ],
        {
          compress: 0.7, // 70% quality
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri; // Return original if compression fails
    }
  };

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Updated to use new API
      allowsMultipleSelection: true,
      quality: 0.8, // Start with good quality
    });
    
    if (!result.canceled && result.assets) {
      setCompressingImages(true);
      setError(null); // Clear any previous errors
      setCompressionProgress({ current: 0, total: result.assets.length });
      console.log(`Starting compression of ${result.assets.length} images...`);
      
      try {
        const compressedImages: string[] = [];
        for (let i = 0; i < result.assets.length; i++) {
          const asset = result.assets[i];
          setCompressionProgress({ current: i + 1, total: result.assets.length });
          console.log(`Compressing image ${i + 1}/${result.assets.length}...`);
          const compressedUri = await compressImage(asset.uri);
          compressedImages.push(compressedUri);
        }
        
        setForm((f: any) => ({ ...f, images: [...f.images, ...compressedImages] }));
        console.log(`Successfully compressed ${compressedImages.length} images`);
      } catch (error) {
        console.error('Error processing images:', error);
        setError('Failed to process images. Please try again.');
      } finally {
        setCompressingImages(false);
        setCompressionProgress({ current: 0, total: 0 });
      }
    }
  };

  const removeImage = (index: number) => {
    setForm((f: any) => ({
      ...f,
      images: f.images.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
    // Reverse geocode to get address
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place) {
        const addressString = [
          place.name,
          place.street,
          place.city,
          place.region,
          place.country
        ].filter(Boolean).join(', ');
        setForm((f: any) => ({ ...f, address: addressString }));
      }
    } catch (err) {
      console.error("error map press",err)
    }
  };

  const handleAmenityToggle = (key: string) => setAmenities(a => ({ ...a, [key]: !a[key] }));

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      if (!location) throw new Error('Please select a location on the map.');
      if (!form.images || form.images.length === 0) throw new Error('Please add at least one image.');

      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Add property data
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('address', form.address);
      formData.append('maxTenants', form.maxTenants);
      formData.append('utilitiesIncluded', form.utilitiesIncluded.toString());
      formData.append('distanceToUniversity', distanceToUniversity);
      formData.append('distanceToBusStop', distanceToBusStop);
      formData.append('roomType', roomType);
      formData.append('isAvailable', isAvailable.toString());
      
      // Add location data
      formData.append('location', JSON.stringify({
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      }));
      
      // Add amenities
      formData.append('amenities', JSON.stringify({
        wifi: amenities.wifi,
        parking: amenities.parking,
        laundry: amenities.laundry,
        gym: amenities.gym,
        security: amenities.security,
        furnished: amenities.furnished,
        airConditioning: amenities.airConditioning,
        heating: amenities.heating,
        kitchen: amenities.kitchen,
        balcony: amenities.balcony,
      }));

      // Handle images differently for edit vs create mode
      let hasNewImages = false;
      
      if (isEditMode) {
        // In edit mode, check if there are any new images (local URIs vs Cloudinary URLs)
        for (let i = 0; i < form.images.length; i++) {
          const uri = form.images[i];
          // Check if this is a new local image (not a Cloudinary URL)
          if (!uri.includes('cloudinary.com')) {
            hasNewImages = true;
            const filename = `compressed_image_${i}_${Date.now()}.jpg`;
            formData.append('images', {
              uri,
              type: 'image/jpeg',
              name: filename,
            } as any);
          }
        }
        
        // If no new images, don't include existing Cloudinary URLs as files
        // The server will keep existing images if no new ones are provided
        console.log('Edit mode - New images detected:', hasNewImages);
      } else {
        // In create mode, add all images as files
        console.log('Preparing compressed images for upload...');
        for (let i = 0; i < form.images.length; i++) {
          const uri = form.images[i];
          const filename = `compressed_image_${i}_${Date.now()}.jpg`;
          
          formData.append('images', {
            uri,
            type: 'image/jpeg',
            name: filename,
          } as any);
        }
        hasNewImages = true;
      }

      console.log('Request Data:', {
        title: form.title,
        price: form.price,
        address: form.address,
        imagesCount: form.images.length,
        location: { coordinates: [location.longitude, location.latitude] },
        roomType: roomType,
        isEditMode,
        hasNewImages
      });

      // Choose the appropriate service method based on whether we have new images
      const response = isEditMode
        ? (hasNewImages 
            ? await propertyService.updatePropertyWithFiles(propertyId, formData)
            : await propertyService.updateProperty(propertyId, {
                title: form.title,
                description: form.description,
                price: Number(form.price),
                address: form.address,
                maxTenants: Number(form.maxTenants),
                utilitiesIncluded: form.utilitiesIncluded,
                distanceToUniversity: Number(distanceToUniversity),
                distanceToBusStop: Number(distanceToBusStop),
                roomType: roomType as 'Private' | 'Shared' | 'Studio',
                isAvailable: isAvailable,
                location: {
                  type: 'Point',
                  coordinates: [location.longitude, location.latitude],
                },
                amenities: {
                  wifi: amenities.wifi,
                  parking: amenities.parking,
                  laundry: amenities.laundry,
                  gym: amenities.gym,
                  security: amenities.security,
                  furnished: amenities.furnished,
                  airConditioning: amenities.airConditioning,
                  heating: amenities.heating,
                  kitchen: amenities.kitchen,
                  balcony: amenities.balcony,
                }
              }))
        : await propertyService.createPropertyWithFiles(formData);

      console.log('Response Data:', {
        success: response.success,
        message: response.message,
        propertyId: response.data?._id || response.data?.id,
        imagesCount: response.data?.images?.length || 0
      });

      if (!response.success) throw new Error(response.message || `Failed to ${isEditMode ? 'update' : 'create'} property`);

      setSuccess(true);

      if (isEditMode) {
        navigation.navigate('PropertyDetails', { id: response.data._id || response.data.id || propertyId });
      } else {
        setForm({ title: '', description: '', price: '', address: '', maxTenants: '', utilitiesIncluded: false, location: '', images: [] });
        setLocation(null);
        setDistanceToUniversity('');
        setDistanceToBusStop('');
        setAmenities({ wifi: false, parking: false, laundry: false, gym: false, security: false, furnished: false, airConditioning: false, heating: false, kitchen: false, balcony: false });
        setRoomType('Private');
        setIsAvailable(true);
        navigation.navigate('PropertyDetails', { id: response.data._id || response.data.id });
      }
    } catch (e: any) {
      setError(e.message || `Failed to ${isEditMode ? 'update' : 'create'} property`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: currentTheme.spacing.md }} showsVerticalScrollIndicator={false}>
        <VStack space="lg" style={{ width: '100%' }}>
          <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
            {isEditMode ? 'Edit Property' : 'Create Property'}
          </Text>
          <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
          {error && (
            <Text size="md" style={{ color: currentTheme.colors.error }}>{error}</Text>
          )}
          {success && (
            <Text size="md" style={{ color: currentTheme.colors.secondary }}>Property {isEditMode ? 'updated' : 'created'} successfully!</Text>
          )}
          <Input style={{ backgroundColor: currentTheme.colors.input, borderRadius: currentTheme.borderRadius.input, borderColor: currentTheme.colors.border }}>
            <InputField
              value={form.title}
              onChangeText={v => handleChange('title', v)}
              placeholder="Title"
              style={{ fontFamily: currentTheme.typography.fontFamily }}
              allowFontScaling
            />
          </Input>
          <Input style={{ backgroundColor: currentTheme.colors.input, borderRadius: currentTheme.borderRadius.input, borderColor: currentTheme.colors.border }}>
            <InputField
              value={form.description}
              onChangeText={v => handleChange('description', v)}
              placeholder="Description"
              style={{ fontFamily: currentTheme.typography.fontFamily }}
              allowFontScaling
            />
          </Input>
          <Input style={{ backgroundColor: currentTheme.colors.input, borderRadius: currentTheme.borderRadius.input, borderColor: currentTheme.colors.border }}>
            <InputField
              value={form.price}
              onChangeText={v => handleChange('price', v)}
              placeholder="Price (MAD/month)"
              keyboardType="numeric"
              style={{ fontFamily: currentTheme.typography.fontFamily }}
              allowFontScaling
            />
          </Input>
          <Input style={{ backgroundColor: currentTheme.colors.input, borderRadius: currentTheme.borderRadius.input, borderColor: currentTheme.colors.border }}>
            <InputField
              value={form.maxTenants}
              onChangeText={v => handleChange('maxTenants', v)}
              placeholder="Max Tenants"
              keyboardType="numeric"
              style={{ fontFamily: currentTheme.typography.fontFamily }}
              allowFontScaling
            />
          </Input>
          <Input style={{ backgroundColor: currentTheme.colors.input, borderRadius: currentTheme.borderRadius.input, borderColor: currentTheme.colors.border }}>
            <InputField
              value={form.address}
              onChangeText={v => handleChange('address', v)}
              placeholder="Address"
              style={{ fontFamily: currentTheme.typography.fontFamily }}
              allowFontScaling
            />
          </Input>
          <Button action="secondary" onPress={() => setSelectingLocation(true)} style={{ marginBottom: currentTheme.spacing.sm }}>
            <ButtonText>Select Location on Map</ButtonText>
          </Button>
          {selectingLocation && mapRegion && (
            <Box style={{ height: 300, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
              <MapView
                style={{ flex: 1 }}
                initialRegion={mapRegion}
                onPress={handleMapPress}
              >
                <UrlTile urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
                {location && (
                  <Marker coordinate={location} />
                )}
              </MapView>
              <Button action="primary" onPress={() => setSelectingLocation(false)} style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 10 }}>
                <ButtonText>Done</ButtonText>
              </Button>
            </Box>
          )}
          <Button action="secondary" onPress={pickImages} disabled={compressingImages} style={{ marginBottom: currentTheme.spacing.sm }}>
            <ButtonText>{compressingImages ? 'Compressing Images...' : 'Add Images'}</ButtonText>
          </Button>
          
          {compressingImages && (
            <Box style={{ 
              padding: currentTheme.spacing.md, 
              backgroundColor: currentTheme.colors.card, 
              borderRadius: currentTheme.borderRadius.input, 
              alignItems: 'center',
              marginBottom: currentTheme.spacing.sm 
            }}>
              <Spinner size="large" />
              <Text size="md" style={{ color: currentTheme.colors.text.primary, marginTop: 8, textAlign: 'center' }}>
                Processing Images...
              </Text>
              {compressionProgress.total > 0 && (
                <Text size="sm" style={{ color: currentTheme.colors.text.secondary, marginTop: 4, textAlign: 'center' }}>
                  Compressing {compressionProgress.current} of {compressionProgress.total} images
                </Text>
              )}
              <Text size="sm" style={{ color: currentTheme.colors.text.secondary, marginTop: 2, textAlign: 'center' }}>
                Optimizing for faster upload
              </Text>
            </Box>
          )}
          
          <VStack space="xs">
            {form.images.map((img: string, idx: number) => (
              <Box key={idx} style={{ width: 100, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: currentTheme.colors.card, marginBottom: 8, position: 'relative' }}>
                <Image source={{ uri: img }} alt={`Property image ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <Button 
                  size="xs" 
                  action="secondary" 
                  onPress={() => removeImage(idx)}
                  style={{ 
                    position: 'absolute', 
                    top: 4, 
                    right: 4, 
                    minHeight: 24, 
                    minWidth: 24, 
                    padding: 2,
                    backgroundColor: 'rgba(255,255,255,0.8)'
                  }}
                >
                  <ButtonText style={{ fontSize: 12 }}>×</ButtonText>
                </Button>
              </Box>
            ))}
            {form.images.length > 0 && (
              <Text size="sm" style={{ color: currentTheme.colors.text.secondary, marginTop: 4 }}>
                {form.images.length} image{form.images.length !== 1 ? 's' : ''} selected (compressed for faster upload)
              </Text>
            )}
          </VStack>
          <Input style={{ backgroundColor: currentTheme.colors.input, borderRadius: currentTheme.borderRadius.input, borderColor: currentTheme.colors.border }}>
            <InputField
              value={distanceToUniversity}
              onChangeText={setDistanceToUniversity}
              placeholder="Distance to University (meters)"
              keyboardType="numeric"
              style={{ fontFamily: currentTheme.typography.fontFamily }}
              allowFontScaling
            />
          </Input>
          <Input style={{ backgroundColor: currentTheme.colors.input, borderRadius: currentTheme.borderRadius.input, borderColor: currentTheme.colors.border }}>
            <InputField
              value={distanceToBusStop}
              onChangeText={setDistanceToBusStop}
              placeholder="Distance to Bus Stop (meters)"
              keyboardType="numeric"
              style={{ fontFamily: currentTheme.typography.fontFamily }}
              allowFontScaling
            />
          </Input>
          <Text size="md" style={{ fontWeight: '600', marginTop: 8 }}>Amenities</Text>
          <VStack space="xs">
            {Object.keys(amenities).map(key => (
              <Box key={key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Button action={amenities[key] ? 'primary' : 'secondary'} size="sm" onPress={() => handleAmenityToggle(key)} style={{ marginRight: 8 }}>
                  <ButtonText>{key.charAt(0).toUpperCase() + key.slice(1)}</ButtonText>
                </Button>
                <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>{amenities[key] ? 'Yes' : 'No'}</Text>
              </Box>
            ))}
          </VStack>
          <Text size="md" style={{ fontWeight: '600', marginTop: 8 }}>Room Type</Text>
          <HStack space="sm" style={{ marginBottom: 8 }}>
            {['Private', 'Shared', 'Studio'].map(type => (
              <Button key={type} action={roomType === type ? 'primary' : 'secondary'} size="sm" onPress={() => setRoomType(type)} style={{ marginRight: 8 }}>
                <ButtonText>{type}</ButtonText>
              </Button>
            ))}
          </HStack>
          <Text size="md" style={{ fontWeight: '600', marginTop: 8 }}>Available</Text>
          <HStack space="sm" style={{ marginBottom: 8 }}>
            <Button action={isAvailable ? 'primary' : 'secondary'} size="sm" onPress={() => setIsAvailable(true)} style={{ marginRight: 8 }}>
              <ButtonText>Yes</ButtonText>
            </Button>
            <Button action={!isAvailable ? 'primary' : 'secondary'} size="sm" onPress={() => setIsAvailable(false)}>
              <ButtonText>No</ButtonText>
            </Button>
          </HStack>
          <Button action="primary" onPress={handleSubmit} disabled={saving || compressingImages} style={{ marginTop: currentTheme.spacing.lg }}>
            <ButtonText>
              {saving 
                ? (isEditMode ? 'Uploading Changes...' : 'Creating Property...') 
                : compressingImages 
                ? 'Processing Images...'
                : (isEditMode ? 'Save Changes' : 'Create Property')
              }
            </ButtonText>
          </Button>
          {saving && (
            <Text size="sm" style={{ color: currentTheme.colors.text.secondary, textAlign: 'center', marginTop: 8 }}>
              {form.images.length > 0 ? `Uploading ${form.images.length} compressed image${form.images.length !== 1 ? 's' : ''}...` : 'Saving property...'}
            </Text>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}