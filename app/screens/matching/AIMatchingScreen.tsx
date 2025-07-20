import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from '../../store/hooks';
import { thunks } from '../../store/appThunks';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Modern iOS-style AI Matching Screen
 */
export const AIMatchingScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Animation values
  const headerScale = useSharedValue(0.9);
  const cardsTranslateY = useSharedValue(30);
  const pulseValue = useSharedValue(1);

  // Get data from Redux store
  const matches = useSelector((state: any) => state.matches.matches || []);
  const properties = useSelector((state: any) => state.properties.properties || []);

  useEffect(() => {
    // Animate elements on mount
    headerScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    cardsTranslateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    
    // Start pulse animation
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(thunks.matches.fetchMatches()),
        dispatch(thunks.properties.fetchRecentProperties()),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardsTranslateY.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  /**
   * Render header section
   */
  const renderHeader = () => (
    <Animated.View 
      style={headerAnimatedStyle}
      className="px-6 pt-4 pb-6"
    >
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        className="rounded-3xl p-6 shadow-2xl"
        style={{
          shadowColor: '#4facfe',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white/80 text-sm font-medium mb-1">
              AI-Powered Matching
            </Text>
            <Text className="text-white text-2xl font-bold mb-2">
              Smart Recommendations 🤖
            </Text>
            <Text className="text-white/90 text-sm">
              Find your perfect match using AI
            </Text>
          </View>
          <Animated.View 
            style={pulseAnimatedStyle}
            className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center backdrop-blur-xl"
          >
            <Text className="text-2xl">🤖</Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  /**
   * Render analysis section
   */
  const renderAnalysisSection = () => (
    <Animated.View 
      entering={FadeInUp.delay(200).duration(600)}
      className="px-6 mb-6"
    >
      <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          AI Analysis
        </Text>
        
        {isAnalyzing ? (
          <View className="items-center">
            <Animated.View 
              style={pulseAnimatedStyle}
              className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4"
            >
              <Text className="text-blue-600 text-2xl">🤖</Text>
            </Animated.View>
            
            <Text className="text-gray-800 font-semibold text-lg mb-2">
              Analyzing your preferences...
            </Text>
            
            {/* Progress bar */}
            <View className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <View 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                style={{ width: `${analysisProgress}%` }}
              />
            </View>
            
            <Text className="text-gray-600 text-sm">
              {analysisProgress}% complete
            </Text>
          </View>
        ) : (
          <View className="items-center">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <Text className="text-green-600 text-2xl">✅</Text>
            </View>
            
            <Text className="text-gray-800 font-semibold text-lg mb-2">
              Analysis Complete!
            </Text>
            <Text className="text-gray-600 text-sm text-center mb-4">
              We've analyzed your preferences and found {matches.length} perfect matches
            </Text>
            
            <TouchableOpacity
              onPress={startAnalysis}
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl px-6 py-3"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">Re-analyze</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );

  /**
   * Render match card
   */
  const renderMatchCard = ({ item, index }: { item: any; index: number }) => {
    const matchScore = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
    
    return (
      <Animated.View
        entering={FadeInUp.delay(400 + index * 100).duration(600)}
        className="mb-4"
      >
        <TouchableOpacity
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          activeOpacity={0.8}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          {/* Property Image */}
          <View className="w-full h-48 bg-gray-200 relative">
            {item.images && item.images[0] ? (
              <Image
                source={{ uri: item.images[0] }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 items-center justify-center">
                <Text className="text-gray-500 text-4xl">🏠</Text>
              </View>
            )}
            
            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              className="absolute bottom-0 left-0 right-0 h-20"
            />
            
            {/* Match score badge */}
            <View className="absolute top-4 right-4 bg-white/90 backdrop-blur-xl rounded-xl px-3 py-2">
              <Text className="text-green-600 font-bold text-lg">
                {matchScore}%
              </Text>
            </View>

            {/* AI Match indicator */}
            <View className="absolute top-4 left-4 bg-blue-500/90 backdrop-blur-xl rounded-full px-3 py-1">
              <Text className="text-white text-sm font-semibold">🤖 AI Match</Text>
            </View>

            {/* Price badge */}
            <View className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xl rounded-xl px-3 py-2">
              <Text className="text-purple-600 font-bold text-lg">
                ${item.price}/mo
              </Text>
            </View>
          </View>

          {/* Property Info */}
          <View className="p-4">
            <Text className="text-gray-800 font-bold text-lg mb-2" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-gray-500 text-sm mb-3" numberOfLines={1}>
              📍 {item.address}
            </Text>

            {/* Match reasons */}
            <View className="mb-3">
              <Text className="text-gray-700 font-semibold text-sm mb-2">
                Why this matches you:
              </Text>
              <View className="space-y-1">
                <View className="flex-row items-center">
                  <Text className="text-green-500 text-xs mr-2">✓</Text>
                  <Text className="text-gray-600 text-xs">Perfect price range</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-green-500 text-xs mr-2">✓</Text>
                  <Text className="text-gray-600 text-xs">Close to university</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-green-500 text-xs mr-2">✓</Text>
                  <Text className="text-gray-600 text-xs">Matches your lifestyle</Text>
                </View>
              </View>
            </View>

            {/* Property details */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center space-x-4">
                <View className="flex-row items-center">
                  <Text className="text-gray-400 text-sm mr-1">👥</Text>
                  <Text className="text-gray-600 text-sm">{item.maxTenants} tenants</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-gray-400 text-sm mr-1">🏠</Text>
                  <Text className="text-gray-600 text-sm">{item.roomType}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <Text className="text-gray-400 text-sm mr-1">⭐</Text>
                <Text className="text-gray-600 text-sm">4.8</Text>
              </View>
            </View>

            {/* Action buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl py-3 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold">View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-gray-700 font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <Animated.View 
      entering={FadeInUp.duration(600)}
      className="flex-1 items-center justify-center py-20"
    >
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        className="w-24 h-24 rounded-full items-center justify-center mb-6"
      >
        <Text className="text-white text-4xl">🤖</Text>
      </LinearGradient>
      
      <Text className="text-gray-800 text-xl font-bold mb-3 text-center">
        No AI matches yet
      </Text>
      <Text className="text-gray-500 text-center px-8 mb-8">
        Start the AI analysis to get personalized property recommendations.
      </Text>
      
      <TouchableOpacity 
        onPress={startAnalysis}
        className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl px-8 py-4"
        activeOpacity={0.8}
      >
        <Text className="text-white font-semibold text-base">
          Start AI Analysis
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  /**
   * Render stats section
   */
  const renderStats = () => (
    <Animated.View 
      entering={FadeInUp.delay(300).duration(600)}
      className="px-6 mb-6"
    >
      <View className="flex-row space-x-4">
        {/* Total Matches */}
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
              <Text className="text-white text-2xl font-bold mb-1">
                {matches.length}
              </Text>
              <Text className="text-white/90 text-xs font-medium">
                AI Matches
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Average Score */}
        <View className="flex-1">
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            className="rounded-2xl p-4 shadow-lg"
            style={{
              shadowColor: '#667eea',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View className="items-center">
              <Text className="text-white text-2xl font-bold mb-1">85%</Text>
              <Text className="text-white/90 text-xs font-medium">
                Avg. Match Score
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Analysis Count */}
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
              <Text className="text-white text-2xl font-bold mb-1">12</Text>
              <Text className="text-white/90 text-xs font-medium">
                Analyses Done
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-100">
        <View className="px-6 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-800 mb-1">
            AI Matching
          </Text>
          <Text className="text-gray-500 text-sm">
            Smart property recommendations
          </Text>
        </View>
        
        {renderHeader()}
        {renderAnalysisSection()}
        {matches.length > 0 && renderStats()}
      </View>

      {/* Matches List */}
      <Animated.View style={cardsAnimatedStyle} className="flex-1">
        {matches.length === 0 ? (
          renderEmptyState()
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#4facfe"
                colors={['#4facfe']}
              />
            }
          >
            {properties.slice(0, 5).map((property: any, index: number) => 
              renderMatchCard({ item: property, index })
            )}
          </ScrollView>
        )}
      </Animated.View>

      {/* Bottom spacing for tab bar */}
      <View className="h-32" />
    </SafeAreaView>
  );
};
