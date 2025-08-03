import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView, RefreshControl } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Divider } from '../../components/ui/divider';
import { notificationService } from '../services/notificationService';
import { Spinner } from '../../components/ui/spinner';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HStack } from '../../components/ui/hstack';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const navigation = useNavigation<any>();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications(1, 50);
      setNotifications(data.notifications || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (e: any) {
      setError(e.message || 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (e: any) {
      setError(e.message || 'Failed to mark all as read');
    }
  };

  // Helper: get icon and navigation target by type
  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'booking': return { icon: 'calendar-check', color: currentTheme.colors.primary, target: 'BookingDetails' };
      case 'payment': return { icon: 'credit-card', color: currentTheme.colors.secondary, target: 'BookingPayment' };
      case 'message': return { icon: 'message-text', color: currentTheme.colors.primary, target: 'ChatScreen' };
      case 'system': return { icon: 'bell', color: currentTheme.colors.warning, target: null };
      default: return { icon: 'bell-outline', color: currentTheme.colors.text.secondary, target: null };
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <VStack space="lg" style={{ flex: 1, padding: currentTheme.spacing.md }}>
        <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
          Notifications
        </Text>
        <Button action="primary" onPress={handleMarkAllAsRead} style={{ marginBottom: currentTheme.spacing.sm }}>
          <ButtonText>Mark All as Read</ButtonText>
        </Button>
        <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
        {loading ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Spinner size="large" />
          </Box>
        ) : error ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text size="md" style={{ color: currentTheme.colors.error }}>{error}</Text>
            <Button action="primary" onPress={fetchNotifications} style={{ marginTop: currentTheme.spacing.md }}>
              <ButtonText>Retry</ButtonText>
            </Button>
          </Box>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
          >
            <VStack space="md">
              {notifications.length === 0 ? (
                <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>No notifications found.</Text>
              ) : (
                notifications.map((notif: any) => {
                  const { icon, color, target } = getNotifIcon(notif.type);
                  return (
                    <Card
                      key={notif.id || notif._id}
                      style={{ padding: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.card, marginBottom: currentTheme.spacing.sm, backgroundColor: notif.read ? currentTheme.colors.card : `${currentTheme.colors.primary}10` }}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel={`View notification ${notif.title}`}
                      onPress={() => {
                        if (target && notif.targetId) {
                          navigation.navigate(target, { id: notif.targetId });
                        }
                      }}
                    >
                      <HStack space="md" style={{ alignItems: 'center' }}>
                        <MaterialCommunityIcons name={icon} size={28} color={color} />
                        <VStack space="xs" style={{ flex: 1 }}>
                          <Text size="lg" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>{notif.title}</Text>
                          <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>{notif.body || notif.message}</Text>
                          <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>{new Date(notif.createdAt).toLocaleString()}</Text>
                          {!notif.read && (
                            <Button action="secondary" variant="outline" size="sm" onPress={() => handleMarkAsRead(notif.id || notif._id)}>
                              <ButtonText>Mark as Read</ButtonText>
                            </Button>
                          )}
                        </VStack>
                      </HStack>
                    </Card>
                  );
                })
              )}
            </VStack>
          </ScrollView>
        )}
      </VStack>
    </SafeAreaView>
  );
} 