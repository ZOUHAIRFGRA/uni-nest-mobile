import React, { useState } from 'react';
import { TextInput, View, Text, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolateColor
} from 'react-native-reanimated';

interface InputFieldProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
  className?: string;
}

/**
 * iOS-style input field with smooth focus animations and floating labels
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  disabled = false,
  leftIcon,
  rightIcon,
  multiline = false,
  numberOfLines = 1,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const focusAnimation = useSharedValue(0);
  const borderAnimation = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusAnimation.value = withTiming(1, { duration: 200 });
    borderAnimation.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnimation.value = withTiming(0, { duration: 200 });
    borderAnimation.value = withTiming(0, { duration: 200 });
  };

  const labelAnimatedStyle = useAnimatedStyle(() => {
    const shouldFloat = isFocused || value.length > 0;
    
    return {
      transform: [
        {
          translateY: withTiming(shouldFloat ? -28 : 0, { duration: 200 }),
        },
        {
          scale: withTiming(shouldFloat ? 0.85 : 1, { duration: 200 }),
        },
      ],
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      borderAnimation.value,
      [0, 1],
      [error ? '#EF4444' : '#E5E7EB', error ? '#EF4444' : '#6C63FF']
    );

    return {
      borderColor,
    };
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View className={`mb-4 ${className}`}>
      <View className="relative">
        {/* Floating Label */}
        {label && (
          <Animated.Text
            style={labelAnimatedStyle}
            className={`absolute left-4 top-4 z-10 bg-white px-1 text-md font-medium ${
              error ? 'text-error' : isFocused ? 'text-primary-500' : 'text-gray-600'
            }`}
          >
            {label}
          </Animated.Text>
        )}

        {/* Input Container */}
        <Animated.View
          className={`
            flex-row bg-white rounded-xl border-2 px-4
            ${multiline ? 'py-4 items-start' : 'py-0 items-center'}
            ${disabled ? 'bg-gray-50' : ''}
            ${error ? 'border-error' : 'border-gray-200'}
          `}
          style={[
            containerAnimatedStyle,
            {
              minHeight: multiline ? 120 : 48, // Slightly reduced height for better proportion
            }
          ]}
        >
          {/* Left Icon */}
          {leftIcon && (
            <View className="mr-3">
              {leftIcon}
            </View>
          )}

          {/* Text Input */}
          <TextInput
            className={`flex-1 text-md text-gray-800 ${multiline ? 'min-h-[100px]' : ''}`}
            placeholder={isFocused && label ? '' : placeholder}
            placeholderTextColor="#9CA3AF"
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={secureTextEntry && !showPassword}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            editable={!disabled}
            multiline={multiline}
            numberOfLines={numberOfLines}
            textAlignVertical={multiline ? 'top' : 'center'}
            style={{
              // Ensure proper vertical centering for single-line inputs
              includeFontPadding: false, // Remove extra font padding on Android
              textAlignVertical: multiline ? 'top' : 'center',
            }}
          />

          {/* Password Toggle */}
          {secureTextEntry && (
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              className="ml-3 p-1"
            >
              <Text className="text-gray-500 text-lg">
                {showPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Right Icon */}
          {rightIcon && !secureTextEntry && (
            <View className="ml-3">
              {rightIcon}
            </View>
          )}
        </Animated.View>
      </View>

      {/* Error Message */}
      {error && (
        <Text className="text-error text-sm mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};
