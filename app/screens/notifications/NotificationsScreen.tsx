import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNotificationsActions } from '../../store/hooks';
import { thunks } from '../../store/appThunks';
import { Notification } from '../../types';

/**
 * Notifications Screen - Displays user notifications
 * Features: Real-time updates, mark as read, notification types
 */
export const NotificationsScreen = () => {
  const { notifications, unreadCount, loading, error, dispatch } = useNotificationsActions();
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Load notifications on component mount
   */
  useEffect(() => {
    loadNotifications();
  }, []);

  /**
   * Load notifications from API
   */
  const loadNotifications = useCallback(async () => {
    try {
      await dispatch(thunks.notifications.fetchNotifications());
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    }
  }, [dispatch]);

  /**
   * Handle refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  /**
   * Handle mark as read
   */
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await dispatch(thunks.notifications.markAsRead(notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  /**
   * Handle mark all as read
   */
  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(thunks.notifications.markAllAsRead());
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  /**
   * Handle notification tap
   */
  const handleNotificationTap = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }

    // Handle different notification types
    switch (notification.type) {
      case 'match':
        Alert.alert('New Match', 'Opening match details...');
        break;
      case 'booking':
        Alert.alert('Booking Update', 'Opening booking details...');
        break;
      case 'payment':
        Alert.alert('Payment Update', 'Opening payment details...');
        break;
      case 'message':
        Alert.alert('New Message', 'Opening chat...');
        break;
      default:
        Alert.alert('Notification', notification.message);
    }
  };

  /**
   * Get notification icon based on type
   */
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return '❤️';
      case 'booking':
        return '📋';
      case 'payment':
        return '💰';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  /**
   * Get notification color based on type
   */
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'match':
        return '#8B5CF6';
      case 'booking':
        return '#3B82F6';
      case 'payment':
        return '#10B981';
      case 'message':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  /**
   * Format notification time
   */
  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  /**
   * Render notification item
   */
  const renderNotificationItem = ({ item, index }: { item: Notification; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(600)}
      className={`mb-3 rounded-2xl border-l-4 ${
        item.read ? 'bg-white' : 'bg-blue-50'
      }`}
      style={{
        borderLeftColor: getNotificationColor(item.type),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <TouchableOpacity
        onPress={() => handleNotificationTap(item)}
        activeOpacity={0.8}
        className="p-4"
      >
        <View className="flex-row items-start">
          <View className="mr-3 mt-1">
            <Text className="text-2xl">{getNotificationIcon(item.type)}</Text>
          </View>
          
          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-1">
              <Text className={`font-bold text-lg ${
                item.read ? 'text-gray-800' : 'text-gray-900'
              }`}>
                {item.title}
              </Text>
              {!item.read && (
                <View className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
              )}
            </View>
            
            <Text className={`text-gray-600 mb-2 ${
              item.read ? 'text-gray-500' : 'text-gray-600'
            }`}>
              {item.message}
            </Text>
            
            <Text className="text-gray-400 text-sm">
              {formatNotificationTime(item.createdAt)}
            </Text>
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
      entering={FadeInUp.delay(400).duration(600)}
      className="flex-1 justify-center items-center py-20"
    >
      <Text className="text-6xl mb-4">🔔</Text>
      <Text className="text-2xl font-bold text-gray-800 mb-2">
        No Notifications
      </Text>
      <Text className="text-gray-600 text-center px-4 mb-6">
        You're all caught up! New notifications will appear here.
      </Text>
      <TouchableOpacity 
        onPress={loadNotifications}
        className="bg-purple-500 px-8 py-4 rounded-2xl"
        style={{
          shadowColor: '#8B5CF6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text className="text-white font-bold text-lg">Refresh</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Animated.View 
        entering={FadeInUp.delay(200).duration(600)}
        className="px-6 pt-4 pb-2"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-gray-800">
              Notifications
            </Text>
            <Text className="text-gray-600 text-lg">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </Text>
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              className="bg-purple-500 px-4 py-2 rounded-xl"
            >
              <Text className="text-white font-medium">Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Notifications List */}
      {loading && notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text className="text-gray-600 mt-4">Loading notifications...</Text>
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen; 