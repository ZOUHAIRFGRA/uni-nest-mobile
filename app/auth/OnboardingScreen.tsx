import React, { useEffect, useRef } from 'react';
import { Animated, Easing, useColorScheme, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Center } from '../../components/ui/center';
import { Button, ButtonText } from '../../components/ui/button';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { getTheme } from '../utils/theme';

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade-in for content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Subtle shimmer for gradient
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Subtle pulse for Get Started button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Icon bounce animation
    Animated.spring(iconBounce, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, shimmerAnim, pulseAnim, iconBounce]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 150],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <Center style={{ flex: 1, paddingHorizontal: currentTheme.spacing.md }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim, width: '100%' }}>
          {/* Header with Gradient */}
          <LinearGradient
            colors={[`${currentTheme.colors.primary}B3`, `${currentTheme.colors.secondary}B3`]} // Softer opacity
            style={{
              borderRadius: currentTheme.borderRadius.card,
              marginTop: currentTheme.spacing.xl,
              marginBottom: currentTheme.spacing.lg,
              padding: currentTheme.spacing.lg,
              alignItems: 'center',
              justifyContent: 'center',
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
            {/* Icon Container */}
            <Animated.View
              style={{
                transform: [{ scale: iconBounce }],
                width: 100,
                height: 100,
                borderRadius: currentTheme.borderRadius.round,
                backgroundColor: `${currentTheme.colors.card}4D`, // Translucent card color
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: currentTheme.spacing.md,
                ...currentTheme.shadows.medium,
                elevation: 10,
              }}
              accessible
              accessibilityRole="image"
              accessibilityLabel="Match & Settle Logo"
            >
              <Text
                size="3xl"
                style={{ color: currentTheme.colors.text.primary, fontSize: 52 }}
                allowFontScaling
              >
                🏡✨
              </Text>
            </Animated.View>
            {/* Title and Tagline */}
            <Text
              size="3xl"
              style={{
                fontFamily: currentTheme.typography.fontFamily,
                fontWeight: '700',
                color: currentTheme.colors.text.primary,
                textAlign: 'center',
                marginBottom: currentTheme.spacing.xs,
              }}
              accessible
              accessibilityRole="header"
              accessibilityLabel="Welcome to Match & Settle"
              allowFontScaling
            >
              Match & Settle
            </Text>
            <Text
              size="lg"
              style={{
                fontFamily: currentTheme.typography.fontFamily,
                fontWeight: '500',
                color: currentTheme.colors.text.secondary,
                textAlign: 'center',
                marginBottom: currentTheme.spacing.sm,
              }}
              allowFontScaling
            >
              Find Your Perfect Home
            </Text>
            {/* AI Badge */}
            <Box
              style={{
                backgroundColor: `${currentTheme.colors.card}40`,
                borderRadius: currentTheme.borderRadius.medium,
                paddingHorizontal: currentTheme.spacing.sm,
                paddingVertical: currentTheme.spacing.xs,
                marginBottom: currentTheme.spacing.md,
              }}
            >
              <Text
                size="sm"
                style={{
                  color: currentTheme.colors.text.primary,
                  fontWeight: '700',
                  letterSpacing: 1.2,
                }}
                accessible
                accessibilityLabel="AI-Powered Feature"
                allowFontScaling
              >
                AI-POWERED
              </Text>
        </Box>
            {/* Description */}
            <Text
              size="md"
              style={{
                fontFamily: currentTheme.typography.fontFamily,
                color: currentTheme.colors.text.secondary,
                textAlign: 'center',
                lineHeight: currentTheme.spacing.lg * 1.2,
                paddingHorizontal: currentTheme.spacing.md,
              }}
              numberOfLines={3}
              adjustsFontSizeToFit
              allowFontScaling
              accessible
              accessibilityLabel="Find your ideal home and roommates with AI-powered matching"
            >
              Discover your ideal home and connect with compatible roommates using our smart AI technology.
        </Text>
          </LinearGradient>
          {/* Gradient Divider */}
          <LinearGradient
            colors={[currentTheme.colors.border, `${currentTheme.colors.border}00`]}
            style={{
              height: 1,
              marginVertical: currentTheme.spacing.lg,
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
      {/* Action Buttons */}
          <VStack space="xl" style={{ width: '100%', paddingBottom: currentTheme.spacing.xl }}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Button
                action="primary"
                size="lg"
                style={{
                  borderRadius: currentTheme.borderRadius.button,
                  backgroundColor: currentTheme.colors.primary,
                  paddingVertical: currentTheme.spacing.sm,
                  ...currentTheme.shadows.medium,
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                }}
                onPress={() => navigation.navigate('Register')}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Get Started with Match & Settle"
                accessibilityHint="Navigate to the registration screen"
              >
                <ButtonText
                  size="md"
                  style={{
                    fontFamily: currentTheme.typography.fontFamily,
                    fontWeight: '500',
                      color: currentTheme.colors.text.primary,
                  }}
                  allowFontScaling
                >
                  Get Started
                </ButtonText>
        </Button>
            </Animated.View>
            <Button
              action="secondary"
              size="lg"
              variant="outline"
              style={{
                borderRadius: currentTheme.borderRadius.button,
                borderColor: currentTheme.colors.primary,
                borderWidth: 1.5,
                paddingVertical: currentTheme.spacing.sm,
              }}
              onPress={() => navigation.navigate('Login')}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Log in to Match & Settle"
              accessibilityHint="Navigate to the login screen"
            >
              <ButtonText
                size="md"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  fontWeight: '500',
                  color: currentTheme.colors.primary,
                }}
                allowFontScaling
              >
                Log In
              </ButtonText>
        </Button>
      </VStack>
        </Animated.View>
    </Center>
    </SafeAreaView>
  );
} 