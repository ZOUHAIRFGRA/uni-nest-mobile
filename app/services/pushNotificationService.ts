import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { pusherService } from './pusherService';
import { apiClient } from './apiClient';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


export interface PushNotificationData {
  type: string;
  title: string;
  message: string;
  data?: any;
  actionUrl?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListeners: Array<(notification: any) => void> = [];

  /**
   * Initialize push notifications
   */
  async initialize() {
    try {
      // Request permissions
      const permission = await this.requestPermissions();
      if (!permission) {
        console.warn('⚠️ [PUSH] Notification permissions denied');
        return;
      }

      // Get Expo push token
      await this.registerForPushNotificationsAsync();

      // Set up notification listeners
      this.setupNotificationListeners();

      console.log('✅ [PUSH] Service initialized successfully');
    } catch (error) {
      console.error('❌ [PUSH] Initialization failed:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.warn('⚠️ [PUSH] Must use physical device for push notifications');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ [PUSH] Permission not granted for push notifications');
        return false;
      }

      console.log('✅ [PUSH] Permissions granted');
      return true;
    } catch (error) {
      console.error('❌ [PUSH] Permission request failed:', error);
      return false;
    }
  }

  /**
   * Register for push notifications and get Expo push token
   */
  async registerForPushNotificationsAsync() {
    try {
      if (!Device.isDevice) {
        throw new Error('Must use physical device for push notifications');
      }

      // *** FIX: Removed projectId for non-EAS projects ***
      const token = await Notifications.getExpoPushTokenAsync();

      this.expoPushToken = token.data;
      console.log('📱 [PUSH] Expo push token:', this.expoPushToken);

      // Configure for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Save token to backend (optional for future native builds)
      await this.saveTokenToBackend(this.expoPushToken);

    } catch (error) {
      console.error('❌ [PUSH] Token registration failed:', error);
    }
  }

  /**
   * Save push token to backend (for future use)
   */
  private async saveTokenToBackend(token: string) {
    try {
      // Use apiClient for consistency and automatic auth handling
      await apiClient.post('/users/push-token', { pushToken: token });
      console.log('✅ [PUSH] Token saved to backend using apiClient');
    } catch (error) {
      console.error('❌ [PUSH] Failed to save token to backend:', error);
    }
  }

  /**
   * Set up notification listeners
   */
  private setupNotificationListeners() {
    // Notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('🔔 [PUSH] Notification received (foreground):', notification);
      this.notifyListeners(notification);
    });

    // Notification response (user tapped notification)
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 [PUSH] Notification tapped:', response);
      this.handleNotificationTap(response);
    });
  }

  /**
   * Handle notification tap
   */
  private handleNotificationTap(response: any) {
    const { notification } = response;
    const data = notification.request.content.data;

    // Handle navigation based on notification type
    if (data?.actionUrl) {
      // Navigate to specific screen
      console.log('📱 [PUSH] Navigating to:', data.actionUrl);
      // Add navigation logic here
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(notificationData: PushNotificationData) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.message,
          data: notificationData.data || {},
          sound: true,
        },
        trigger: null, // Show immediately
      });

      console.log('📬 [PUSH] Local notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ [PUSH] Failed to schedule notification:', error);
    }
  }

  /**
   * Show in-app notification banner
   */
  async showInAppNotification(notificationData: PushNotificationData) {
    // This will be handled by the UI components
    this.notifyListeners({
      request: {
        content: {
          title: notificationData.title,
          body: notificationData.message,
          data: notificationData.data || {},
        }
      },
      type: 'in-app'
    });
  }

  /**
   * Add notification listener
   */
  addNotificationListener(callback: (notification: any) => void) {
    this.notificationListeners.push(callback);
  }

  /**
   * Remove notification listener
   */
  removeNotificationListener(callback: (notification: any) => void) {
    this.notificationListeners = this.notificationListeners.filter(
      listener => listener !== callback
    );
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(notification: any) {
    this.notificationListeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('❌ [PUSH] Listener error:', error);
      }
    });
  }

  /**
   * Send test notification
   */
  async sendTestNotification() {
    const testData: PushNotificationData = {
      type: 'test',
      title: '🧪 Test Notification',
      message: 'This is a test notification! Your push notifications are working.',
      priority: 'normal',
      data: {
        testId: Date.now().toString(),
        source: 'settings',
      },
    };

    // Show local notification
    await this.scheduleLocalNotification(testData);

    // Also trigger via Pusher for real-time testing
    try {
      await pusherService.sendTestNotification();
    } catch (error) {
      console.warn('⚠️ [PUSH] Pusher test failed, showing local only');
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🗑️ [PUSH] All notifications cancelled');
    } catch (error) {
      console.error('❌ [PUSH] Failed to cancel notifications:', error);
    }
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings() {
    try {
      const settings = await Notifications.getPermissionsAsync();
      return {
        granted: settings.granted,
        status: settings.status,
        expoPushToken: this.expoPushToken,
      };
    } catch (error) {
      console.error('❌ [PUSH] Failed to get settings:', error);
      return { granted: false, status: 'undetermined', expoPushToken: null };
    }
  }

  /**
   * Get Expo push token
   */
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;