import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';

/**
 * Match details interface
 */
interface MatchDetails {
  id: string;
  type: 'property' | 'roommate';
  title: string;
  subtitle: string;
  matchScore: number;
  overallCompatibility: {
    score: number;
    factors: {
      budget: { score: number; weight: number; details: string };
      location: { score: number; weight: number; details: string };
      lifestyle: { score: number; weight: number; details: string };
      preferences: { score: number; weight: number; details: string };
      timing: { score: number; weight: number; details: string };
    };
  };
  strengths: string[];
  considerations: string[];
  recommendations: string[];
  detailedAnalysis: {
    budgetAnalysis: string;
    locationBenefits: string;
    lifestyleCompatibility: string;
    riskFactors: string[];
    successPrediction: number;
  };
  contactInfo?: {
    name: string;
    phone: string;
    email: string;
    preferredContact: 'phone' | 'email' | 'app';
  };
}

/**
 * Match Details Screen - Detailed AI analysis of compatibility
 * Features: In-depth compatibility breakdown, recommendations, contact options
 */
export const MatchDetailsScreen = () => {
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analysis' | 'factors' | 'recommendations'>('analysis');

  /**
   * Load match details on component mount
   */
  useEffect(() => {
    loadMatchDetails();
  }, []);

  /**
   * Load detailed match analysis from API
   */
  const loadMatchDetails = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual match ID from navigation params
      const mockMatchDetails: MatchDetails = {
        id: 'MD001',
        type: 'property',
        title: 'Modern Studio in Agdal',
        subtitle: 'Perfect match for your student lifestyle',
        matchScore: 96,
        overallCompatibility: {
          score: 96,
          factors: {
            budget: { 
              score: 98, 
              weight: 30, 
              details: 'Property price (2400 MAD) is within 2% of your ideal budget (2450 MAD)' 
            },
            location: { 
              score: 95, 
              weight: 25, 
              details: '0.8km from Mohammed V University, excellent public transport access' 
            },
            lifestyle: { 
              score: 94, 
              weight: 20, 
              details: 'Quiet study environment with modern amenities matches your preferences' 
            },
            preferences: { 
              score: 97, 
              weight: 15, 
              details: 'Furnished studio with WiFi, balcony, and kitchen perfectly aligns with your wishlist' 
            },
            timing: { 
              score: 92, 
              weight: 10, 
              details: 'Available Feb 1st, ideal for your semester start date' 
            },
          },
        },
        strengths: [
          'Excellent budget alignment within your comfort zone',
          'Walking distance to university saves transport costs',
          'High-rated verified landlord with quick response time',
          'Modern amenities including high-speed WiFi for online classes',
          'Quiet neighborhood perfect for studying',
          'Fully furnished - move in ready with no additional costs'
        ],
        considerations: [
          'Studio size (35m²) may feel compact for extended stays',
          'No parking space available - consider if you have a vehicle',
          'Balcony faces west - afternoon sun might be intense in summer',
          'Building has only 3 floors - no elevator access'
        ],
        recommendations: [
          'Schedule a virtual tour before finalizing to confirm the space meets your needs',
          'Ask about utility costs and any additional monthly fees',
          'Inquire about guest policy if you plan to have friends visit',
          'Confirm internet speed for online classes and video calls',
          'Discuss lease flexibility for potential semester abroad programs'
        ],
        detailedAnalysis: {
          budgetAnalysis: 'At 2400 MAD/month, this property represents excellent value. Your target budget of 2450 MAD allows for a 50 MAD buffer, perfect for any unexpected utility costs. Compared to similar properties in the area, this is priced 8% below market average.',
          locationBenefits: 'Agdal is considered one of Rabat\'s premium student areas. The 0.8km distance to Mohammed V University means a comfortable 10-minute walk or 3-minute bike ride. The area has excellent cafes, libraries, and student services within walking distance.',
          lifestyleCompatibility: 'Your profile indicates preference for quiet study environments and modern amenities. This property scores 94% on lifestyle compatibility due to its location in a residential area away from nightlife, modern furnished interior, and balcony space for fresh air breaks.',
          riskFactors: [
            'Limited storage space in studio layout',
            'No nearby parking for guests',
            'Potential noise from nearby construction (completion by March 2024)'
          ],
          successPrediction: 89,
        },
        contactInfo: {
          name: 'Ahmed Benali',
          phone: '+212 600 123 456',
          email: 'ahmed.benali@email.com',
          preferredContact: 'phone',
        },
      };
      
      setMatchDetails(mockMatchDetails);
    } catch (error) {
      console.error('Error loading match details:', error);
      Alert.alert('Error', 'Failed to load match details');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle contact owner
   */
  const handleContactOwner = () => {
    if (matchDetails?.contactInfo) {
      Alert.alert(
        'Contact Owner',
        `Contact ${matchDetails.contactInfo.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => Alert.alert('Calling...', matchDetails.contactInfo!.phone) },
          { text: 'Message', onPress: () => Alert.alert('Messaging...', 'Opening chat...') }
        ]
      );
    }
  };

  /**
   * Handle book property
   */
  const handleBookProperty = () => {
    Alert.alert('Book Property', 'Navigate to booking screen...');
    // TODO: Navigate to booking screen with property details
  };

  /**
   * Handle save match
   */
  const handleSaveMatch = () => {
    Alert.alert('Saved', 'Match saved to favorites!');
    // TODO: Implement save functionality
  };

  /**
   * Get score color based on value
   */
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  /**
   * Get score background color
   */
  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  /**
   * Render tab button
   */
  const renderTabButton = (tab: string, label: string) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab as any)}
      className={`flex-1 py-3 rounded-xl mx-1 ${
        activeTab === tab ? 'bg-purple-500' : 'bg-gray-100'
      }`}
    >
      <Text className={`text-center font-medium ${
        activeTab === tab ? 'text-white' : 'text-gray-600'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  /**
   * Render compatibility factors
   */
  const renderCompatibilityFactors = () => {
    if (!matchDetails) return null;

    return (
      <View className="space-y-4">
        {Object.entries(matchDetails.overallCompatibility.factors).map(([key, factor]) => (
          <View key={key} className="bg-white p-4 rounded-xl">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold text-gray-800 capitalize">{key}</Text>
              <View className={`px-3 py-1 rounded-full ${getScoreBgColor(factor.score)}`}>
                <Text className={`font-bold ${getScoreColor(factor.score)}`}>
                  {factor.score}%
                </Text>
              </View>
            </View>
            
            <View className="mb-3">
              <View className="bg-gray-200 h-2 rounded-full">
                <View 
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${factor.score}%` }}
                />
              </View>
            </View>
            
            <Text className="text-gray-600 text-sm mb-2">
              Weight: {factor.weight}% of total compatibility
            </Text>
            <Text className="text-gray-700">{factor.details}</Text>
          </View>
        ))}
      </View>
    );
  };

  /**
   * Render analysis content
   */
  const renderAnalysisContent = () => {
    if (!matchDetails) return null;

    return (
      <View className="space-y-4">
        {/* Overall Score */}
        <View className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-2xl">
          <View className="items-center">
            <Text className="text-white text-6xl font-bold mb-2">
              {matchDetails.matchScore}%
            </Text>
            <Text className="text-purple-100 text-lg font-medium mb-1">
              Compatibility Score
            </Text>
            <Text className="text-purple-100 text-center">
              Exceptional match based on AI analysis
            </Text>
          </View>
        </View>

        {/* Detailed Analysis */}
        <View className="bg-white p-5 rounded-xl">
          <Text className="text-xl font-bold text-gray-800 mb-4">AI Analysis</Text>
          
          <View className="space-y-4">
            <View>
              <Text className="text-lg font-bold text-gray-800 mb-2">💰 Budget Analysis</Text>
              <Text className="text-gray-700 leading-6">{matchDetails.detailedAnalysis.budgetAnalysis}</Text>
            </View>
            
            <View>
              <Text className="text-lg font-bold text-gray-800 mb-2">📍 Location Benefits</Text>
              <Text className="text-gray-700 leading-6">{matchDetails.detailedAnalysis.locationBenefits}</Text>
            </View>
            
            <View>
              <Text className="text-lg font-bold text-gray-800 mb-2">🏠 Lifestyle Compatibility</Text>
              <Text className="text-gray-700 leading-6">{matchDetails.detailedAnalysis.lifestyleCompatibility}</Text>
            </View>
          </View>
        </View>

        {/* Success Prediction */}
        <View className="bg-green-50 p-5 rounded-xl border border-green-200">
          <Text className="text-lg font-bold text-green-800 mb-2">🎯 Success Prediction</Text>
          <Text className="text-green-700">
            Our AI predicts a <Text className="font-bold">{matchDetails.detailedAnalysis.successPrediction}% success rate</Text> for this match based on similar user profiles and outcomes.
          </Text>
        </View>
      </View>
    );
  };

  /**
   * Render recommendations content
   */
  const renderRecommendationsContent = () => {
    if (!matchDetails) return null;

    return (
      <View className="space-y-4">
        {/* Strengths */}
        <View className="bg-white p-5 rounded-xl">
          <Text className="text-xl font-bold text-gray-800 mb-4">✅ Key Strengths</Text>
          {matchDetails.strengths.map((strength, index) => (
            <View key={index} className="flex-row items-start mb-3">
              <Text className="text-green-500 mr-3 text-lg">•</Text>
              <Text className="text-gray-700 flex-1">{strength}</Text>
            </View>
          ))}
        </View>

        {/* Considerations */}
        <View className="bg-white p-5 rounded-xl">
          <Text className="text-xl font-bold text-gray-800 mb-4">⚠️ Considerations</Text>
          {matchDetails.considerations.map((consideration, index) => (
            <View key={index} className="flex-row items-start mb-3">
              <Text className="text-yellow-500 mr-3 text-lg">•</Text>
              <Text className="text-gray-700 flex-1">{consideration}</Text>
            </View>
          ))}
        </View>

        {/* Recommendations */}
        <View className="bg-white p-5 rounded-xl">
          <Text className="text-xl font-bold text-gray-800 mb-4">💡 AI Recommendations</Text>
          {matchDetails.recommendations.map((recommendation, index) => (
            <View key={index} className="flex-row items-start mb-3">
              <Text className="text-blue-500 mr-3 text-lg">•</Text>
              <Text className="text-gray-700 flex-1">{recommendation}</Text>
            </View>
          ))}
        </View>

        {/* Risk Factors */}
        {matchDetails.detailedAnalysis.riskFactors.length > 0 && (
          <View className="bg-red-50 p-5 rounded-xl border border-red-200">
            <Text className="text-lg font-bold text-red-800 mb-3">🚨 Risk Factors</Text>
            {matchDetails.detailedAnalysis.riskFactors.map((risk, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <Text className="text-red-500 mr-3">•</Text>
                <Text className="text-red-700 flex-1">{risk}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-4xl mb-4">🧠</Text>
        <Text className="text-gray-600 mt-2">Analyzing match details...</Text>
      </SafeAreaView>
    );
  }

  if (!matchDetails) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-4xl mb-4">❌</Text>
        <Text className="text-xl font-bold text-gray-800 mb-2">Match Not Found</Text>
        <Text className="text-gray-600 text-center px-6">
          The match details could not be loaded
        </Text>
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
        <Text className="text-2xl font-bold text-gray-800 mb-1">
          {matchDetails.title}
        </Text>
        <Text className="text-gray-600">{matchDetails.subtitle}</Text>
        
        <View className="flex-row items-center justify-between mt-4">
          <View className={`px-4 py-2 rounded-full ${getScoreBgColor(matchDetails.matchScore)}`}>
            <Text className={`font-bold text-lg ${getScoreColor(matchDetails.matchScore)}`}>
              {matchDetails.matchScore}% Match
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={handleSaveMatch}
            className="p-2"
          >
            <Text className="text-gray-400 text-2xl">🤍</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Tabs */}
      <Animated.View 
        entering={SlideInRight.delay(300).duration(600)}
        className="px-6 py-4 bg-white border-b border-gray-100"
      >
        <View className="flex-row">
          {renderTabButton('analysis', 'Analysis')}
          {renderTabButton('factors', 'Factors')}
          {renderTabButton('recommendations', 'Tips')}
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Animated.View 
          entering={FadeInDown.delay(400).duration(600)}
          className="p-6"
        >
          {activeTab === 'analysis' && renderAnalysisContent()}
          {activeTab === 'factors' && renderCompatibilityFactors()}
          {activeTab === 'recommendations' && renderRecommendationsContent()}
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      <Animated.View 
        entering={FadeInUp.delay(500).duration(600)}
        className="bg-white border-t border-gray-200 p-4"
      >
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={handleContactOwner}
            className="flex-1 bg-gray-100 py-4 rounded-2xl"
          >
            <Text className="text-gray-800 font-bold text-center">
              📞 Contact Owner
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleBookProperty}
            className="flex-1 bg-purple-500 py-4 rounded-2xl"
            style={{
              shadowColor: '#8B5CF6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-white font-bold text-center">
              🏠 Book Now
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default MatchDetailsScreen;
