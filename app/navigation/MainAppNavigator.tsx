import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Import screens
import { 
  AuthNavigator, 
  DashboardScreen,
  PropertySearchScreen,
  AIMatchingScreen,
  FavoritesScreen
} from '../screens';

// Import hooks and thunks
import { useAuthActions, useDispatch } from '../store/hooks';
import { useAuthInitialization } from '../hooks/useAuthInitialization';
import { logoutUser } from '../store/slices/authSlice';
import { thunks } from '../store/appThunks';
import { SessionHandler } from '../utils/sessionHandler';

/**
 * Simple Loading Screen Component
 */
const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <SafeAreaView className="flex-1 bg-white justify-center items-center">
    <Text className="text-4xl mb-4">⏳</Text>
    <Text className="text-xl font-bold text-gray-800 mb-2">{message}</Text>
    <Text className="text-gray-600">Please wait a moment</Text>
  </SafeAreaView>
);

interface Tab {
  key: string;
  title: string;
  icon: string;
}

const tabs: Tab[] = [
  { key: 'dashboard', title: 'Home', icon: '🏠' },
  { key: 'search', title: 'Search', icon: '🔍' },
  { key: 'matching', title: 'AI Match', icon: '🤖' },
  { key: 'favorites', title: 'Favorites', icon: '❤️' },
  { key: 'profile', title: 'Profile', icon: '👤' },
];

/**
 * Main App Navigator - Handles authenticated user navigation
 * Features: Bottom tab navigation, authentication state management
 */
