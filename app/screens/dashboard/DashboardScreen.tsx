import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuthActions } from '../../store/hooks';

/**
 * Dashboard/Home screen - main entry point after authentication
 * Shows personalized content, recent activity, and quick actions
 */
export const DashboardScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    recentMatches: 0,
    savedProperties: 0,
    pendingBookings: 0,
    messages: 0,
  });
  
  const auth = useAuthActions();
  const user = auth.user;

  /**
   * Load dashboard data on component mount
   */
  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Load dashboard statistics and data
   */
  const loadDashboardData = async () => {
    try {
      // TODO: Implement actual API calls
      // For now, using mock data
      setDashboardData({
        recentMatches: 12,
        savedProperties: 5,
        pendingBookings: 2,
        messages: 8,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  /**
   * Handle refresh action
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  /**
   * Navigate to different sections
   */
  const navigateToSection = (section: string) => {
    Alert.alert('Navigation', `Navigate to ${section} (Not implemented yet)`);
  };

  /**
   * Render quick stats cards
   */
  const renderStatsCard = (title: string, value: number, icon: string, color: string, index: number) => (
    <Animated.View
      key={title}
      entering={FadeInUp.delay(index * 100).duration(600)}
      className="flex-1 mx-2"
    >
      <TouchableOpacity
        onPress={() => navigateToSection(title)}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        style={{
          shadowColor: color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="items-center">
          <View 
            className="w-12 h-12 rounded-full items-center justify-center mb-2"
            style={{ backgroundColor: `${color}20` }}
          >
            <Text className="text-2xl">{icon}</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-800">{value}</Text>
          <Text className="text-sm text-gray-600 text-center">{title}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  /**
   * Render quick action buttons
   */
  const renderActionButton = (title: string, subtitle: string, icon: string, color: string, index: number) => (
    <Animated.View
      key={title}
      entering={FadeInDown.delay(index * 100).duration(600)}
      className="mb-4"
    >
      <TouchableOpacity
        onPress={() => navigateToSection(title)}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center">
          <View 
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: `${color}20` }}
          >
            <Text className="text-xl">{icon}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">{title}</Text>
            <Text className="text-sm text-gray-600">{subtitle}</Text>
          </View>
          <Text className="text-gray-400 text-lg">→</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInUp.duration(800)}
          className="px-6 pt-6 pb-4"
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg text-gray-600">Welcome back,</Text>
              <Text className="text-2xl font-bold text-gray-800">
                {user?.firstName || 'Student'}!
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigateToSection('Profile')}
              className="w-12 h-12 bg-purple-500 rounded-full items-center justify-center"
            >
              <Text className="text-white text-lg font-bold">
                {user?.firstName?.charAt(0) || 'S'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Quick Stats */}
        <View className="px-6 mb-6">
          <Animated.Text 
            entering={FadeInUp.delay(200).duration(600)}
            className="text-lg font-semibold text-gray-800 mb-4"
          >
            Your Activity
          </Animated.Text>
          <View className="flex-row">
            {renderStatsCard('New Matches', dashboardData.recentMatches, '❤️', '#6C63FF', 0)}
            {renderStatsCard('Saved', dashboardData.savedProperties, '⭐', '#00C4B4', 1)}
            {renderStatsCard('Bookings', dashboardData.pendingBookings, '📋', '#FFD700', 2)}
            {renderStatsCard('Messages', dashboardData.messages, '💬', '#FF6B6B', 3)}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Animated.Text 
            entering={FadeInUp.delay(400).duration(600)}
            className="text-lg font-semibold text-gray-800 mb-4"
          >
            Quick Actions
          </Animated.Text>
          
          {user?.role === 'Student' ? (
            <>
              {renderActionButton(
                'Find Properties', 
                'Discover your perfect home', 
                '🏠', 
                '#6C63FF', 
                0
              )}
              {renderActionButton(
                'Find Roommates', 
                'Connect with compatible people', 
                '👥', 
                '#00C4B4', 
                1
              )}
              {renderActionButton(
                'My Bookings', 
                'View and manage bookings', 
                '📋', 
                '#FFD700', 
                2
              )}
            </>
          ) : (
            <>
              {renderActionButton(
                'My Properties', 
                'Manage your listings', 
                '🏢', 
                '#6C63FF', 
                0
              )}
              {renderActionButton(
                'Add Property', 
                'List a new property', 
                '➕', 
                '#00C4B4', 
                1
              )}
              {renderActionButton(
                'Bookings Management', 
                'Handle tenant requests', 
                '📋', 
                '#FFD700', 
                2
              )}
            </>
          )}
          
          {renderActionButton(
            'Messages', 
            'Chat with connections', 
            '💬', 
            '#FF6B6B', 
            3
          )}
        </View>

        {/* AI Recommendations Section */}
        <Animated.View 
          entering={FadeInDown.delay(600).duration(600)}
          className="px-6 mb-8"
        >
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            🤖 AI Recommendations
          </Text>
          <TouchableOpacity
            onPress={() => navigateToSection('AI Recommendations')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-6"
            style={{
              shadowColor: '#6C63FF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-lg font-bold mb-2">
                  New matches available!
                </Text>
                <Text className="text-white/90 text-sm">
                  We found {dashboardData.recentMatches} new properties and roommates that match your preferences.
                </Text>
              </View>
              <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center ml-4">
                <Text className="text-white text-lg">→</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;
