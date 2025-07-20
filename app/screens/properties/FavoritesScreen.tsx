import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
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
  withTiming
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from '../../store/hooks';
import { thunks } from '../../store/appThunks';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Modern iOS-style Favorites Screen
 */
export const FavoritesScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);

  // Animation values
  const headerScale = useSharedValue(0.9);
  const cardsTranslateY = useSharedValue(30);

  // Get data from Redux store
  const properties = useSelector((state: any) => state.properties.properties || []);

  useEffect(() => {
    // Load favorites on mount
    loadFavorites();
    
    // Animate elements
    headerScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    cardsTranslateY.value = withSpring(0, { damping: 15, stiffness: 150 });
  }, []);

  const loadFavorites = async () => {
    try {
      // For now, we'll use the properties from Redux and simulate favorites
      // In a real app, you'd fetch actual favorites from the API
      const mockFavorites = properties.slice(0, 5); // First 5 properties as favorites
      setFavorites(mockFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadFavorites();
    } finally {
      setRefreshing(false);
    }
  };

  const removeFavorite = (propertyId: string) => {
    setFavorites(prev => prev.filter(fav => fav._id !== propertyId));
  };

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardsTranslateY.value }],
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
        colors={['#fa709a', '#fee140']}
        className="rounded-3xl p-6 shadow-2xl"
        style={{
          shadowColor: '#fa709a',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white/80 text-sm font-medium mb-1">
              Your Saved Properties
            </Text>
            <Text className="text-white text-2xl font-bold mb-2">
              Favorites ❤️
            </Text>
            <Text className="text-white/90 text-sm">
              {favorites.length} properties saved
            </Text>
          </View>
          <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center backdrop-blur-xl">
            <Text className="text-2xl">❤️</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  /**
   * Render favorite property card
   */
  const renderFavoriteCard = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(600)}
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
          
          {/* Price badge */}
          <View className="absolute top-4 right-4 bg-white/90 backdrop-blur-xl rounded-xl px-3 py-2">
            <Text className="text-purple-600 font-bold text-lg">
              ${item.price}/mo
            </Text>
          </View>

          {/* Remove favorite button */}
          <TouchableOpacity 
            onPress={() => removeFavorite(item._id)}
            className="absolute top-4 left-4 w-10 h-10 bg-red-500/90 backdrop-blur-xl rounded-full items-center justify-center"
          >
            <Text className="text-white text-lg">✕</Text>
          </TouchableOpacity>

          {/* Favorite indicator */}
          <View className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xl rounded-full px-3 py-1">
            <Text className="text-red-500 text-sm font-semibold">❤️ Saved</Text>
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

          {/* Amenities */}
          <View className="flex-row flex-wrap mb-3">
            {item.amenities && Object.entries(item.amenities).slice(0, 4).map(([key, value]: [string, any]) => (
              value && (
                <View key={key} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-1">
                  <Text className="text-gray-600 text-xs">
                    {key === 'wifi' && '📶 WiFi'}
                    {key === 'parking' && '🚗 Parking'}
                    {key === 'laundry' && '👕 Laundry'}
                    {key === 'gym' && '💪 Gym'}
                    {key === 'security' && '🔒 Security'}
                    {key === 'furnished' && '🪑 Furnished'}
                    {key === 'airConditioning' && '❄️ AC'}
                    {key === 'heating' && '🔥 Heating'}
                    {key === 'kitchen' && '🍳 Kitchen'}
                    {key === 'balcony' && '🌿 Balcony'}
                  </Text>
                </View>
              )
            ))}
          </View>

          {/* Property details */}
          <View className="flex-row items-center justify-between">
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
          <View className="flex-row space-x-3 mt-4">
            <TouchableOpacity 
              className="flex-1 bg-purple-600 rounded-xl py-3 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 font-semibold">Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <Animated.View 
      entering={FadeInUp.duration(600)}
      className="flex-1 items-center justify-center py-20"
    >
      <LinearGradient
        colors={['#fa709a', '#fee140']}
        className="w-24 h-24 rounded-full items-center justify-center mb-6"
      >
        <Text className="text-white text-4xl">❤️</Text>
      </LinearGradient>
      
      <Text className="text-gray-800 text-xl font-bold mb-3 text-center">
        No favorites yet
      </Text>
      <Text className="text-gray-500 text-center px-8 mb-8">
        Start exploring properties and save your favorites to see them here.
      </Text>
      
      <TouchableOpacity 
        className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl px-8 py-4"
        activeOpacity={0.8}
      >
        <Text className="text-white font-semibold text-base">
          Explore Properties
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  /**
   * Render stats section
   */
  const renderStats = () => (
    <Animated.View 
      entering={FadeInUp.delay(200).duration(600)}
      className="px-6 mb-6"
    >
      <View className="flex-row space-x-4">
        {/* Total Favorites */}
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
              <Text className="text-white text-2xl font-bold mb-1">
                {favorites.length}
              </Text>
              <Text className="text-white/90 text-xs font-medium">
                Total Favorites
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Average Price */}
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
                ${favorites.length > 0 ? Math.round(favorites.reduce((sum, item) => sum + item.price, 0) / favorites.length) : 0}
              </Text>
              <Text className="text-white/90 text-xs font-medium">
                Avg. Price
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Most Popular Type */}
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
              <Text className="text-white text-lg font-bold mb-1">
                {favorites.length > 0 ? favorites[0]?.roomType || 'N/A' : 'N/A'}
              </Text>
              <Text className="text-white/90 text-xs font-medium">
                Popular Type
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
            My Favorites
          </Text>
          <Text className="text-gray-500 text-sm">
            Your saved properties
          </Text>
        </View>
        
        {renderHeader()}
        {favorites.length > 0 && renderStats()}
      </View>

      {/* Favorites List */}
      <Animated.View style={cardsAnimatedStyle} className="flex-1">
        {favorites.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={favorites}
            renderItem={renderFavoriteCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#fa709a"
                colors={['#fa709a']}
              />
            }
          />
        )}
      </Animated.View>

      {/* Bottom spacing for tab bar */}
      <View className="h-32" />
    </SafeAreaView>
  );
};
