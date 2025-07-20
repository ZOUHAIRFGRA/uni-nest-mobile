import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';

/**
 * User preferences interface
 */
interface UserPreferences {
  budget: {
    min: number;
    max: number;
    priority: 'low' | 'medium' | 'high';
  };
  location: {
    maxDistance: number;
    preferredAreas: string[];
    nearUniversity: boolean;
    publicTransport: boolean;
    priority: 'low' | 'medium' | 'high';
  };
  property: {
    types: ('studio' | 'room' | 'apartment' | 'house')[];
    furnished: boolean;
    wifi: boolean;
    kitchen: boolean;
    parking: boolean;
    priority: 'low' | 'medium' | 'high';
  };
  roommate: {
    gender: 'any' | 'same' | 'opposite';
    ageRange: { min: number; max: number };
    cleanliness: number;
    socialLevel: number;
    studyHabits: number;
    smoking: boolean;
    pets: boolean;
    priority: 'low' | 'medium' | 'high';
  };
  lifestyle: {
    sleepSchedule: 'early' | 'normal' | 'late';
    quietEnvironment: boolean;
    guestsAllowed: boolean;
    cookingFrequency: 'never' | 'occasionally' | 'often';
    studyAtHome: boolean;
    priority: 'low' | 'medium' | 'high';
  };
}

/**
 * Preferences Screen - Configure matching preferences and priorities
 * Features: Comprehensive preference settings, priority weighting, AI optimization
 */
