import React, { useState, useEffect, useRef } from 'react';
import { Animated, Easing, Platform, useColorScheme, TouchableOpacity, KeyboardAvoidingView, ScrollView, StyleSheet  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Center } from '../../components/ui/center';
import { Button, ButtonText } from '../../components/ui/button';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Input, InputField } from '../../components/ui/input';
import { Box } from '../../components/ui/box';
import { Link, LinkText } from '../../components/ui/link';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';
import { AlertCircle, Eye, EyeOff, Lock, X } from 'lucide-react-native';
import {  getTheme } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade-in for content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    // Subtle shimmer for header
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [fadeAnim, shimmerAnim]);

  // Button press animation
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Email validation
  const isValidEmail = (val: string) => /.+@.+\..+/.test(val);

  const handleLogin = async () => {
    setError(null);
    animateButton();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await authService.login({ email, password });
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
    setLoading(false);
    }
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 150],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: currentTheme.spacing.md }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Center style={{ marginVertical: currentTheme.spacing.lg }}>
            {/* Header with Gradient and Icon */}
            <LinearGradient
              colors={[`${currentTheme.colors.primary}B3`, `${currentTheme.colors.secondary}B3`]}
              style={{
                borderRadius: currentTheme.borderRadius.card,
                marginBottom: currentTheme.spacing.lg,
                alignItems: 'center',
                justifyContent: 'center',
                padding: currentTheme.spacing.lg,
                overflow: 'hidden',
                backgroundColor: currentTheme.colors.card,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Shimmer overlay */}
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    opacity: 0.12,
                    transform: [{ translateX: shimmerTranslate }],
                    backgroundColor: currentTheme.colors.background,
                    zIndex: currentTheme.zIndex.dropdown,
                    borderRadius: currentTheme.borderRadius.card,
                  },
                ]}
              />
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: currentTheme.borderRadius.round,
                  backgroundColor: `${currentTheme.colors.card}4D`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: currentTheme.spacing.md,
                  shadowColor: currentTheme.colors.text.primary,
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 8,
                }}
                accessible
                accessibilityRole="image"
                accessibilityLabel="Login Icon"
              >
                <Lock size={40} color={currentTheme.colors.text.primary} />
              </Box>
              <Text
                size="3xl"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  fontWeight: currentTheme.typography.weights.bold as import('react-native').TextStyle['fontWeight'],
                  color: currentTheme.colors.text.primary,
                  marginBottom: currentTheme.spacing.xs,
                }}
                accessible
                accessibilityRole="header"
                accessibilityLabel="Log in to Match & Settle"
                allowFontScaling
              >
                Welcome Back
              </Text>
              <Text
                size="md"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                  textAlign: 'center',
                  lineHeight: currentTheme.spacing.lg,
                }}
                allowFontScaling
              >
                Log in to find your perfect home or manage your properties
      </Text>
            </LinearGradient>
          </Center>
          <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
            <Box
              style={{
                backgroundColor: currentTheme.colors.card,
                borderRadius: currentTheme.borderRadius.card,
                ...currentTheme.shadows.medium,
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 6,
              }}
            >
              <VStack space="lg" style={{ width: '100%' }}>
                <Input
                  style={{
                    backgroundColor: currentTheme.colors.input,
                    borderRadius: currentTheme.borderRadius.input,
                    borderColor: currentTheme.colors.border,
                    borderWidth: 1,
                  }}
                  accessible
                  accessibilityLabel="Email Address"
                >
          <InputField
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Email"
                    placeholderTextColor={currentTheme.colors.placeholder}
                    style={{ fontFamily: currentTheme.typography.fontFamily }}
                    returnKeyType="next"
                    allowFontScaling
          />
        </Input>
                <Box style={{ position: 'relative' }}>
                  <Input
                    style={{
                      backgroundColor: currentTheme.colors.input,
                      borderRadius: currentTheme.borderRadius.input,
                      borderColor: currentTheme.colors.border,
                      borderWidth: 1,
                    }}
                    accessible
                    accessibilityLabel="Password"
                  >
          <InputField
            value={password}
            onChangeText={setPassword}
                      secureTextEntry={!showPassword}
            placeholder="Password"
                      placeholderTextColor={currentTheme.colors.placeholder}
                      style={{ fontFamily: currentTheme.typography.fontFamily }}
                      returnKeyType="done"
                      allowFontScaling
          />
        </Input>
                  <Box
                    style={{
                      position: 'absolute',
                      right: currentTheme.spacing.sm,
                      top: '50%',
                      transform: [{ translateY: -16 }],
                    }}
                  >
                    <Button
                      variant="link"
                      action="secondary"
                      onPress={() => setShowPassword((v) => !v)}
                      size="sm"
                      style={{ minWidth: 32, minHeight: 32 }}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={currentTheme.colors.text.secondary} />
                      ) : (
                        <Eye size={20} color={currentTheme.colors.text.secondary} />
                      )}
                    </Button>
                  </Box>
                </Box>
                <Text
                  size="sm"
                  style={{
                    fontFamily: currentTheme.typography.fontFamily,
                    color: currentTheme.colors.text.secondary,
                    marginTop: -currentTheme.spacing.sm,
                    marginBottom: currentTheme.spacing.sm,
                    textAlign: 'right',
                  }}
                  allowFontScaling
                >
                  Your credentials are encrypted and secure
                </Text>
                {error && (
                  <TouchableOpacity
                    onPress={() => setError(null)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: `${currentTheme.colors.error}20`,
                      borderRadius: currentTheme.borderRadius.medium,
                      padding: currentTheme.spacing.sm,
                    }}
                    accessible
                    accessibilityRole="alert"
                    accessibilityLabel={error}
                    accessibilityHint="Tap to dismiss error"
                  >
                    <AlertCircle
                      size={20}
                      color={currentTheme.colors.error}
                      style={{ marginRight: currentTheme.spacing.sm }}
                    />
                    <Text
                      size="sm"
                      style={{
                        fontFamily: currentTheme.typography.fontFamily,
                        color: currentTheme.colors.error,
                        flex: 1,
                      }}
                      allowFontScaling
                    >
                      {error}
                    </Text>
                    <X size={20} color={currentTheme.colors.error} />
                  </TouchableOpacity>
                )}
                <Animated.View style={{ transform: [{ scale: buttonScale }], opacity: loading ? 0.7 : 1 }}>
                  <Button
                    action="primary"
                    size="lg"
                    style={{
                      borderRadius: currentTheme.borderRadius.button,
                      backgroundColor: currentTheme.colors.primary,
                      ...currentTheme.shadows.medium,
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                    onPress={() => {
                      animateButton();
                      handleLogin();
                    }}
                    disabled={loading}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="Log in to Match & Settle"
                    accessibilityHint="Submit login credentials"
                  >
                    <ButtonText
                      size="md"
                      style={{
                        fontFamily: currentTheme.typography.fontFamily,
                        color: currentTheme.colors.text.primary,
                      }}
                      allowFontScaling
                    >
                      {loading ? 'Logging in...' : 'Log In'}
                    </ButtonText>
                  </Button>
                </Animated.View>
                <LinearGradient
                  colors={[currentTheme.colors.border, `${currentTheme.colors.border}00`]}
                  style={{
                    height: 1,
                    marginVertical: currentTheme.spacing.lg,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
        <Link
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={{ alignSelf: 'flex-end' }}
                  accessible
                  accessibilityRole="link"
                  accessibilityLabel="Navigate to Forgot Password"
                >
                  <LinkText
                    size="sm"
                    style={{
                      fontWeight: '500',
                      color: currentTheme.colors.primary,
                    }}
                    allowFontScaling
                  >
                    Forgot Password?
                  </LinkText>
        </Link>
      </VStack>
            </Box>
            <Box style={{ flexDirection: 'row', justifyContent: 'center', paddingBottom: currentTheme.spacing.lg }}>
              <Text
                size="md"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                }}
                allowFontScaling
              >
          Don&apos;t have an account?{' '}
        </Text>
              <Link
                onPress={() => navigation.navigate('Register')}
                accessible
                accessibilityRole="link"
                accessibilityLabel="Navigate to Register"
              >
                <LinkText
                  size="md"
                  style={{
                    fontFamily: currentTheme.typography.fontFamily,
                    color: currentTheme.colors.primary,
                    fontWeight: '500',
                  }}
                  allowFontScaling
                >
                  Register
                </LinkText>
        </Link>
      </Box>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
