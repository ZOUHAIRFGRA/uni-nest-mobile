import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

// Import screens
import { 
  AuthNavigator, 
  DashboardScreen,
  PropertyListScreen,
  AIMatchingScreen,
  FavoritesScreen,
  ProfileScreen
} from '../screens';

// Import hooks and thunks
import { useAuthActions, useDispatch } from '../store/hooks';
import { useAuthInitialization } from '../hooks/useAuthInitialization';
import { logoutUser } from '../store/slices/authSlice';
import { thunks } from '../store/appThunks';
import { SessionHandler } from '../utils/sessionHandler';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Modern Loading Screen with iOS-style design
 */
const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <LinearGradient
    colors={['#667eea', '#764ba2']}
    className="flex-1 justify-center items-center"
  >
    <SafeAreaView className="flex-1 justify-center items-center">
      <Animated.View 
        entering={FadeInDown.delay(200).duration(800)}
        className="items-center"
      >
        {/* Animated Logo */}
        <View className="w-20 h-20 bg-white/20 rounded-3xl items-center justify-center mb-8 backdrop-blur-xl">
          <Text className="text-4xl">🏠</Text>
        </View>
        
        {/* Loading Text */}
        <Animated.Text 
          entering={FadeInUp.delay(400).duration(600)}
          className="text-2xl font-bold text-white mb-3 text-center"
        >
          {message}
        </Animated.Text>
        
        {/* Subtitle */}
        <Animated.Text 
          entering={FadeInUp.delay(600).duration(600)}
          className="text-white/80 text-center px-8"
        >
          Preparing your perfect housing experience
        </Animated.Text>
        
        {/* Loading Dots */}
        <Animated.View 
          entering={FadeInUp.delay(800).duration(600)}
          className="flex-row mt-8 space-x-2"
        >
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.delay(800 + index * 100).duration(600)}
              className="w-3 h-3 bg-white/60 rounded-full"
            />
          ))}
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  </LinearGradient>
);

interface Tab {
  key: string;
  title: string;
  icon: string;
  gradient: string[];
}

const tabs: Tab[] = [
  { 
    key: 'dashboard', 
    title: 'Home', 
    icon: '🏠',
    gradient: ['#667eea', '#764ba2']
  },
  { 
    key: 'search', 
    title: 'Explore', 
    icon: '🔍',
    gradient: ['#f093fb', '#f5576c']
  },
  { 
    key: 'matching', 
    title: 'AI Match', 
    icon: '🤖',
    gradient: ['#4facfe', '#00f2fe']
  },
  { 
    key: 'favorites', 
    title: 'Saved', 
    icon: '❤️',
    gradient: ['#fa709a', '#fee140']
  },
  { 
    key: 'profile', 
    title: 'Profile', 
    icon: '👤',
    gradient: ['#a8edea', '#fed6e3']
  },
];

/**
 * Modern iOS-style Main App Navigator
 */
