import React, { useEffect, useState } from 'react';
import { View, Text, Linking, Platform, Button as RNButton, Modal, TouchableOpacity } from 'react-native';
import MapView, { Marker, UrlTile, Callout } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { propertyService } from '../services/propertyService';
import { Spinner } from '../../components/ui/spinner';

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    0.5 -
    Math.cos(dLat) / 2 +
    (Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      (1 - Math.cos(dLon))) /
      2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

const LOCATION_KEY = 'location_permission_granted';

export default function PropertyMapScreen() {
  const route = useRoute<{ key: string; name: string; params: { propertyId?: string } }>();
  const navigation = useNavigation<any>();
  const { propertyId } = (route.params as { propertyId?: string }) || {};
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationChecked, setLocationChecked] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Always try to get location
        await getAndSetLocation();
        // Fetch all properties
        const all = await propertyService.getProperties();
        setAllProperties(all.data || []);
        // Fetch selected property
        if (propertyId) {
          const result = await propertyService.getPropertyById(propertyId);
          setSelectedProperty(result.data);
        }
      } catch (e: any) {
        setError('Failed to load map data');
      } finally {
        setLoading(false);
        setLocationChecked(true);
      }
    })();
  }, [propertyId]);

  const getAndSetLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log('[Location] Permission status:', status);
      if (status !== 'granted') {
        setShowLocationPrompt(true);
        setError('Permission to access location was denied');
        setUserLocation(null);
        await AsyncStorage.removeItem(LOCATION_KEY);
      } else {
        setShowLocationPrompt(false);
        const loc = await Location.getCurrentPositionAsync({});
        console.log('[Location] Location object:', loc);
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        await AsyncStorage.setItem(LOCATION_KEY, 'true');
      }
    } catch (err) {
      console.log('[Location] Error fetching location:', err);
      setError('Failed to get your location.');
      setUserLocation(null);
    }
  };

  const handlePromptAccept = async () => {
    setShowLocationPrompt(false);
    await getAndSetLocation();
  };

  const handlePromptDecline = () => {
    setShowLocationPrompt(false);
    setUserLocation(null);
    setError('Location access declined. You can enable it later.');
  };

  if (loading && !showLocationPrompt) return <Spinner size="large" style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }} />;
  if (error && !showLocationPrompt) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>{error}</Text><RNButton title="Retry location" onPress={getAndSetLocation} /></View>;

  // Center map between user and selected property if both exist
  let initialRegion = {
    latitude: 33.5899, // fallback: Casablanca
    longitude: -7.6039,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };
  if (userLocation && selectedProperty && selectedProperty.location && Array.isArray(selectedProperty.location.coordinates)) {
    const lat1 = userLocation.latitude;
    const lon1 = userLocation.longitude;
    const lat2 = selectedProperty.location.coordinates[1];
    const lon2 = selectedProperty.location.coordinates[0];
    initialRegion = {
      latitude: (lat1 + lat2) / 2,
      longitude: (lon1 + lon2) / 2,
      latitudeDelta: Math.abs(lat1 - lat2) * 2 + 0.02,
      longitudeDelta: Math.abs(lon1 - lon2) * 2 + 0.02,
    };
  } else if (selectedProperty && selectedProperty.location && Array.isArray(selectedProperty.location.coordinates)) {
    initialRegion = {
      latitude: selectedProperty.location.coordinates[1],
      longitude: selectedProperty.location.coordinates[0],
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  } else if (userLocation) {
    initialRegion = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  // Helper: open directions
  const openDirections = (lat: number, lon: number) => {
    if (!userLocation) return;
    const saddr = `${userLocation.latitude},${userLocation.longitude}`;
    const daddr = `${lat},${lon}`;
    const url = Platform.select({
      ios: `http://maps.apple.com/?saddr=${saddr}&daddr=${daddr}`,
      android: `http://maps.google.com/maps?saddr=${saddr}&daddr=${daddr}`,
    });
    Linking.openURL(url!);
  };

  // Helper: get distance
  let distance = null;
  if (userLocation && selectedProperty && selectedProperty.location && Array.isArray(selectedProperty.location.coordinates)) {
    distance = getDistanceFromLatLonInKm(
      userLocation.latitude,
      userLocation.longitude,
      selectedProperty.location.coordinates[1],
      selectedProperty.location.coordinates[0]
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Location permission prompt modal */}
      <Modal visible={showLocationPrompt} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 320, alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Allow Location Access?</Text>
            <Text style={{ color: '#333', marginBottom: 20, textAlign: 'center' }}>
              We use your location to show your position on the map and calculate distances to properties. Your location is never shared.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity onPress={handlePromptDecline} style={{ flex: 1, marginRight: 8, backgroundColor: '#eee', borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ color: '#666' }}>No, thanks</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePromptAccept} style={{ flex: 1, marginLeft: 8, backgroundColor: '#6C63FF', borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ color: '#fff' }}>Allow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <MapView
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        showsUserLocation={!!userLocation}
      >
        <UrlTile urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
        {/* All property markers */}
        {allProperties.map((prop: any) =>
          prop.location && Array.isArray(prop.location.coordinates) && prop.location.coordinates.length === 2 ? (
            <Marker
              key={prop._id || prop.id}
              coordinate={{
                latitude: prop.location.coordinates[1],
                longitude: prop.location.coordinates[0],
              }}
              pinColor={selectedProperty && (prop._id === selectedProperty._id || prop.id === selectedProperty.id) ? '#6C63FF' : undefined}
            >
              <Callout>
                <View style={{ maxWidth: 200 }}>
                  <Text
                    style={{ fontWeight: 'bold', color: '#6C63FF' }}
                    onPress={() => navigation.navigate('PropertyDetails', { id: prop._id || prop.id })}
                  >
                    {prop.title}
                  </Text>
                  <Text>{prop.address}</Text>
                  {userLocation && prop.location && Array.isArray(prop.location.coordinates) && (
                    <Text style={{ color: '#666', fontSize: 12 }}>
                      {getDistanceFromLatLonInKm(
                        userLocation.latitude,
                        userLocation.longitude,
                        prop.location.coordinates[1],
                        prop.location.coordinates[0]
                      ).toFixed(2)} km from you
                    </Text>
                  )}
                  <RNButton
                    title="Get Directions"
                    onPress={() => userLocation && openDirections(prop.location.coordinates[1], prop.location.coordinates[0])}
                    disabled={!userLocation}
                  />
                </View>
              </Callout>
            </Marker>
          ) : null
        )}
        {/* User marker is handled by showsUserLocation */}
      </MapView>
      {/* Show distance to selected property below map */}
      {distance !== null && (
        <View style={{ padding: 12, backgroundColor: '#fff', alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold' }}>
            Distance to property: {distance.toFixed(2)} km
          </Text>
        </View>
      )}
    </View>
  );
} 