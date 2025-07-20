import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
  SlideInRight,
} from 'react-native-reanimated';
import { useAuthActions } from '../../app/store/hooks';
import { loginUser } from '../../app/store/slices/authSlice';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onNavigateToForgotPassword,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, error, dispatch } = useAuthActions();

  // Handle login form submission
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      const result = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(result)) {
        onLoginSuccess();
      } else {
        Alert.alert('Login Failed', result.payload as string || 'Invalid email or password');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background elements */}
      <View className="absolute inset-0">
        <View className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full opacity-30 -mr-16 -mt-16" />
        <View className="absolute bottom-1/3 left-0 w-24 h-24 bg-blue-100 rounded-full opacity-30 -ml-12" />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Header */}
          <View className="px-6 pt-16">
            <Animated.Text 
              entering={FadeInUp.delay(400).duration(600)}
              className="text-3xl font-bold text-gray-800 mb-2"
            >
              Welcome Back!
            </Animated.Text>
            
            <Animated.Text 
              entering={FadeInUp.delay(600).duration(600)}
              className="text-lg text-gray-600 mb-8"
            >
              Sign in to continue your housing journey
            </Animated.Text>
          </View>

          {/* Login Form */}
          <View className="flex-1 px-6">
            <Animated.View 
              entering={SlideInRight.delay(800).duration(600)}
              className="space-y-6"
            >
              {/* Email Input */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-800 text-lg"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                />
              </View>

              {/* Password Input */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">Password</Text>
                <View className="relative">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 pr-12 text-gray-800 text-lg"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4"
                  >
                    <Text className="text-gray-500 text-lg">
                      {showPassword ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <View className="items-end">
                <TouchableOpacity onPress={onNavigateToForgotPassword}>
                  <Text className="text-purple-500 font-medium">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Error Message */}
              {error && (
                <Animated.View entering={FadeInUp.duration(300)}>
                  <Text className="text-red-500 text-center bg-red-50 py-3 px-4 rounded-xl">
                    {error}
                  </Text>
                </Animated.View>
              )}
            </Animated.View>
          </View>

          {/* Bottom Section */}
          <View className="px-6 pb-8 space-y-4">
            {/* Login Button */}
            <Animated.View entering={FadeInDown.delay(1000).duration(600)}>
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className={`bg-purple-500 rounded-2xl py-4 px-8 ${
                  isLoading ? 'opacity-70' : ''
                }`}
                style={{
                  shadowColor: '#6C63FF',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Text className="text-white text-lg font-bold text-center">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Sign Up Link */}
            <Animated.View 
              entering={FadeInDown.delay(1200).duration(600)}
              className="flex-row justify-center items-center"
            >
              <Text className="text-gray-600">Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={onNavigateToRegister}>
                <Text className="text-purple-500 font-bold">Sign Up</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <Animated.View 
              entering={FadeInDown.delay(1400).duration(600)}
              className="flex-row items-center my-6"
            >
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="px-4 text-gray-500">or</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </Animated.View>

            {/* Social Login */}
            <Animated.View 
              entering={FadeInDown.delay(1600).duration(600)}
              className="space-y-3"
            >
              <TouchableOpacity className="border border-gray-200 rounded-2xl py-4 px-8 flex-row items-center justify-center">
                <Text className="text-lg mr-2">🔍</Text>
                <Text className="text-gray-700 font-medium">Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity className="border border-gray-200 rounded-2xl py-4 px-8 flex-row items-center justify-center">
                <Text className="text-lg mr-2">📘</Text>
                <Text className="text-gray-700 font-medium">Continue with Facebook</Text>
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <TouchableOpacity className="border border-gray-200 rounded-2xl py-4 px-8 flex-row items-center justify-center bg-black">
                  <Text className="text-lg mr-2">🍎</Text>
                  <Text className="text-white font-medium">Continue with Apple</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
