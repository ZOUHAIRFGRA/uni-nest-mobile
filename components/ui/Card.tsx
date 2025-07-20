import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outline' | 'glass';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  animationDelay?: number;
}

/**
 * iOS-style card component with glassmorphism and elevation effects
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  animationDelay = 0,
}) => {
  const variantStyles = {
    default: 'bg-white shadow-card',
    elevated: 'bg-white shadow-elevated',
    outline: 'bg-white border border-gray-200',
    glass: 'bg-white/90 backdrop-blur-xl shadow-ios-lg',
  };

  const paddingStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(animationDelay).springify()}
      className={`rounded-2xl ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </Animated.View>
  );
};

interface GradientCardProps {
  children: React.ReactNode;
  colors?: string[];
  className?: string;
  animationDelay?: number;
}

/**
 * Gradient card with iOS-style aesthetics
 */
export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  className = '',
  animationDelay = 0,
}) => {
  return (
    <Animated.View
      entering={FadeInUp.delay(animationDelay).springify()}
      className={`rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-elevated p-6 ${className}`}
    >
      {children}
    </Animated.View>
  );
};
