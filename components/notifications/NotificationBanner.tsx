import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Platform,useColorScheme } from 'react-native';
import { VStack } from '../../components/ui/vstack';
import { HStack } from '../../components/ui/hstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Pressable } from '../../components/ui/pressable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getTheme } from '@/app/utils/theme';

const { width: screenWidth } = Dimensions.get('window');

export interface NotificationBannerData {
  id: string;
  type: string;
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  data?: any;
  timestamp?: number;
}

interface NotificationBannerProps {
  notification: NotificationBannerData | null;
  visible: boolean;
  onPress?: () => void;
  onDismiss?: () => void;
  duration?: number; // Auto-dismiss duration in ms (0 = no auto-dismiss)
}

export default function NotificationBanner({
  notification,
  visible,
  onPress,
  onDismiss,
  duration = 4000,
}: NotificationBannerProps) {
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<NodeJS.Timeout | null>(null);

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
      case 'chat':
        return 'message-text';
      case 'booking':
        return 'home-variant';
      case 'payment':
        return 'credit-card';
      case 'match':
      case 'matching':
        return 'heart';
      case 'property':
        return 'home';
      case 'verification':
        return 'check-circle';
      case 'warning':
        return 'alert';
      case 'error':
        return 'alert-circle';
      case 'test':
        return 'test-tube';
      default:
        return 'bell';
    }
  };

  // Get notification colors based on priority and type
  const getNotificationColors = (type: string, priority: string = 'normal') => {
    if (priority === 'critical') {
      return {
        background: '#FF3B30',
        text: '#FFFFFF',
        icon: '#FFFFFF',
      };
    }

    if (priority === 'high') {
      return {
        background: '#FF9500',
        text: '#FFFFFF',
        icon: '#FFFFFF',
      };
    }

    switch (type) {
      case 'message':
      case 'chat':
        return {
          background: '#007AFF',
          text: '#FFFFFF',
          icon: '#FFFFFF',
        };
      case 'booking':
        return {
          background: '#34C759',
          text: '#FFFFFF',
          icon: '#FFFFFF',
        };
      case 'payment':
        return {
          background: '#5856D6',
          text: '#FFFFFF',
          icon: '#FFFFFF',
        };
      case 'match':
      case 'matching':
        return {
          background: '#FF2D92',
          text: '#FFFFFF',
          icon: '#FFFFFF',
        };
      case 'error':
        return {
          background: '#FF3B30',
          text: '#FFFFFF',
          icon: '#FFFFFF',
        };
      case 'warning':
        return {
          background: '#FF9500',
          text: '#FFFFFF',
          icon: '#FFFFFF',
        };
      case 'test':
        return {
          background: '#AF52DE',
          text: '#FFFFFF',
          icon: '#FFFFFF',
        };
      default:
        return {
          background: currentTheme.colors.primary,
          text: '#FFFFFF',
          icon: '#FFFFFF',
        };
    }
  };

  // Show animation
  const showBanner = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Hide animation
  const hideBanner = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  // Handle dismiss
  const handleDismiss = () => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
    
    hideBanner(() => {
      onDismiss?.();
    });
  };

  // Handle press
  const handlePress = () => {
    handleDismiss();
    onPress?.();
  };

  // Effect for showing/hiding banner
  useEffect(() => {
    if (visible && notification) {
      showBanner();
      
      // Auto-dismiss timer
      if (duration > 0) {
        dismissTimer.current = setTimeout(() => {
          handleDismiss();
        }, duration);
      }
    } else {
      hideBanner();
    }

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
        dismissTimer.current = null;
      }
    };
  }, [visible, notification]);

  // Don't render if no notification
  if (!notification) return null;

  const colors = getNotificationColors(notification.type, notification.priority);
  const iconName = getNotificationIcon(notification.type);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 25,
        left: 16,
        right: 16,
        zIndex: 9999,
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      <Pressable onPress={handlePress}>
        <Box
          style={{
            backgroundColor: colors.background,
            borderRadius: 12,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <HStack space="md" style={{ alignItems: 'flex-start' }}>
            {/* Icon */}
            <Box
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 20,
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 2,
              }}
            >
              <MaterialCommunityIcons
                name={iconName as any}
                size={20}
                color={colors.icon}
              />
            </Box>

            {/* Content */}
            <VStack space="xs" style={{ flex: 1 }}>
              <Text
                size="md"
                style={{
                  color: colors.text,
                  fontWeight: '700',
                  lineHeight: 20,
                }}
                numberOfLines={1}
              >
                {notification.title}
              </Text>
              <Text
                size="sm"
                style={{
                  color: colors.text,
                  opacity: 0.9,
                  lineHeight: 18,
                }}
                numberOfLines={2}
              >
                {notification.message}
              </Text>
              
              {/* Timestamp */}
              {notification.timestamp && (
                <Text
                  size="xs"
                  style={{
                    color: colors.text,
                    opacity: 0.7,
                    marginTop: 4,
                  }}
                >
                  {new Date(notification.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
            </VStack>

            {/* Dismiss button */}
            <Pressable
              onPress={handleDismiss}
              style={{
                padding: 4,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <MaterialCommunityIcons
                name="close"
                size={16}
                color={colors.icon}
              />
            </Pressable>
          </HStack>

          {/* Priority indicator */}
          {notification.priority && ['high', 'critical'].includes(notification.priority) && (
            <Box
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text
                size="xs"
                style={{
                  color: colors.text,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}
              >
                {notification.priority}
              </Text>
            </Box>
          )}
        </Box>
      </Pressable>
    </Animated.View>
  );
}
