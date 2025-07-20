import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthActions } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Modern iOS-style Profile Screen
 */
interface ProfileScreenProps {
  onLogout?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const auth = useAuthActions();
  const user = auth.user;
  const [activeSection, setActiveSection] = useState('profile');

  // Animation values
  const profileScale = useSharedValue(0.9);
  const cardsTranslateY = useSharedValue(30);

  React.useEffect(() => {
    // Animate elements on mount
    profileScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    cardsTranslateY.value = withSpring(0, { damping: 15, stiffness: 150 });
  }, []);

  // Animated styles
  const profileAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: profileScale.value }],
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardsTranslateY.value }],
  }));

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call the parent's logout handler if provided
              if (onLogout) {
                onLogout();
              } else {
                // Fallback to direct logout
                await auth.dispatch(logoutUser());
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  /**
   * Render profile header
   */
  const renderProfileHeader = () => (
    <Animated.View 
      style={profileAnimatedStyle}
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
        <View className="items-center">
          {/* Profile Image */}
          <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-4 backdrop-blur-xl border-4 border-white/30">
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <Text className="text-white text-3xl font-bold">
                {user?.firstName?.charAt(0) || 'U'}
              </Text>
            )}
          </View>

          {/* User Info */}
          <Text className="text-white text-2xl font-bold mb-1">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-white/80 mb-3">{user?.email}</Text>
          
          {/* Role Badge */}
          <View className="bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/30">
            <Text className="text-white font-semibold capitalize">
              {user?.role || 'User'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  /**
   * Render stats section
   */
  const renderStats = () => (
    <Animated.View 
      entering={FadeInUp.delay(200).duration(600)}
      className="px-6 mb-6"
    >
      <View className="flex-row space-x-4">
        {/* Properties Viewed */}
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
              <Text className="text-white text-2xl font-bold mb-1">24</Text>
              <Text className="text-white/90 text-xs font-medium">
                Properties Viewed
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Saved Properties */}
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
              <Text className="text-white text-2xl font-bold mb-1">8</Text>
              <Text className="text-white/90 text-xs font-medium">
                Saved Properties
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Active Bookings */}
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
              <Text className="text-white text-2xl font-bold mb-1">2</Text>
              <Text className="text-white/90 text-xs font-medium">
                Active Bookings
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Animated.View>
  );

  /**
   * Render menu section
   */
  const renderMenuSection = () => (
    <Animated.View 
      entering={FadeInUp.delay(400).duration(600)}
      className="px-6 mb-6"
    >
      <Text className="text-xl font-bold text-gray-800 mb-4">
        Account Settings
      </Text>
      
      <View className="space-y-3">
        {/* Personal Information */}
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
              <Text className="text-white text-lg">👤</Text>
            </LinearGradient>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-base">
                Personal Information
              </Text>
              <Text className="text-gray-500 text-sm">
                Update your profile details
              </Text>
            </View>
            <Text className="text-gray-400 text-lg">→</Text>
          </View>
        </TouchableOpacity>

        {/* Preferences */}
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
              <Text className="text-white text-lg">⚙️</Text>
            </LinearGradient>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-base">
                Preferences
              </Text>
              <Text className="text-gray-500 text-sm">
                Customize your experience
              </Text>
            </View>
            <Text className="text-gray-400 text-lg">→</Text>
          </View>
        </TouchableOpacity>

        {/* Notifications */}
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
              <Text className="text-white text-lg">🔔</Text>
            </LinearGradient>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-base">
                Notifications
              </Text>
              <Text className="text-gray-500 text-sm">
                Manage your alerts
              </Text>
            </View>
            <Text className="text-gray-400 text-lg">→</Text>
          </View>
        </TouchableOpacity>

        {/* Privacy & Security */}
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
              colors={['#a8edea', '#fed6e3']}
              className="w-12 h-12 rounded-xl items-center justify-center mr-4"
            >
              <Text className="text-white text-lg">🔒</Text>
            </LinearGradient>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-base">
                Privacy & Security
              </Text>
              <Text className="text-gray-500 text-sm">
                Manage your account security
              </Text>
            </View>
            <Text className="text-gray-400 text-lg">→</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  /**
   * Render support section
   */
  const renderSupportSection = () => (
    <Animated.View 
      entering={FadeInUp.delay(600).duration(600)}
      className="px-6 mb-6"
    >
      <Text className="text-xl font-bold text-gray-800 mb-4">
        Support & Help
      </Text>
      
      <View className="space-y-3">
        {/* Help Center */}
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
              <Text className="text-white text-lg">❓</Text>
            </LinearGradient>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-base">
                Help Center
              </Text>
              <Text className="text-gray-500 text-sm">
                Get help and support
              </Text>
            </View>
            <Text className="text-gray-400 text-lg">→</Text>
          </View>
        </TouchableOpacity>

        {/* Contact Support */}
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
              <Text className="text-white text-lg">💬</Text>
            </LinearGradient>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-base">
                Contact Support
              </Text>
              <Text className="text-gray-500 text-sm">
                Chat with our team
              </Text>
            </View>
            <Text className="text-gray-400 text-lg">→</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  /**
   * Render logout section
   */
  const renderLogoutSection = () => (
    <Animated.View 
      entering={FadeInUp.delay(800).duration(600)}
      className="px-6 mb-6"
    >
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-50 rounded-2xl p-4 border border-red-200"
        activeOpacity={0.8}
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-red-100 rounded-xl items-center justify-center mr-4">
            <Text className="text-red-600 text-lg">🚪</Text>
          </View>
          <View className="flex-1">
            <Text className="text-red-600 font-semibold text-base">
              Logout
            </Text>
            <Text className="text-red-500 text-sm">
              Sign out of your account
            </Text>
          </View>
          <Text className="text-red-400 text-lg">→</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-transparent">
          {renderProfileHeader()}
          {renderStats()}
        </View>

        {/* Content */}
        <Animated.View style={cardsAnimatedStyle}>
          {renderMenuSection()}
          {renderSupportSection()}
          {renderLogoutSection()}
        </Animated.View>

        {/* Bottom spacing for tab bar */}
        <View className="h-32" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen; 