export const MainAppNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAppReady, setIsAppReady] = useState(false);
  
  const auth = useAuthActions();
  const dispatch = useDispatch();
  const { isLoading: isAuthInitializing } = useAuthInitialization();

  /**
   * Load user-specific data after authentication
   */
  const loadUserData = useCallback(async () => {
    try {
      console.log('Loading user-specific data...');
      
      // Initialize session handler for this context
      SessionHandler.initialize(dispatch);
      
      // Load user's bookings
      const loadBookings = async () => {
        try {
          await dispatch(thunks.bookings.fetchBookings());
          console.log('✅ Bookings loaded');
        } catch (error: any) {
          if (SessionHandler.isSessionExpired(error)) {
            console.log('🔐 Session expired during bookings load - user will be redirected');
            return; // Session expiration handled in thunk
          }
          console.warn('⚠️ Failed to load bookings:', error);
        }
      };

      // Load user's chats
      const loadChats = async () => {
        try {
          await dispatch(thunks.chats.fetchChats());
          console.log('✅ Chats loaded');
        } catch (error: any) {
          if (SessionHandler.isSessionExpired(error)) {
            console.log('🔐 Session expired during chats load - user will be redirected');
            return; // Session expiration handled in thunk
          }
          console.warn('⚠️ Failed to load chats:', error);
        }
      };

      // Load user's notifications
      const loadNotifications = async () => {
        try {
          await dispatch(thunks.notifications.fetchNotifications());
          console.log('✅ Notifications loaded');
        } catch (error: any) {
          if (SessionHandler.isSessionExpired(error)) {
            console.log('🔐 Session expired during notifications load - user will be redirected');
            return; // Session expiration handled in thunk
          }
          console.warn('⚠️ Failed to load notifications:', error);
        }
      };

      // Load user's matches (AI-powered)
      const loadMatches = async () => {
        try {
          await dispatch(thunks.matches.fetchMatches('all'));
          console.log('✅ AI Matches loaded');
        } catch (error: any) {
          if (SessionHandler.isSessionExpired(error)) {
            console.log('🔐 Session expired during matches load - user will be redirected');
            return; // Session expiration handled in thunk
          }
          console.warn('⚠️ Failed to load matches:', error);
        }
      };

      // Load recent properties (for dashboard)
      const loadRecentProperties = async () => {
        try {
          await dispatch(thunks.properties.fetchProperties({ page: 1, limit: 10 }));
          console.log('✅ Recent properties loaded');
        } catch (error: any) {
          if (SessionHandler.isSessionExpired(error)) {
            console.log('🔐 Session expired during properties load - user will be redirected');
            return; // Session expiration handled in thunk
          }
          console.warn('⚠️ Failed to load recent properties:', error);
        }
      };

      // Execute all data loading operations in parallel for better performance
      await Promise.allSettled([
        loadBookings(),
        loadChats(),
        loadNotifications(),
        loadMatches(),
        loadRecentProperties()
      ]);

      console.log('🎉 User data loading completed');
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      // If there's a general error, also check for session expiration
      if (SessionHandler.isSessionExpired(error)) {
        console.log('🔐 General session expiration detected during data loading');
        await SessionHandler.handleSessionExpiration(error);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    // Initialize app data after auth state is loaded
    const initializeApp = async () => {
      try {
        if (!isAuthInitializing) {
          if (auth.isAuthenticated && auth.user) {
            console.log('User authenticated:', auth.user.email);
            
            // Load user-specific data
            await loadUserData();
          } else {
            console.log('User not authenticated, showing auth flow');
          }
          setIsAppReady(true);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsAppReady(true);
      }
    };

    initializeApp();
  }, [auth.isAuthenticated, auth.user, isAuthInitializing, loadUserData]);

  const handleAuthSuccess = () => {
    setIsAppReady(true);
  };

  /**
   * Refresh user data - can be called from any screen
   * Available for pull-to-refresh functionality in child components
   */
  const refreshUserData = useCallback(async () => {
    if (auth.isAuthenticated && auth.user) {
      console.log('🔄 Refreshing user data...');
      await loadUserData();
    }
  }, [auth.isAuthenticated, auth.user, loadUserData]);

  // Expose refreshUserData to child components via context or props
  // This could be used for pull-to-refresh functionality

  const handleLogout = async () => {
    try {
      console.log('Logging out user...');
      await auth.dispatch(logoutUser());
      console.log('User logged out successfully');
      
      // Reset app state
      setActiveTab('dashboard');
      setIsAppReady(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Render the current active screen
   */
  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'search':
        return <PropertySearchScreen />;
      case 'matching':
        return <AIMatchingScreen />;
      case 'favorites':
        return <FavoritesScreen />;
      case 'profile':
        return (
          <View className="flex-1 justify-center items-center bg-gray-50">
            <Text className="text-2xl font-bold text-gray-800 mb-4">Profile</Text>
            {auth.user && (
              <View className="bg-white p-6 rounded-xl mb-6 mx-6 shadow-sm">
                <Text className="text-lg font-semibold text-gray-800 mb-2">
                  Welcome, {auth.user.firstName} {auth.user.lastName}!
                </Text>
                <Text className="text-gray-600 mb-1">Email: {auth.user.email}</Text>
                {auth.user.phone && (
                  <Text className="text-gray-600 mb-1">Phone: {auth.user.phone}</Text>
                )}
                <Text className="text-gray-600 mb-1">Role: {auth.user.role}</Text>
                {auth.user.address && (
                  <Text className="text-gray-600 mb-1">Address: {auth.user.address}</Text>
                )}
                <Text className="text-gray-500 text-sm">
                  Member since {new Date(auth.user.createdAt || Date.now()).toLocaleDateString()}
                </Text>
              </View>
            )}
            <Text className="text-gray-600 text-center px-6 mb-8">
              Manage your profile, preferences, and account settings.
            </Text>
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Logout</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return <DashboardScreen />;
    }
  };

  if (isAuthInitializing) {
    return <LoadingScreen message="Restoring your session..." />;
  }

  if (!isAppReady) {
    return <LoadingScreen message="Preparing your experience..." />;
  }

  // Show auth flow if user is not authenticated
  if (!auth.isAuthenticated) {
    return <AuthNavigator onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="auto" />
      
      {/* Main Content */}
      <View className="flex-1">
        {renderScreen()}
      </View>

      {/* Bottom Tab Navigation */}
      <View className="bg-white border-t border-gray-200 px-4 py-2">
        <View className="flex-row">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 items-center py-3 rounded-xl mx-1 ${
                activeTab === tab.key
                  ? 'bg-purple-50'
                  : 'bg-transparent'
              }`}
            >
              <Text className="text-2xl mb-1">{tab.icon}</Text>
              <Text
                className={`text-xs font-medium ${
                  activeTab === tab.key
                    ? 'text-purple-600'
                    : 'text-gray-500'
                }`}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MainAppNavigator;
