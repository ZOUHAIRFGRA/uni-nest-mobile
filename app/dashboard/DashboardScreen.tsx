import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView, RefreshControl, Animated, Easing, Pressable } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { HStack } from '../../components/ui/hstack';
import { Card } from '../../components/ui/card';
import { Divider } from '../../components/ui/divider';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { matchingService } from '../services/matchingService';
import { bookingService } from '../services/bookingService';
import { notificationService } from '../services/notificationService';
import { authService } from '../services/authService';
import { Image as CustomImage } from '../../components/ui/image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { landlordService } from '../services/landlordService';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');

  // State
  const [user, setUser] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Landlord-specific state
  const [properties, setProperties] = useState<any[]>([]);
  const [tenantRequests, setTenantRequests] = useState<any[]>([]);

  // Animation
  const gradientAnim = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(gradientAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, [gradientAnim]);

  // Enhanced fetch function to handle both students and landlords
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const storedUser = await authService.getStoredUserData();
      setUser(storedUser);
      // console.log('👤 [USER DATA]', storedUser);

      if (storedUser?.role === 'Landlord') {
        // Fetch landlord-specific data
        const [propsRes, bookingsRes, ns] = await Promise.all([
          landlordService.getMyProperties(),
          landlordService.getMyBookings(),
          notificationService.getNotifications(1, 5),
        ]);

        const properties = propsRes?.data?.properties || [];
        const bookings = bookingsRes?.data?.bookings || [];
        // console.log('🏠 [LANDLORD Bookings]', bookings);
        setProperties(properties);
        setBookings(bookings);
        setNotifications(ns.notifications || ns || []);

        // Filter pending bookings as tenant requests
        const pendingBookings = bookings.filter((booking: any) =>
          booking.status === 'Pending' || booking.status === 'Confirmed'
        );
        setTenantRequests(pendingBookings);
        // console.log('📋 [TENANT REQUESTS]', pendingBookings);
      } else {
        // Original student data fetching
        const [ms, bs, ns] = await Promise.all([
          matchingService.getMatches('Property', 1, 3),
          bookingService.getBookings(),
          notificationService.getNotifications(1, 3),
        ]);
        
        const matches = ms.data?.matches || [];
        const bookings = bs;
        const notifications = ns.notifications || [];
        
        setMatches(matches);
        setBookings(bookings);
        setNotifications(notifications);
        
        console.log('🧩 [STUDENT MATCHES]', matches);
        console.log('📅 [STUDENT BOOKINGS]', bookings);
      }
    } catch (e) {
      console.log('❌ [DASHBOARD FETCH ERROR]', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // AI Recommendations: fetch only on button press
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const fetchRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
      const recs = await matchingService.generateRecommendations('property', 3);
      setRecommendations(recs);
    } catch {
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Role-based gradient colors
  const isLandlord = user?.role === 'Landlord';
  const gradientColors = isLandlord 
    ? ['#2563EB', '#7C3AED', '#2563EB'] // Blue-purple for landlords
    : [`${currentTheme.colors.primary}B3`, `${currentTheme.colors.secondary}B3`, `${currentTheme.colors.primary}B3`]; // Original for students
  
  const gradientStart = { x: 0, y: 0 };
  const gradientEnd = { x: 1, y: 1 };

  // Navigation handlers
  const goTo = (screen: string, params?: any) => navigation.navigate(screen, params);

  // Skeleton loader
  const Skeleton = ({ height = 24, width = 200, style = {} }) => (
    <Box style={{ backgroundColor: currentTheme.colors.border, borderRadius: 8, height, width, ...style, marginBottom: 8 }} />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: currentTheme.spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="lg" style={{ width: '100%' }}>
          {/* Animated Gradient Header */}
          <Animated.View style={{
            borderRadius: currentTheme.borderRadius.card,
            overflow: 'hidden',
            marginBottom: currentTheme.spacing.lg,
            transform: [{ scale: 1 }],
          }}>
            <LinearGradient
              colors={gradientColors as any}
              start={gradientStart}
              end={gradientEnd}
              style={{ padding: currentTheme.spacing.lg, alignItems: 'center', justifyContent: 'center' }}
            >
              <HStack space="md" style={{ alignItems: 'center', marginBottom: 8 }}>
                <MaterialCommunityIcons 
                  name={isLandlord ? "account-tie" : "school"} 
                  size={32} 
                  color="white" 
                />
                <Text
                  size="3xl"
                  style={{
                    fontFamily: currentTheme.typography.fontFamily,
                    fontWeight: '700',
                    color: 'white',
                    textAlign: 'center',
                  }}
                  accessible
                  accessibilityRole="header"
                  accessibilityLabel="Dashboard Home"
                  allowFontScaling
                >
                  {user?.firstName ? `Welcome, ${user.firstName}!` : 'Welcome!'}
                </Text>
              </HStack>
              <Text
                size="md"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: 'rgba(255, 255, 255, 0.9)',
                  textAlign: 'center',
                }}
                allowFontScaling
              >
                {isLandlord
                  ? 'Manage your properties and connect with quality tenants.'
                  : 'Find your perfect home and connect with roommates.'}
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Quick Actions */}
          <HStack space="md" style={{ justifyContent: 'center' }}>
            <Button
              action="primary"
              size="md"
              style={{ borderRadius: currentTheme.borderRadius.button }}
              onPress={() => goTo(isLandlord ? 'PropertyCreate' : 'PropertyDetails')}
            >
              <ButtonText size="md">{isLandlord ? 'List Property' : 'Find Properties'}</ButtonText>
            </Button>
            <Button
              action="secondary"
              size="md"
              variant="outline"
              style={{ borderRadius: currentTheme.borderRadius.button }}
              onPress={() => goTo(isLandlord ? 'Bookings' : 'RoommateMatching')}
            >
              <ButtonText size="md">{isLandlord ? 'Manage Bookings' : 'Find Roommates'}</ButtonText>
            </Button>
          </HStack>

          <Divider style={{ marginVertical: currentTheme.spacing.lg }} />

          {/* Landlord-specific dashboard sections */}
          {isLandlord && (
            <>
              {/* Property Performance Overview */}
              <VStack space="md">
                <HStack space="md" style={{ justifyContent: 'space-between' }}>
                  <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, flex: 1 }}>
                    Property Performance
                  </Text>
                </HStack>
                
                <HStack space="md">
                  {/* Total Properties */}
                  <Card style={{ flex: 1, padding: currentTheme.spacing.md, alignItems: 'center', backgroundColor: '#EEF2FF' }}>
                    <MaterialCommunityIcons name="home-city" size={32} color="#2563EB" />
                    <Text size="2xl" style={{ fontWeight: '700', color: '#2563EB', marginTop: 8 }}>
                      {properties.length}
                    </Text>
                    <Text size="sm" style={{ color: currentTheme.colors.text.secondary, textAlign: 'center' }}>
                      Properties
                    </Text>
                  </Card>
                  
                  {/* Active Bookings */}
                  <Card style={{ flex: 1, padding: currentTheme.spacing.md, alignItems: 'center', backgroundColor: '#F0FDF4' }}>
                    <MaterialCommunityIcons name="calendar-check" size={32} color="#16A34A" />
                    <Text size="2xl" style={{ fontWeight: '700', color: '#16A34A', marginTop: 8 }}>
                      {bookings.filter(b => b.status === 'Confirmed').length}
                    </Text>
                    <Text size="sm" style={{ color: currentTheme.colors.text.secondary, textAlign: 'center' }}>
                      Active Bookings
                    </Text>
                  </Card>
                  
                  {/* Pending Requests */}
                  <Card style={{ flex: 1, padding: currentTheme.spacing.md, alignItems: 'center', backgroundColor: '#FEF3C7' }}>
                    <MaterialCommunityIcons name="clock-outline" size={32} color="#D97706" />
                    <Text size="2xl" style={{ fontWeight: '700', color: '#D97706', marginTop: 8 }}>
                      {bookings.filter(b => b.status === 'Pending').length}
                    </Text>
                    <Text size="sm" style={{ color: currentTheme.colors.text.secondary, textAlign: 'center' }}>
                      Pending Requests
                    </Text>
                  </Card>
                </HStack>
              </VStack>

              <Divider style={{ marginVertical: currentTheme.spacing.lg }} />

              {/* Your Properties */}
              <VStack space="md">
                <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>
                    Your Properties
                  </Text>
                  <Button
                    action="primary"
                    size="sm"
                    onPress={() => goTo('PropertyCreate')}
                  >
                    <ButtonText>Add Property</ButtonText>
                  </Button>
                </HStack>
                
                <Card style={{ padding: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.card }}>
                  {loading ? (
                    <>
                      <Skeleton height={28} width={200} />
                      <Skeleton height={20} width={150} />
                    </>
                  ) : properties.length > 0 ? (
                    properties.slice(0, 3).map((property, idx) => {
                      const imageUrl = property.images && property.images[0] ? { uri: property.images[0] } : require('@/assets/images/placeholder.jpg');
                      const bookingCount = bookings.filter(b => b.propertyId === property._id).length;
                      return (
                        <Pressable
                          key={property._id}
                          style={{ 
                            marginBottom: currentTheme.spacing.sm, 
                            padding: 12, 
                            borderRadius: 12, 
                            backgroundColor: currentTheme.colors.input, 
                            elevation: 2,
                            borderLeftWidth: 4,
                            borderLeftColor: property.status === 'available' ? '#16A34A' : '#D97706'
                          }}
                          onPress={() => navigation.navigate(isLandlord ? 'Properties' : 'PropertySearch', { screen: 'PropertyDetails', params: { id: property._id } })}
                        >
                          <HStack space="md" style={{ alignItems: 'center' }}>
                            <Box style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', backgroundColor: currentTheme.colors.card }}>
                              <CustomImage
                                source={imageUrl}
                                alt="property image"
                                style={{ width: '100%', height: '100%' }}
                              />
                            </Box>
                            <VStack space="xs" style={{ flex: 1 }}>
                              <Text size="md" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>
                                {property.title}
                              </Text>
                              <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
                                {property.address || property.location?.address}
                              </Text>
                              <HStack space="md">
                                <Text size="sm" style={{ color: currentTheme.colors.primary, fontWeight: '600' }}>
                                  ${property.price}/month
                                </Text>
                                <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
                                  {bookingCount} bookings
                                </Text>
                              </HStack>
                            </VStack>
                            <VStack style={{ alignItems: 'center' }}>
                              <MaterialCommunityIcons 
                                name={property.status === 'available' ? 'check-circle' : 'clock-outline'} 
                                size={20} 
                                color={property.status === 'available' ? '#16A34A' : '#D97706'} 
                              />
                              <Text size="xs" style={{ color: currentTheme.colors.text.secondary, textTransform: 'capitalize' }}>
                                {property.status || 'available'}
                              </Text>
                            </VStack>
                          </HStack>
                        </Pressable>
                      );
                    })
                  ) : (
                    <VStack space="md" style={{ alignItems: 'center', paddingVertical: 32 }}>
                      <MaterialCommunityIcons name="home-plus" size={48} color={currentTheme.colors.text.secondary} />
                      <Text size="md" style={{ color: currentTheme.colors.text.secondary, textAlign: 'center' }}>
                        No properties listed yet.
                      </Text>
                      <Button
                        action="primary"
                        size="md"
                        onPress={() => goTo('PropertyCreate')}
                      >
                        <ButtonText>List Your First Property</ButtonText>
                      </Button>
                    </VStack>
                  )}
                </Card>
              </VStack>

              <Divider style={{ marginVertical: currentTheme.spacing.lg }} />
            </>
          )}

          {/* Student-specific sections */}
          {!isLandlord && (
            <>
              {/* AI Recommendations */}
              <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
                AI Recommendations
              </Text>
              <Button
                action="primary"
                size="sm"
                style={{ alignSelf: 'flex-end', marginBottom: currentTheme.spacing.sm }}
                onPress={fetchRecommendations}
                disabled={recommendationsLoading}
              >
                <ButtonText>{recommendationsLoading ? 'Generating...' : 'Regenerate Recommendations'}</ButtonText>
              </Button>
              <Card style={{ padding: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.card }}>
                {recommendationsLoading ? (
                  <>
                    <Skeleton height={28} width={200} />
                    <Skeleton height={20} width={150} />
                  </>
                ) : recommendations.length > 0 ? (
                  recommendations.map((rec, idx) => (
                    <Pressable
                      key={rec.id || idx}
                      style={{ marginBottom: currentTheme.spacing.sm, padding: 8, borderRadius: 8, backgroundColor: currentTheme.colors.input, elevation: 2 }}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel={`View recommendation ${idx + 1}`}
                      onPress={() => goTo('PropertyDetails', { id: rec.id })}
                    >
                      <Box>
                        <Text size="md" style={{ color: currentTheme.colors.text.primary, fontWeight: '600' }}>{rec.title || rec.name || 'Recommended'}</Text>
                        <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>{rec.description || rec.summary || ''}</Text>
                      </Box>
                    </Pressable>
                  ))
                ) : (
                  <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>
                    No recommendations yet. Tap &apos;Regenerate Recommendations&apos; to get suggestions.
                  </Text>
                )}
              </Card>
              <Button
                action="secondary"
                size="sm"
                style={{ alignSelf: 'flex-end', marginTop: currentTheme.spacing.xs, marginBottom: currentTheme.spacing.md }}
                onPress={() => navigation.navigate('PropertySearch', { screen: 'PropertyRecommendations' })}
              >
                <ButtonText>See All Recommendations</ButtonText>
              </Button>

              {/* Recent Matches */}
              <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginTop: currentTheme.spacing.lg, marginBottom: currentTheme.spacing.sm }}>
                Recent Matches
              </Text>
              <Card style={{ padding: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.card }}>
                {loading ? (
                  <>
                    <Skeleton height={24} width={175} />
                    <Skeleton height={18} width={125} />
                  </>
                ) : matches.length > 0 ? (
                  matches.map((match, idx) => {
                    const property = match.targetId || {};
                    const imageUrl = property.images && property.images[0] ? { uri: property.images[0] } : require('@/assets/images/placeholder.jpg');
                    const matchFactors = match.matchFactors ? Object.entries(match.matchFactors).map(([k, v]) => `${k}: ${v}`) : [];
                    return (
                      <Pressable
                        key={match._id}
                        style={{ marginBottom: currentTheme.spacing.sm, padding: 8, borderRadius: 8, backgroundColor: currentTheme.colors.input, elevation: 2 }}
                        accessible
                        accessibilityRole="button"
                        accessibilityLabel={`View match ${idx + 1}`}
                        onPress={() => goTo('MatchDetails', { id: match._id })}
                      >
                        <HStack space="md" style={{ alignItems: 'center' }}>
                          <Box style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', backgroundColor: currentTheme.colors.card, marginRight: currentTheme.spacing.md }}>
                            <CustomImage
                              source={imageUrl}
                              alt="property image"
                              style={{ width: '100%', height: '100%' }}
                            />
                          </Box>
                          <VStack space="xs" style={{ flex: 1 }}>
                            <Text size="md" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>{property.title}</Text>
                            <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>{property.address || ''}</Text>
                            <Text size="sm" style={{ color: currentTheme.colors.primary, fontWeight: '600' }}>Score: {(match.compatibilityScore * 100).toFixed(0)}%</Text>
                            {matchFactors.length > 0 && (
                              <Text size="xs" style={{ color: currentTheme.colors.text.secondary }}>
                                Factors: {matchFactors.join(', ')}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </Pressable>
                    );
                  })
                ) : (
                  <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>
                    No recent matches yet.
                  </Text>
                )}
              </Card>
            </>
          )}

          {/* Shared: Recent Bookings */}
          <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginTop: currentTheme.spacing.lg, marginBottom: currentTheme.spacing.sm }}>
            {isLandlord ? 'Recent Bookings' : 'Your Bookings'}
          </Text>
          <Card style={{ padding: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.card }}>
            {loading ? (
              <>
                <Skeleton height={24} width={175} />
                <Skeleton height={18} width={125} />
              </>
            ) : bookings.length > 0 ? (
              bookings.slice(0, 3).map((booking, idx) => {
                // For landlord, booking._id is the id, propertyId is populated property, studentId is populated student
                const property = booking.propertyId || {};
                const student = booking.studentId || {};
                return (
                  <Pressable
                    key={booking._id || idx}
                    style={{ marginBottom: currentTheme.spacing.sm, padding: 8, borderRadius: 8, backgroundColor: currentTheme.colors.input, elevation: 2 }}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`View booking ${idx + 1}`}
                    onPress={() => navigation.navigate('Bookings', { screen: 'BookingDetails', params: { id: booking._id } })}
                  >
                    <Box>
                      <Text size="md" style={{ color: currentTheme.colors.text.primary, fontWeight: '600' }}>{property.title || 'Booking'}</Text>
                      <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
                        Status: {booking.status || ''} | Tenant: {student.firstName ? `${student.firstName} ${student.lastName}` : ''}
                      </Text>
                      <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
                        {`From: ${booking.startDate ? new Date(booking.startDate).toLocaleDateString() : ''} To: ${booking.endDate ? new Date(booking.endDate).toLocaleDateString() : ''}`}
                      </Text>
                    </Box>
                  </Pressable>
                );
              })
            ) : (
              <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>
                No active bookings yet.
              </Text>
            )}
          </Card>

          {/* Notifications */}
          <Text size="xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginTop: currentTheme.spacing.lg, marginBottom: currentTheme.spacing.sm }}>
            Notifications
          </Text>
          <Card style={{ padding: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.card }}>
            {loading ? (
              <>
                <Skeleton height={20} width={200} />
                <Skeleton height={16} width={150} />
              </>
            ) : notifications.length > 0 ? (
              notifications.map((notif, idx) => (
                <Pressable
                  key={notif.id || idx}
                  style={{ marginBottom: currentTheme.spacing.sm, padding: 8, borderRadius: 8, backgroundColor: currentTheme.colors.input, elevation: 2 }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`View notification ${idx + 1}`}
                  onPress={() => goTo('Notifications')}
                >
                  <Box>
                    <Text size="md" style={{ color: currentTheme.colors.text.primary, fontWeight: '600' }}>{notif.title || 'Notification'}</Text>
                    <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>{notif.body || notif.message || ''}</Text>
                  </Box>
                </Pressable>
              ))
            ) : (
              <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>
                No notifications yet.
              </Text>
            )}
          </Card>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}; 