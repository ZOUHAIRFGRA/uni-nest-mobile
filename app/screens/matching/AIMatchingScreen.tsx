import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useMatchesActions } from '../../store/hooks';
import { thunks } from '../../store/appThunks';
import { Match as ApiMatch } from '../../types';

/**
 * Match interface
 */
interface Match {
  id: string;
  type: 'property' | 'roommate';
  title: string;
  description: string;
  compatibilityScore: number;
  matchReasons: string[];
  image: string;
  isNew: boolean;
}

/**
 * AI Matching Screen - Main hub for AI-powered matching
 * Features: Property and roommate recommendations, match insights
 */
export const AIMatchingScreen = () => {
  const { matches, loading, error, dispatch } = useMatchesActions();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'properties' | 'roommates'>('all');

  /**
   * Load AI matches from Redux store
   */
  const loadAIMatches = useCallback(async () => {
    try {
      await dispatch(thunks.matches.fetchMatches(activeTab === 'all' ? 'all' : activeTab === 'properties' ? 'property' : 'roommate'));
    } catch (error) {
      console.error('Error loading AI matches:', error);
      Alert.alert('Error', 'Failed to load AI matches');
    }
  }, [activeTab, dispatch]);

  /**
   * Load AI matches on component mount and when tab changes
   */
  useEffect(() => {
    loadAIMatches();
  }, [loadAIMatches]);

  /**
   * Handle refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAIMatches();
    setRefreshing(false);
  };

  /**
   * Handle match selection
   */
  const handleMatchSelect = (match: Match) => {
    Alert.alert('Match Selected', `Opening details for: ${match.title}`);
    // TODO: Navigate to MatchDetailsScreen or specific details screen
  };

  /**
   * Handle like/pass actions
   */
  const handleLikeMatch = (matchId: string) => {
    Alert.alert('Liked', 'Match liked! This will improve future recommendations.');
    // Update match status via Redux thunk
    dispatch(thunks.matches.updateMatchStatus(matchId, 'liked'));
  };

  const handlePassMatch = (matchId: string) => {
    Alert.alert('Passed', 'Match passed. This will improve future recommendations.');
    // Update match status via Redux thunk  
    dispatch(thunks.matches.updateMatchStatus(matchId, 'disliked'));
  };

  /**
   * Transform API matches to local Match interface
   */
  const transformMatches = (apiMatches: ApiMatch[]): Match[] => {
    return apiMatches.map(match => ({
      id: match._id,
      type: match.type,
      title: match.target && 'title' in match.target 
        ? match.target.title 
        : match.target && 'firstName' in match.target 
          ? `${match.target.firstName} ${match.target.lastName || ''}`.trim()
          : 'Match Details Unavailable',
      description: match.reasons.join(', '),
      compatibilityScore: match.compatibilityScore,
      matchReasons: match.reasons,
      image: match.target && 'images' in match.target && match.target.images?.[0]
        ? match.target.images[0]
        : match.target && 'profileImage' in match.target && match.target.profileImage
          ? match.target.profileImage
          : `https://via.placeholder.com/300x200/${match.type === 'property' ? '6366f1' : '8b5cf6'}/ffffff?text=${match.type}`,
      isNew: new Date(match.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000, // New if created in last 24h
    }));
  };

  /**
   * Get filtered matches based on active tab
   */
  const getFilteredMatches = (): Match[] => {
    const transformedMatches = transformMatches(matches);
    
    switch (activeTab) {
      case 'properties':
        return transformedMatches.filter(m => m.type === 'property');
      case 'roommates':
        return transformedMatches.filter(m => m.type === 'roommate');
      default:
        return transformedMatches;
    }
  };

  /**
   * Render match card
   */
  const renderMatchCard = (match: Match, index: number) => (
    <Animated.View
      key={match.id}
      entering={FadeInDown.delay(index * 100).duration(600)}
      className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100"
    >
      <TouchableOpacity
        onPress={() => handleMatchSelect(match)}
        activeOpacity={0.9}
      >
        {/* Match Header */}
        <View className="p-4 border-b border-gray-100">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl mr-2">
                  {match.type === 'property' ? '🏠' : '👤'}
                </Text>
                <Text className="text-xl font-bold text-gray-800 flex-1">
                  {match.title}
                </Text>
                {match.isNew && (
                  <View className="bg-red-500 px-2 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">NEW</Text>
                  </View>
                )}
              </View>
              <Text className="text-gray-600 mb-3">{match.description}</Text>
            </View>
          </View>

          {/* Compatibility Score */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">🤖</Text>
              <Text className="text-lg font-bold text-purple-600">
                {match.compatibilityScore}% Match
              </Text>
            </View>
            <View className="bg-purple-50 px-3 py-1 rounded-full">
              <Text className="text-purple-600 text-sm font-medium">
                AI Recommended
              </Text>
            </View>
          </View>
        </View>

        {/* Match Reasons */}
        <View className="p-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Why this is a great match:
          </Text>
          <View className="space-y-2">
            {match.matchReasons.map((reason, index) => (
              <View key={index} className="flex-row items-center">
                <Text className="text-green-500 mr-2">✓</Text>
                <Text className="text-gray-700 flex-1">{reason}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row border-t border-gray-100">
          <TouchableOpacity
            onPress={() => handlePassMatch(match.id)}
            className="flex-1 py-4 items-center border-r border-gray-100"
          >
            <Text className="text-red-500 font-bold text-lg">👎 Pass</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleLikeMatch(match.id)}
            className="flex-1 py-4 items-center"
          >
            <Text className="text-green-500 font-bold text-lg">👍 Like</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  /**
   * Render tab navigation
   */
  const renderTabNavigation = () => (
    <Animated.View 
      entering={FadeInUp.delay(400).duration(600)}
      className="px-6 mb-4"
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'all', label: '🎯 All Matches', count: matches.length },
          { key: 'properties', label: '🏠 Properties', count: matches.filter(m => m.type === 'property').length },
          { key: 'roommates', label: '👥 Roommates', count: matches.filter(m => m.type === 'roommate').length },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`mr-3 px-4 py-3 rounded-2xl border ${
              activeTab === tab.key
                ? 'bg-purple-500 border-purple-500'
                : 'bg-white border-gray-200'
            }`}
          >
            <Text className={`font-bold text-center ${
              activeTab === tab.key ? 'text-white' : 'text-gray-700'
            }`}>
              {tab.label}
            </Text>
            <Text className={`text-sm text-center mt-1 ${
              activeTab === tab.key ? 'text-purple-100' : 'text-gray-500'
            }`}>
              {tab.count} matches
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Animated.View 
        entering={FadeInUp.delay(200).duration(600)}
        className="px-6 pt-4 pb-2"
      >
        <Text className="text-3xl font-bold text-gray-800">
          AI Matching
        </Text>
        <Text className="text-gray-600 text-lg">
          Personalized recommendations just for you
        </Text>
      </Animated.View>

      {/* Tab Navigation */}
      {renderTabNavigation()}

      {/* Matches List */}
      <ScrollView
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Animated.View 
            entering={FadeInDown.delay(600).duration(600)}
            className="flex-1 justify-center items-center py-20"
          >
            <Text className="text-4xl mb-4">🤖</Text>
            <Text className="text-gray-600 mt-2">Finding your perfect matches...</Text>
          </Animated.View>
        ) : getFilteredMatches().length > 0 ? (
          getFilteredMatches().map((match, index) => renderMatchCard(match, index))
        ) : (
          <Animated.View 
            entering={FadeInDown.delay(600).duration(600)}
            className="flex-1 justify-center items-center py-20"
          >
            <Text className="text-6xl mb-4">🎯</Text>
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              No Matches Found
            </Text>
            <Text className="text-gray-600 text-center px-4 mb-6">
              Update your preferences to get better AI recommendations
            </Text>
            <TouchableOpacity 
              onPress={() => Alert.alert('Preferences', 'Navigate to preferences screen...')}
              className="bg-purple-500 px-8 py-4 rounded-2xl mr-3"
              style={{
                shadowColor: '#8B5CF6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text className="text-white font-bold text-lg">Update Preferences</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>

      {/* Bottom Action Bar */}
      <Animated.View 
        entering={FadeInUp.delay(800).duration(600)}
        className="bg-white border-t border-gray-200 p-4"
      >
        <View className="flex-row justify-around">
          <TouchableOpacity
            onPress={() => Alert.alert('Preferences', 'Opening preferences...')}
            className="items-center"
          >
            <Text className="text-2xl mb-1">⚙️</Text>
            <Text className="text-gray-600 text-sm font-medium">Preferences</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => Alert.alert('Refresh', 'Refreshing matches...')}
            className="items-center"
          >
            <Text className="text-2xl mb-1">🔄</Text>
            <Text className="text-gray-600 text-sm font-medium">Refresh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => Alert.alert('History', 'Opening match history...')}
            className="items-center"
          >
            <Text className="text-2xl mb-1">📊</Text>
            <Text className="text-gray-600 text-sm font-medium">History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => Alert.alert('Feedback', 'Opening feedback...')}
            className="items-center"
          >
            <Text className="text-2xl mb-1">💭</Text>
            <Text className="text-gray-600 text-sm font-medium">Feedback</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default AIMatchingScreen;
