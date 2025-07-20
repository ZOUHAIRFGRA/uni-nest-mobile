import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthActions, useDispatch, useSelector } from '../../store/hooks';
import { thunks } from '../../store/appThunks';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Modern iOS-style Dashboard Screen
 */
export const DashboardScreen: React.FC = () => {
  const auth = useAuthActions();
  const dispatch = useDispatch();
  const user = auth.user;
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const greetingScale = useSharedValue(0.8);
  const statsOpacity = useSharedValue(0);
  const cardsTranslateY = useSharedValue(50);

  // Get data from Redux store
  const properties = useSelector((state: any) => state.properties.properties || []);
  const bookings = useSelector((state: any) => state.bookings.bookings || []);
  const notifications = useSelector((state: any) => state.notifications.notifications || []);

  useEffect(() => {
    // Animate elements on mount
    greetingScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    statsOpacity.value = withTiming(1, { duration: 800 });
    cardsTranslateY.value = withSpring(0, { damping: 15, stiffness: 150 });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(thunks.properties.fetchRecentProperties()),
        dispatch(thunks.bookings.fetchBookings()),
        dispatch(thunks.notifications.fetchNotifications()),
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Animated styles
  const greetingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: greetingScale.value }],
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardsTranslateY.value }],
  }));

  /**
   * Render greeting section
   */
  const renderGreeting = () => (
    <Animated.View 
      style={greetingAnimatedStyle}
      className="px-6 pt-4 pb-6"
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        className="rounded-3xl p-6 shadow-2xl"
        style={{
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white/80 text-sm font-medium mb-1">
              Welcome back,
            </Text>
            <Text className="text-white text-2xl font-bold mb-2">
              {user?.firstName || 'Student'}! 👋
            </Text>
            <Text className="text-white/90 text-sm">
              Ready to find your perfect home?
            </Text>
          </View>
          <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center backdrop-blur-xl">
            <Text className="text-2xl">🏠</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  /**
   * Render stats cards
   */
  const renderStats = () => (
    <Animated.View 
      style={statsAnimatedStyle}
      className="px-6 mb-6"
    >
      <View className="flex-row space-x-4">
        {/* Properties Card */}
        <View className="flex-1">
          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            className="rounded-2xl p-4 shadow-lg"
            style={{
              shadowColor: '#f093fb',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View className="items-center">
              <Text className="text-white text-2xl font-bold mb-1">
                {properties.length}
              </Text>
              <Text className="text-white/90 text-xs font-medium">
                Properties
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Bookings Card */}
        <View className="flex-1">
          <LinearGradient
            colors={['#4facfe', '#00f2fe']}
            className="rounded-2xl p-4 shadow-lg"
            style={{
              shadowColor: '#4facfe',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View className="items-center">
              <Text className="text-white text-2xl font-bold mb-1">
                {bookings.length}
              </Text>
              <Text className="text-white/90 text-xs font-medium">
                Bookings
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Notifications Card */}
        <View className="flex-1">
          <LinearGradient
            colors={['#fa709a', '#fee140']}
            className="rounded-2xl p-4 shadow-lg"
            style={{
              shadowColor: '#fa709a',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View className="items-center">
              <Text className="text-white text-2xl font-bold mb-1">
                {notifications.length}
              </Text>
              <Text className="text-white/90 text-xs font-medium">
                Alerts
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Animated.View>
  );

  /**
   * Render quick actions
   */
  const renderQuickActions = () => (
    <Animated.View 
      entering={FadeInUp.delay(200).duration(600)}
      className="px-6 mb-6"
    >
      <Text className="text-xl font-bold text-gray-800 mb-4">
        Quick Actions
      </Text>
      
      <View className="space-y-3">
        {/* Search Properties */}
        <TouchableOpacity 
          className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
          activeOpacity={0.8}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center">
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              className="w-12 h-12 rounded-xl items-center justify-center mr-4"
            >
              <Text className="text-white text-lg">🔍</Text>
            </LinearGradient>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-base">
                Search Properties
              </Text>
              <Text className="text-gray-500 text-sm">
                Find your perfect home
              </Text>
            </View>
            <Text className="text-gray-400 text-lg">→</Text>
          </View>
        </TouchableOpacity>

        {/* AI Matching */}
        <TouchableOpacity 
          className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
          activeOpacity={0.8}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center">
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              className="w-12 h-12 rounded-xl items-center justify-center mr-4"
            >
              <Text className="text-white text-lg">🤖</Text>
            </LinearGradient>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-base">
                AI Matching
              </Text>
              <Text className="text-gray-500 text-sm">
                Get personalized recommendations
              </Text>
            </View>
            <Text className="text-gray-400 text-lg">→</Text>
          </View>
        </TouchableOpacity>

        {/* View Bookings */}
        <TouchableOpacity 
          className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
          activeOpacity={0.8}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center">
            <LinearGradient
              colors={['#fa709a', '#fee140']}
              className="w-12 h-12 rounded-xl items-center justify-center mr-4"
            >
              <Text className="text-white text-lg">📅</Text>
            </LinearGradient>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-base">
                My Bookings
              </Text>
              <Text className="text-gray-500 text-sm">
                Check your reservations
              </Text>
            </View>
            <Text className="text-gray-400 text-lg">→</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  /**
   * Render recent properties
   */
  const renderRecentProperties = () => (
    <Animated.View 
      entering={FadeInUp.delay(400).duration(600)}
      className="px-6 mb-6"
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-gray-800">
          Recent Properties
        </Text>
        <TouchableOpacity>
          <Text className="text-purple-600 font-semibold">See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
        className="space-x-4"
      >
        {properties.slice(0, 5).map((property: any, index: number) => (
          <Animated.View
            key={property._id}
            entering={FadeInRight.delay(500 + index * 100).duration(600)}
            className="w-64"
          >
            <TouchableOpacity 
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              activeOpacity={0.8}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              {/* Property Image */}
              <View className="w-full h-32 bg-gray-200 relative">
                {property.images && property.images[0] ? (
                  <Image
                    source={{ uri: property.images[0] }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 items-center justify-center">
                    <Text className="text-gray-500 text-2xl">🏠</Text>
                  </View>
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.3)']}
                  className="absolute bottom-0 left-0 right-0 h-16"
                />
              </View>

              {/* Property Info */}
              <View className="p-4">
                <Text className="text-gray-800 font-bold text-base mb-1" numberOfLines={1}>
                  {property.title}
                </Text>
                <Text className="text-gray-500 text-sm mb-2" numberOfLines={1}>
                  {property.address}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-purple-600 font-bold text-lg">
                    ${property.price}/mo
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-gray-400 text-xs mr-1">⭐</Text>
                    <Text className="text-gray-600 text-xs">4.8</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#667eea"
            colors={['#667eea']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-transparent">
          {renderGreeting()}
          {renderStats()}
        </View>

        {/* Content */}
        <Animated.View style={cardsAnimatedStyle}>
          {renderQuickActions()}
          {renderRecentProperties()}
        </Animated.View>

        {/* Bottom spacing for tab bar */}
        <View className="h-32" />
      </ScrollView>
    </SafeAreaView>
  );
};