export const MainAppNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAppReady, setIsAppReady] = useState(false);
  const [hasLoadedUserData, setHasLoadedUserData] = useState(false);
  
  const auth = useAuthActions();
  const dispatch = useDispatch();
  const { isLoading: isAuthInitializing } = useAuthInitialization();

  // Animation values
  const tabBarTranslateY = useSharedValue(0);
  const activeTabIndex = tabs.findIndex(tab => tab.key === activeTab);

  /**
   * Load user-specific data after authentication
   */
  const loadUserData = useCallback(async () => {
    try {
      console.log('🔄 Loading user-specific data...');
      
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

      // Load user's matches
      const loadMatches = async () => {
        try {
          await dispatch(thunks.matches.fetchMatches());
          console.log('✅ Matches loaded');
        } catch (error: any) {
          if (SessionHandler.isSessionExpired(error)) {
            console.log('🔐 Session expired during matches load - user will be redirected');
            return; // Session expiration handled in thunk
          }
          console.warn('⚠️ Failed to load matches:', error);
        }
      };

      // Load recent properties for dashboard
      const loadRecentProperties = async () => {
        try {
          await dispatch(thunks.properties.fetchRecentProperties());
          console.log('✅ Recent properties loaded');
        } catch (error: any) {
          if (SessionHandler.isSessionExpired(error)) {
            console.log('🔐 Session expired during properties load - user will be redirected');
            return; // Session expiration handled in thunk
          }
          console.warn('⚠️ Failed to load recent properties:', error);
        }
      };

      // Load all data in parallel
      await Promise.allSettled([
        loadBookings(),
        loadNotifications(),
        loadMatches(),
        loadRecentProperties()
      ]);

      console.log('✅ All user data loaded successfully');
      setHasLoadedUserData(true);
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
            console.log('👤 User authenticated:', auth.user.email);
            
            // Only load user data if we haven't loaded it yet
            if (!hasLoadedUserData) {
              await loadUserData();
            }
          } else {
            console.log('🔐 User not authenticated, showing auth flow');
            setHasLoadedUserData(false); // Reset when user logs out
          }
          setIsAppReady(true);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsAppReady(true);
      }
    };

    initializeApp();
  }, [auth.isAuthenticated, auth.user, isAuthInitializing, hasLoadedUserData, loadUserData]);

  const handleAuthSuccess = async () => {
    console.log('🎉 Authentication successful, loading user data...');
    setIsAppReady(true);
    // Load user data after successful authentication
    if (auth.isAuthenticated && auth.user) {
      await loadUserData();
    }
  };

  /**
   * Refresh user data - can be called from any screen
   */
  const refreshUserData = useCallback(async () => {
    if (auth.isAuthenticated && auth.user) {
      console.log('🔄 Refreshing user data...');
      await loadUserData();
    }
  }, [auth.isAuthenticated, auth.user, loadUserData]);

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out user...');
      await auth.dispatch(logoutUser());
      console.log('✅ User logged out successfully');
      
      // Reset app state
      setActiveTab('dashboard');
      setIsAppReady(false);
      setHasLoadedUserData(false);
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  /**
   * Handle tab press with animation
   */
  const handleTabPress = (tabKey: string) => {
    setActiveTab(tabKey);
    tabBarTranslateY.value = withSpring(-10, { damping: 15, stiffness: 150 });
    setTimeout(() => {
      tabBarTranslateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    }, 100);
  };

  /**
   * Render the current active screen
   */
  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'search':
        return <PropertyListScreen />;
      case 'matching':
        return <AIMatchingScreen />;
      case 'favorites':
        return <FavoritesScreen />;
      case 'profile':
        return <ProfileScreen onLogout={handleLogout} />;
      default:
        return <DashboardScreen />;
    }
  };

  // Animated tab bar style
  const tabBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: tabBarTranslateY.value }],
    };
  });

  // Show loading while auth is initializing
  if (isAuthInitializing) {
    return <LoadingScreen message="Restoring your session..." />;
  }

  // Show loading while app is preparing
  if (!isAppReady) {
    return <LoadingScreen message="Preparing your experience..." />;
  }

  // Show auth flow if user is not authenticated
  if (!auth.isAuthenticated) {
    return <AuthNavigator onAuthSuccess={handleAuthSuccess} />;
  }

  // Show loading while user data is being loaded
  if (!hasLoadedUserData) {
    return <LoadingScreen message="Loading your data..." />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />
      
      {/* Main Content */}
      <View className="flex-1">
        {renderScreen()}
      </View>

      {/* Modern iOS-style Bottom Tab Navigation */}
      <Animated.View 
        style={tabBarAnimatedStyle}
        className="absolute bottom-0 left-0 right-0"
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.98)']}
          className="px-6 py-4 backdrop-blur-xl"
        >
          {/* Glassmorphism effect */}
          <View className="bg-white/70 rounded-3xl p-2 backdrop-blur-xl border border-white/20 shadow-2xl">
            <View className="flex-row">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab.key;
                const isActiveIndex = index === activeTabIndex;
                
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => handleTabPress(tab.key)}
                    className="flex-1 items-center py-3 relative"
                    activeOpacity={0.7}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <Animated.View
                        entering={FadeIn.duration(300)}
                        className="absolute inset-0 bg-white rounded-2xl shadow-lg"
                        style={{
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 8,
                          elevation: 5,
                        }}
                      />
                    )}
                    
                    {/* Tab content */}
                    <View className={`items-center ${isActive ? 'z-10' : ''}`}>
                      {/* Icon with gradient background for active state */}
                      <View className={`w-10 h-10 rounded-2xl items-center justify-center mb-1 ${
                        isActive ? 'bg-gradient-to-br' : ''
                      }`}>
                        {isActive ? (
                          <LinearGradient
                            colors={tab.gradient}
                            className="w-10 h-10 rounded-2xl items-center justify-center"
                          >
                            <Text className="text-lg">{tab.icon}</Text>
                          </LinearGradient>
                        ) : (
                          <Text className="text-xl opacity-60">{tab.icon}</Text>
                        )}
                      </View>
                      
                      {/* Tab title */}
                      <Text
                        className={`text-xs font-semibold ${
                          isActive 
                            ? 'text-gray-800' 
                            : 'text-gray-500'
                        }`}
                      >
                        {tab.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

export default MainAppNavigator;
