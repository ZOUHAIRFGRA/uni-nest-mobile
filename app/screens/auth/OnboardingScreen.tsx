import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

const onboardingData: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Find Your Perfect Match',
    subtitle: 'Smart Housing Solutions',
    description: 'Discover housing that fits your lifestyle, budget, and personality with our AI-powered matching system.',
    icon: '🏠',
    bgColor: '#667eea',
    textColor: '#ffffff',
  },
  {
    id: '2',
    title: 'Connect with Roommates',
    subtitle: 'Build Meaningful Relationships',
    description: 'Find compatible roommates based on your interests, study habits, and lifestyle preferences.',
    icon: '👥',
    bgColor: '#f093fb',
    textColor: '#ffffff',
  },
  {
    id: '3',
    title: 'Secure & Simple',
    subtitle: 'Hassle-Free Experience',
    description: 'Book properties, make payments, and manage everything through our secure and intuitive platform.',
    icon: '🔒',
    bgColor: '#4facfe',
    textColor: '#ffffff',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

/**
 * Onboarding screen component - shows app introduction slides
 */
export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  /**
   * Handle scroll events to update pagination
   */
  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const index = Math.round(contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  /**
   * Navigate to next slide or complete onboarding
   */
  const goToNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      onComplete();
    }
  };

  /**
   * Navigate to previous slide
   */
  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      scrollViewRef.current?.scrollTo({
        x: prevIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(prevIndex);
    }
  };

  /**
   * Skip onboarding and go to auth
   */
  const skipToEnd = () => {
    onComplete();
  };

  /**
   * Render individual onboarding slide
   */
  const renderSlide = (slide: OnboardingSlide, index: number) => {
    return (
      <View key={slide.id} style={{ width: SCREEN_WIDTH }}>
        <View
          style={{
            flex: 1,
            backgroundColor: slide.bgColor,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 40,
          }}
        >
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Icon */}
            <View className="w-32 h-32 bg-white/20 rounded-full items-center justify-center mb-8">
              <Text className="text-6xl">{slide.icon}</Text>
            </View>

            {/* Title */}
            <Text
              style={{ color: slide.textColor }}
              className="text-3xl font-bold text-center mb-2"
            >
              {slide.title}
            </Text>

            {/* Subtitle */}
            <Text
              style={{ color: slide.textColor }}
              className="text-lg font-medium text-center mb-6 opacity-90"
            >
              {slide.subtitle}
            </Text>

            {/* Description */}
            <Text
              style={{ color: slide.textColor }}
              className="text-base text-center leading-6 max-w-sm opacity-80"
            >
              {slide.description}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render pagination dots
   */
  const renderPagination = () => {
    return (
      <View className="flex-row justify-center items-center mb-8">
        {onboardingData.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <View
              key={index}
              style={{
                width: isActive ? 24 : 8,
                height: 8,
                borderRadius: 4,
                marginHorizontal: 4,
                backgroundColor: isActive ? '#007AFF' : '#C7C7CC',
              }}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Skip Button */}
      <View className="absolute top-12 right-6 z-10">
        <TouchableOpacity
          onPress={skipToEnd}
          className="bg-white/20 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-medium">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={{ flex: 1 }}
      >
        {onboardingData.map((slide, index) => renderSlide(slide, index))}
      </ScrollView>

      {/* Bottom Controls */}
      <View className="absolute bottom-0 left-0 right-0 bg-white">
        <View className="px-6 py-8">
          {/* Pagination */}
          {renderPagination()}

          {/* Buttons */}
          <View className="flex-row justify-between items-center">
            {/* Previous Button */}
            <TouchableOpacity
              onPress={goToPrevious}
              disabled={currentIndex === 0}
              className={`flex-1 mr-3 ${currentIndex === 0 ? 'opacity-30' : ''}`}
            >
              <View className="bg-gray-100 py-4 rounded-2xl">
                <Text className="text-gray-700 font-semibold text-center">
                  Previous
                </Text>
              </View>
            </TouchableOpacity>

            {/* Next/Get Started Button */}
            <TouchableOpacity onPress={goToNext} className="flex-1 ml-3">
              <View
                style={{ backgroundColor: onboardingData[currentIndex].bgColor }}
                className="py-4 rounded-2xl"
              >
                <Text className="text-white font-semibold text-center">
                  {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