export const PreferencesScreen = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    budget: {
      min: 1500,
      max: 2500,
      priority: 'high',
    },
    location: {
      maxDistance: 5,
      preferredAreas: ['Agdal', 'Hay Riad'],
      nearUniversity: true,
      publicTransport: true,
      priority: 'high',
    },
    property: {
      types: ['studio', 'room'],
      furnished: true,
      wifi: true,
      kitchen: true,
      parking: false,
      priority: 'medium',
    },
    roommate: {
      gender: 'any',
      ageRange: { min: 18, max: 26 },
      cleanliness: 8,
      socialLevel: 6,
      studyHabits: 8,
      smoking: false,
      pets: false,
      priority: 'medium',
    },
    lifestyle: {
      sleepSchedule: 'normal',
      quietEnvironment: true,
      guestsAllowed: true,
      cookingFrequency: 'often',
      studyAtHome: true,
      priority: 'medium',
    },
  });

  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('budget');

  /**
   * Load saved preferences on component mount
   */
  useEffect(() => {
    loadSavedPreferences();
  }, []);

  /**
   * Load user's saved preferences
   */
  const loadSavedPreferences = async () => {
    try {
      // TODO: Load from AsyncStorage or API
      console.log('Loading saved preferences...');
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  /**
   * Save preferences
   */
  const savePreferences = async () => {
    try {
      setLoading(true);
      // TODO: Save to AsyncStorage and API
      Alert.alert('Success', 'Preferences saved successfully!');
      console.log('Saving preferences:', preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset preferences to defaults
   */
  const resetPreferences = () => {
    Alert.alert(
      'Reset Preferences',
      'Are you sure you want to reset all preferences to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            // Reset to default values
            setPreferences({
              budget: { min: 1500, max: 2500, priority: 'high' },
              location: { maxDistance: 5, preferredAreas: [], nearUniversity: true, publicTransport: true, priority: 'high' },
              property: { types: ['studio', 'room'], furnished: true, wifi: true, kitchen: true, parking: false, priority: 'medium' },
              roommate: { gender: 'any', ageRange: { min: 18, max: 26 }, cleanliness: 5, socialLevel: 5, studyHabits: 5, smoking: false, pets: false, priority: 'medium' },
              lifestyle: { sleepSchedule: 'normal', quietEnvironment: true, guestsAllowed: true, cookingFrequency: 'often', studyAtHome: true, priority: 'medium' },
            });
          }
        }
      ]
    );
  };

  /**
   * Update budget preferences
   */
  const updateBudgetPreferences = (field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      budget: { ...prev.budget, [field]: value }
    }));
  };

  /**
   * Update location preferences
   */
  const updateLocationPreferences = (field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  /**
   * Update property preferences
   */
  const updatePropertyPreferences = (field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      property: { ...prev.property, [field]: value }
    }));
  };

  /**
   * Update roommate preferences
   */
  const updateRoommatePreferences = (field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      roommate: { ...prev.roommate, [field]: value }
    }));
  };

  /**
   * Update lifestyle preferences
   */
  const updateLifestylePreferences = (field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      lifestyle: { ...prev.lifestyle, [field]: value }
    }));
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  /**
   * Render priority selector
   */
  const renderPrioritySelector = (currentPriority: string, onUpdate: (priority: string) => void) => (
    <View className="flex-row space-x-2">
      {['low', 'medium', 'high'].map((priority) => (
        <TouchableOpacity
          key={priority}
          onPress={() => onUpdate(priority)}
          className={`px-3 py-1 rounded-full ${
            currentPriority === priority ? getPriorityColor(priority) : 'bg-gray-200'
          }`}
        >
          <Text className={`text-sm font-medium ${
            currentPriority === priority ? 'text-white' : 'text-gray-600'
          }`}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  /**
   * Render range slider (simplified)
   */
  const renderRangeSlider = (label: string, value: number, min: number, max: number, step: number, onUpdate: (value: number) => void) => (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-gray-800 font-medium">{label}</Text>
        <Text className="text-purple-600 font-bold">{value}</Text>
      </View>
      <View className="flex-row space-x-2">
        <TouchableOpacity
          onPress={() => value > min && onUpdate(value - step)}
          className="bg-gray-200 p-2 rounded-full"
        >
          <Text className="text-gray-600 font-bold">-</Text>
        </TouchableOpacity>
        <View className="flex-1 bg-gray-200 h-10 rounded-full items-center justify-center">
          <Text className="text-gray-800 font-medium">{value}</Text>
        </View>
        <TouchableOpacity
          onPress={() => value < max && onUpdate(value + step)}
          className="bg-gray-200 p-2 rounded-full"
        >
          <Text className="text-gray-600 font-bold">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Render section header
   */
  const renderSectionHeader = (title: string, icon: string, sectionKey: string) => (
    <TouchableOpacity
      onPress={() => setActiveSection(activeSection === sectionKey ? '' : sectionKey)}
      className="bg-white p-4 rounded-xl mb-4 border border-gray-100"
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-3">{icon}</Text>
          <Text className="text-lg font-bold text-gray-800">{title}</Text>
        </View>
        <Text className="text-gray-400 text-xl">
          {activeSection === sectionKey ? '▼' : '▶'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  /**
   * Render budget section
   */
  const renderBudgetSection = () => (
    <Animated.View 
      entering={FadeInDown.duration(400)}
      className="bg-white p-5 rounded-xl mb-4"
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-800">Budget Range</Text>
        {renderPrioritySelector(preferences.budget.priority, (priority) => 
          updateBudgetPreferences('priority', priority)
        )}
      </View>

      {renderRangeSlider('Minimum Budget (MAD)', preferences.budget.min, 1000, 3000, 100, (value) =>
        updateBudgetPreferences('min', value)
      )}

      {renderRangeSlider('Maximum Budget (MAD)', preferences.budget.max, 1500, 5000, 100, (value) =>
        updateBudgetPreferences('max', value)
      )}

      <View className="bg-purple-50 p-3 rounded-lg">
        <Text className="text-purple-700 text-sm">
          💡 Your budget range: {preferences.budget.min} - {preferences.budget.max} MAD/month
        </Text>
      </View>
    </Animated.View>
  );

  /**
   * Render location section
   */
  const renderLocationSection = () => (
    <Animated.View 
      entering={FadeInDown.duration(400)}
      className="bg-white p-5 rounded-xl mb-4"
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-800">Location Preferences</Text>
        {renderPrioritySelector(preferences.location.priority, (priority) => 
          updateLocationPreferences('priority', priority)
        )}
      </View>

      {renderRangeSlider('Max Distance (km)', preferences.location.maxDistance, 1, 20, 1, (value) =>
        updateLocationPreferences('maxDistance', value)
      )}

      <View className="space-y-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-800">Near University</Text>
          <Switch
            value={preferences.location.nearUniversity}
            onValueChange={(value) => updateLocationPreferences('nearUniversity', value)}
            trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-gray-800">Public Transport Access</Text>
          <Switch
            value={preferences.location.publicTransport}
            onValueChange={(value) => updateLocationPreferences('publicTransport', value)}
            trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
            thumbColor={'#FFFFFF'}
          />
        </View>
      </View>
    </Animated.View>
  );

  /**
   * Render property section
   */
  const renderPropertySection = () => (
    <Animated.View 
      entering={FadeInDown.duration(400)}
      className="bg-white p-5 rounded-xl mb-4"
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-800">Property Requirements</Text>
        {renderPrioritySelector(preferences.property.priority, (priority) => 
          updatePropertyPreferences('priority', priority)
        )}
      </View>

      <View className="space-y-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-800">Furnished</Text>
          <Switch
            value={preferences.property.furnished}
            onValueChange={(value) => updatePropertyPreferences('furnished', value)}
            trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-gray-800">WiFi Required</Text>
          <Switch
            value={preferences.property.wifi}
            onValueChange={(value) => updatePropertyPreferences('wifi', value)}
            trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-gray-800">Kitchen Access</Text>
          <Switch
            value={preferences.property.kitchen}
            onValueChange={(value) => updatePropertyPreferences('kitchen', value)}
            trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-gray-800">Parking Space</Text>
          <Switch
            value={preferences.property.parking}
            onValueChange={(value) => updatePropertyPreferences('parking', value)}
            trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
            thumbColor={'#FFFFFF'}
          />
        </View>
      </View>
    </Animated.View>
  );

  /**
   * Render roommate section
   */
  const renderRoommateSection = () => (
    <Animated.View 
      entering={FadeInDown.duration(400)}
      className="bg-white p-5 rounded-xl mb-4"
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-800">Roommate Preferences</Text>
        {renderPrioritySelector(preferences.roommate.priority, (priority) => 
          updateRoommatePreferences('priority', priority)
        )}
      </View>

      {renderRangeSlider('Cleanliness Level', preferences.roommate.cleanliness, 1, 10, 1, (value) =>
        updateRoommatePreferences('cleanliness', value)
      )}

      {renderRangeSlider('Social Level', preferences.roommate.socialLevel, 1, 10, 1, (value) =>
        updateRoommatePreferences('socialLevel', value)
      )}

      {renderRangeSlider('Study Habits', preferences.roommate.studyHabits, 1, 10, 1, (value) =>
        updateRoommatePreferences('studyHabits', value)
      )}

      <View className="space-y-3 mt-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-800">No Smoking</Text>
          <Switch
            value={!preferences.roommate.smoking}
            onValueChange={(value) => updateRoommatePreferences('smoking', !value)}
            trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-gray-800">No Pets</Text>
          <Switch
            value={!preferences.roommate.pets}
            onValueChange={(value) => updateRoommatePreferences('pets', !value)}
            trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
            thumbColor={'#FFFFFF'}
          />
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Animated.View 
        entering={FadeInUp.delay(200).duration(600)}
        className="px-6 pt-4 pb-6 bg-white border-b border-gray-100"
      >
        <Text className="text-3xl font-bold text-gray-800 mb-2">
          Preferences
        </Text>
        <Text className="text-gray-600">
          Customize your matching preferences
        </Text>
      </Animated.View>

      {/* AI Optimization Notice */}
      <Animated.View 
        entering={SlideInRight.delay(300).duration(600)}
        className="bg-gradient-to-r from-purple-500 to-blue-500 mx-6 mt-4 p-4 rounded-2xl"
      >
        <View className="flex-row items-center">
          <Text className="text-4xl mr-3">🧠</Text>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">AI Optimization</Text>
            <Text className="text-purple-100">
              Your preferences help our AI find better matches
            </Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Budget Section */}
          {renderSectionHeader('Budget', '💰', 'budget')}
          {activeSection === 'budget' && renderBudgetSection()}

          {/* Location Section */}
          {renderSectionHeader('Location', '📍', 'location')}
          {activeSection === 'location' && renderLocationSection()}

          {/* Property Section */}
          {renderSectionHeader('Property', '🏠', 'property')}
          {activeSection === 'property' && renderPropertySection()}

          {/* Roommate Section */}
          {renderSectionHeader('Roommate', '🤝', 'roommate')}
          {activeSection === 'roommate' && renderRoommateSection()}

          {/* Lifestyle Section */}
          {renderSectionHeader('Lifestyle', '🌟', 'lifestyle')}
          {activeSection === 'lifestyle' && (
            <Animated.View 
              entering={FadeInDown.duration(400)}
              className="bg-white p-5 rounded-xl mb-4"
            >
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-800">Lifestyle Preferences</Text>
                {renderPrioritySelector(preferences.lifestyle.priority, (priority) => 
                  updateLifestylePreferences('priority', priority)
                )}
              </View>

              <View className="space-y-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-800">Quiet Environment</Text>
                  <Switch
                    value={preferences.lifestyle.quietEnvironment}
                    onValueChange={(value) => updateLifestylePreferences('quietEnvironment', value)}
                    trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                    thumbColor={'#FFFFFF'}
                  />
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-800">Guests Allowed</Text>
                  <Switch
                    value={preferences.lifestyle.guestsAllowed}
                    onValueChange={(value) => updateLifestylePreferences('guestsAllowed', value)}
                    trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                    thumbColor={'#FFFFFF'}
                  />
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-800">Study at Home</Text>
                  <Switch
                    value={preferences.lifestyle.studyAtHome}
                    onValueChange={(value) => updateLifestylePreferences('studyAtHome', value)}
                    trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                    thumbColor={'#FFFFFF'}
                  />
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <Animated.View 
        entering={FadeInUp.delay(500).duration(600)}
        className="bg-white border-t border-gray-200 p-4"
      >
        <View className="flex-row space-x-3 mb-4">
          <TouchableOpacity
            onPress={resetPreferences}
            className="flex-1 bg-gray-100 py-3 rounded-xl"
          >
            <Text className="text-gray-800 font-bold text-center">Reset to Default</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => Alert.alert('AI Analysis', 'Running AI analysis on your preferences...')}
            className="flex-1 bg-blue-100 py-3 rounded-xl"
          >
            <Text className="text-blue-600 font-bold text-center">🧠 AI Analysis</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          onPress={savePreferences}
          disabled={loading}
          className="bg-purple-500 py-4 rounded-2xl"
          style={{
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text className="text-white font-bold text-center text-lg">
            {loading ? 'Saving...' : '💾 Save Preferences'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default PreferencesScreen;
