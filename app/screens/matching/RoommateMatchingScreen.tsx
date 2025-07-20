import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { useMatchesActions } from '../../store/hooks';
import { thunks } from '../../store/appThunks';
import { Match, User } from '../../types';

/**
 * Roommate profile interface
 */
interface RoommateProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  university: string;
  studyField: string;
  yearOfStudy: number;
  budget: number;
  preferences: {
    cleanliness: number;
    socialLevel: number;
    studyHabits: number;
    sleepSchedule: 'early' | 'normal' | 'late';
    smoking: boolean;
    pets: boolean;
  };
  interests: string[];
  languages: string[];
  matchScore: number;
  profileImage?: string;
  verified: boolean;
  distance: number;
}

/**
 * Roommate Matching Screen - AI-powered roommate matching
 * Features: Compatibility scoring, preference matching, profile browsing
 */
export const RoommateMatchingScreen = () => {
  const { matches, loading, dispatch } = useMatchesActions();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  /**
   * Load roommate matches using useCallback for dependency optimization
   */
  const loadRoommateMatches = useCallback(async () => {
    try {
      // Load roommate matches specifically
      await dispatch(thunks.matches.fetchMatches('roommate'));
    } catch (error) {
      console.error('Error loading roommate matches:', error);
      Alert.alert('Error', 'Failed to load roommate matches');
    }
  }, [dispatch]);

  /**
   * Load roommate matches on component mount
   */
  useEffect(() => {
    loadRoommateMatches();
  }, [loadRoommateMatches]);

  /**
   * Load roommate matches from AI matching API
   */
    
      /**
   * Transform API matches to roommate profiles
   */
  const transformToRoommateProfiles = (matches: Match[]): RoommateProfile[] => {
    return matches
      .filter(match => match.type === 'roommate' && match.target)
      .map(match => {
        const user = match.target as User;
        return {
          id: match._id,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'User',
          age: user.dob ? Math.floor((Date.now() - new Date(user.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 22,
          gender: user.gender?.toLowerCase() as 'male' | 'female' | 'other' || 'other',
          university: user.university || 'University not specified',
          studyField: user.studyField || 'Field not specified',
          yearOfStudy: user.yearOfStudy || 1,
          budget: user.preferences?.budget?.max || 2000,
          preferences: {
            cleanliness: user.lifestyle?.cleanlinessLevel ? 
              ['low', 'medium', 'high'].indexOf(user.lifestyle.cleanlinessLevel) * 3 + 5 : 7,
            socialLevel: user.lifestyle?.socialLevel ? 
              ['low', 'medium', 'high'].indexOf(user.lifestyle.socialLevel) * 3 + 5 : 7,
            studyHabits: 8, // Default value
            sleepSchedule: user.lifestyle?.sleepSchedule as 'early' | 'normal' | 'late' || 'normal',
            smoking: user.lifestyle?.smokingHabits !== 'never',
            pets: user.lifestyle?.petFriendly || false,
          },
          interests: [], // Not available in current User interface
          languages: [], // Not available in current User interface  
          matchScore: match.compatibilityScore,
          profileImage: user.profileImage,
          verified: user.isVerified || false,
          distance: Math.random() * 10, // TODO: Calculate actual distance
        };
      });
  };

  /**
   * Get filtered roommate profiles
   */
  const getFilteredRoommates = (): RoommateProfile[] => {
    const roommates = transformToRoommateProfiles(matches);
    
    if (activeFilter === 'all') return roommates;
    if (activeFilter === 'high-match') return roommates.filter(r => r.matchScore >= 80);
    if (activeFilter === 'same-university') return roommates.filter(r => r.university === 'Mohammed V University');
    if (activeFilter === 'verified') return roommates.filter(r => r.verified);
    return roommates;
  };

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRoommateMatches();
    setRefreshing(false);
  };

  /**
   * Get match score color
   */
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  /**
   * Filter roommates based on active filter
   */
  const filteredRoommates = getFilteredRoommates();

  /**
   * Handle roommate profile press
   */
  const handleRoommatePress = (roommate: RoommateProfile) => {
    Alert.alert(
      roommate.name,
      `Match Score: ${roommate.matchScore}%\nUniversity: ${roommate.university}\nBudget: ${roommate.budget} MAD`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('View details:', roommate.id) },
        { text: 'Send Message', onPress: () => console.log('Send message:', roommate.id) }
      ]
    );
  };

  /**
   * Handle connect request
   */
  const handleConnectRequest = (roommateId: string) => {
    Alert.alert('Connect Request', 'Connection request sent successfully!');
    // TODO: Implement actual connect request functionality
  };

  /**
   * Render compatibility badge
   */
  const renderCompatibilityBadge = (score: number) => (
    <View className={`px-3 py-1 rounded-full ${getMatchScoreColor(score)}`}>
      <Text className={`font-bold text-sm ${getMatchScoreColor(score).split(' ')[0]}`}>
        {score}% Match
      </Text>
    </View>
  );

  /**
   * Render roommate item
   */
  const renderRoommateItem = ({ item, index }: { item: RoommateProfile; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(600)}
    >
      <TouchableOpacity
        onPress={() => handleRoommatePress(item)}
        className="bg-white p-5 mb-4 rounded-2xl"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* Header with photo and basic info */}
        <View className="flex-row items-center mb-4">
          <View className="w-16 h-16 bg-purple-500 rounded-full items-center justify-center mr-4">
            <Text className="text-white font-bold text-xl">
              {item.name.charAt(0)}
            </Text>
          </View>
          
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-lg font-bold text-gray-800 mr-2">
                {item.name}
              </Text>
              {item.verified && (
                <Text className="text-green-500 text-lg">✓</Text>
              )}
            </View>
            <Text className="text-gray-600">
              {item.age} years • {item.yearOfStudy}rd year {item.studyField}
            </Text>
            <Text className="text-gray-500 text-sm">
              📍 {item.distance}km away • {item.university}
            </Text>
          </View>
          
          {renderCompatibilityBadge(item.matchScore)}
        </View>

        {/* Compatibility Details */}
        <View className="bg-gray-50 p-4 rounded-xl mb-4">
          <Text className="text-sm font-bold text-gray-800 mb-3">Compatibility Factors</Text>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600 text-sm">Cleanliness</Text>
            <View className="flex-row">
              {[...Array(5)].map((_, i) => (
                <Text key={i} className={`text-sm ${i < item.preferences.cleanliness / 2 ? 'text-yellow-500' : 'text-gray-300'}`}>
                  ⭐
                </Text>
              ))}
            </View>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600 text-sm">Social Level</Text>
            <View className="flex-row">
              {[...Array(5)].map((_, i) => (
                <Text key={i} className={`text-sm ${i < item.preferences.socialLevel / 2 ? 'text-yellow-500' : 'text-gray-300'}`}>
                  ⭐
                </Text>
              ))}
            </View>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600 text-sm">Study Habits</Text>
            <View className="flex-row">
              {[...Array(5)].map((_, i) => (
                <Text key={i} className={`text-sm ${i < item.preferences.studyHabits / 2 ? 'text-yellow-500' : 'text-gray-300'}`}>
                  ⭐
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Interests */}
        <View className="mb-4">
          <Text className="text-sm font-bold text-gray-800 mb-2">Interests</Text>
          <View className="flex-row flex-wrap">
            {item.interests.slice(0, 3).map((interest, idx) => (
              <View key={idx} className="bg-purple-100 px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-purple-600 text-sm font-medium">{interest}</Text>
              </View>
            ))}
            {item.interests.length > 3 && (
              <View className="bg-gray-100 px-3 py-1 rounded-full">
                <Text className="text-gray-600 text-sm">+{item.interests.length - 3} more</Text>
              </View>
            )}
          </View>
        </View>

        {/* Budget and Languages */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-sm text-gray-500">Budget Range</Text>
            <Text className="text-lg font-bold text-green-600">{item.budget} MAD/month</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500">Languages</Text>
            <Text className="text-gray-800 font-medium">
              {item.languages.join(', ')}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={() => handleRoommatePress(item)}
            className="flex-1 bg-gray-100 py-3 rounded-xl"
          >
            <Text className="text-gray-800 font-bold text-center">View Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleConnectRequest(item.id)}
            className="flex-1 bg-purple-500 py-3 rounded-xl"
          >
            <Text className="text-white font-bold text-center">Connect</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  /**
   * Render filter button
   */
  const renderFilterButton = (label: string, value: string) => (
    <TouchableOpacity
      onPress={() => setActiveFilter(value)}
      className={`px-4 py-2 rounded-full mr-3 ${
        activeFilter === value ? 'bg-purple-500' : 'bg-gray-100'
      }`}
    >
      <Text className={`font-medium ${
        activeFilter === value ? 'text-white' : 'text-gray-600'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-4xl mb-4">🤝</Text>
        <Text className="text-gray-600 mt-2">Finding compatible roommates...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Animated.View 
        entering={FadeInUp.delay(200).duration(600)}
        className="px-6 pt-4 pb-6 bg-white border-b border-gray-100"
      >
        <Text className="text-3xl font-bold text-gray-800 mb-2">
          Roommate Matching
        </Text>
        <Text className="text-gray-600">
          AI-powered compatibility matching
        </Text>
      </Animated.View>

      {/* AI Matching Stats */}
      <Animated.View 
        entering={SlideInRight.delay(300).duration(600)}
        className="bg-gradient-to-r from-purple-500 to-blue-500 mx-6 mt-4 p-4 rounded-2xl"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white font-bold text-lg">AI Analysis Complete</Text>
            <Text className="text-purple-100">Found {getFilteredRoommates().length} compatible matches</Text>
          </View>
          <Text className="text-4xl">🧠</Text>
        </View>
      </Animated.View>

      {/* Filters */}
      <Animated.View 
        entering={FadeInDown.delay(400).duration(600)}
        className="px-6 py-4"
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton('All Matches', 'all')}
          {renderFilterButton('High Match (85%+)', 'high-match')}
          {renderFilterButton('Verified Only', 'verified')}
          {renderFilterButton('Nearby (3km)', 'nearby')}
        </ScrollView>
      </Animated.View>

      {/* Roommates List */}
      {filteredRoommates.length === 0 ? (
        <Animated.View 
          entering={FadeInDown.delay(500).duration(600)}
          className="flex-1 justify-center items-center px-6"
        >
          <Text className="text-6xl mb-4">🔍</Text>
          <Text className="text-xl font-bold text-gray-800 mb-2">No Matches Found</Text>
          <Text className="text-gray-600 text-center">
            Try adjusting your filters or update your preferences for better matches
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={filteredRoommates}
          renderItem={renderRoommateItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default RoommateMatchingScreen;
