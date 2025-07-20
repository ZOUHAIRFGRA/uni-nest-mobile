import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

// Welcome screen with app description
const WelcomeScreen = ({ onGetStarted, onSignIn }: WelcomeScreenProps) => {
  // App features for onboarding
  const features = [
    {
      title: "AI-Powered Matching",
      description: "Our intelligent algorithm matches you with compatible roommates and perfect properties based on your preferences, lifestyle, and budget.",
      icon: "🧠",
      bgColor: "bg-purple-100",
    },
    {
      title: "Smart Property Search",
      description: "Discover student-friendly housing with advanced filters, virtual tours, and real-time availability updates.",
      icon: "🏠",
      bgColor: "bg-blue-100",
    },
    {
      title: "Secure Settlements",
      description: "Handle deposits, rent payments, and splitting bills with our secure payment system and transparent settlement tracking.",
      icon: "💳",
      bgColor: "bg-green-100",
    },
    {
      title: "Community Connect",
      description: "Chat with potential roommates, join study groups, and build lasting connections in your student community.",
      icon: "👥",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background gradient effect with multiple colored views */}
      <View className="absolute inset-0">
        <View className="flex-1 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50" />
        <View className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full opacity-20 -mr-16 -mt-16" />
        <View className="absolute bottom-20 left-0 w-24 h-24 bg-blue-200 rounded-full opacity-20 -ml-12" />
        <View className="absolute top-1/3 right-8 w-16 h-16 bg-green-200 rounded-full opacity-20" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Header */}
        <View className="items-center pt-16 pb-8">
          <Animated.View 
            entering={FadeInUp.delay(200).duration(800)}
            className="w-24 h-24 rounded-3xl bg-purple-500 items-center justify-center mb-6 shadow-lg"
          >
            <Text className="text-4xl">🏠</Text>
          </Animated.View>
          
          <Animated.Text 
            entering={FadeInUp.delay(400).duration(800)}
            className="text-4xl font-bold text-gray-800 mb-2"
          >
            Match & Settle
          </Animated.Text>
          
          <Animated.Text 
            entering={FadeInUp.delay(600).duration(800)}
            className="text-lg text-gray-600 text-center px-8"
          >
            Your intelligent companion for student housing and roommate matching
          </Animated.Text>
        </View>

        {/* Features */}
        <View className="px-6 space-y-6">
          {features.map((feature, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.delay(800 + index * 200).duration(600)}
              className="bg-white rounded-2xl p-6 shadow-lg"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <View className="flex-row items-start">
                <View className={`w-12 h-12 rounded-xl ${feature.bgColor} items-center justify-center mr-4`}>
                  <Text className="text-2xl">{feature.icon}</Text>
                </View>
                
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-800 mb-2">
                    {feature.title}
                  </Text>
                  <Text className="text-gray-600 leading-6">
                    {feature.description}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Statistics */}
        <Animated.View
          entering={FadeInUp.delay(1600).duration(600)}
          className="mx-6 mt-8 bg-purple-500 rounded-2xl p-6"
        >
          <Text className="text-white text-xl font-bold text-center mb-6">
            Join thousands of students
          </Text>
          
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-white text-3xl font-bold">10K+</Text>
              <Text className="text-purple-100">Students</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-3xl font-bold">5K+</Text>
              <Text className="text-purple-100">Properties</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-3xl font-bold">95%</Text>
              <Text className="text-purple-100">Match Rate</Text>
            </View>
          </View>
        </Animated.View>

        {/* Call to Action */}
        <View className="px-6 py-8 space-y-4">
          <Animated.View entering={FadeInDown.delay(1800).duration(600)}>
            <TouchableOpacity
              onPress={onGetStarted}
              className="bg-purple-500 rounded-2xl py-4 px-8"
              style={{
                shadowColor: '#6C63FF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text className="text-white text-lg font-bold text-center">
                Get Started
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(2000).duration(600)}>
            <TouchableOpacity
              onPress={onSignIn}
              className="border-2 border-purple-500 rounded-2xl py-4 px-8"
            >
              <Text className="text-purple-500 text-lg font-bold text-center">
                Sign In
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(2200).duration(600)}>
            <Text className="text-gray-500 text-center text-sm mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
