import Pusher from 'pusher-js';
import { authService } from './authService';
import { apiClient } from './apiClient';
import { StorageService } from './storageService';

// Pusher configuration
const PUSHER_CONFIG = {
  key: process.env.EXPO_PUBLIC_PUSHER_KEY || '',
  cluster: process.env.EXPO_PUBLIC_PUSHER_CLUSTER || 'eu',
  useTLS: true,
  authEndpoint: `${process.env.EXPO_PUBLIC_API_URL}/api/pusher/auth`,
  auth: {
    headers: {
      Authorization: '', // Will be set dynamically
    },
  },
};

class PusherService {
  private pusher: Pusher | null = null;
  private userChannel: any = null;
  private isConnected = false;
  private userId: string | null = null;

  /**
   * Initialize Pusher connection
   */
  async initialize() {
    try {
      const [userData, token] = await Promise.all([
        authService.getStoredUserData(),
        StorageService.getAuthToken(),
      ]);
      console.log("ℹ️ℹ️ℹ️[TOKEN]", token)



      if (!userData || !token || !userData.id) {
        console.log('❌ [PUSHER] No auth data or token found');
        return;
      }

      this.userId = userData.id;

      // Set auth header
      PUSHER_CONFIG.auth.headers.Authorization = `Bearer ${token}`;

      // Initialize Pusher
      this.pusher = new Pusher(PUSHER_CONFIG.key, PUSHER_CONFIG);

      // Connection state listeners
      this.pusher.connection.bind('connected', () => {
        console.log('✅ [PUSHER] Connected successfully');
        this.isConnected = true;
      });

      this.pusher.connection.bind('disconnected', () => {
        console.log('⚠️ [PUSHER] Disconnected');
        this.isConnected = false;
      });

      this.pusher.connection.bind('error', (error: any) => {
        console.error('❌ [PUSHER] Connection error:', error);
        this.isConnected = false;
      });

      // Subscribe to user channel
      await this.subscribeToUserChannel();

      console.log('🚀 [PUSHER] Service initialized');
    } catch (error) {
      console.error('❌ [PUSHER] Initialization failed:', error);
    }
  }

  /**
   * Subscribe to user-specific channel
   */
  private async subscribeToUserChannel() {
    if (!this.pusher || !this.userId) return;

    try {
      this.userChannel = this.pusher.subscribe(`user-${this.userId}`);

      this.userChannel.bind('pusher:subscription_succeeded', () => {
        console.log(`✅ [PUSHER] Subscribed to user-${this.userId}`);
      });

      this.userChannel.bind('pusher:subscription_error', (error: any) => {
        console.error(`❌ [PUSHER] Subscription error for user-${this.userId}:`, error);
      });

    } catch (error) {
      console.error('❌ [PUSHER] Failed to subscribe to user channel:', error);
    }
  }

  /**
   * Subscribe to notification events
   */
  subscribeToNotifications(callback: (notification: any) => void) {
    if (!this.userChannel) {
      console.warn('⚠️ [PUSHER] User channel not available for notifications');
      return;
    }

    this.userChannel.bind('new_notification', (data: any) => {
      console.log('🔔 [PUSHER] New notification received:', data);
      callback(data.notification);
    });

    console.log('👂 [PUSHER] Listening for notifications');
  }

  /**
   * Subscribe to message events
   */
  subscribeToMessages(callback: (messageData: any) => void) {
    if (!this.userChannel) {
      console.warn('⚠️ [PUSHER] User channel not available for messages');
      return;
    }

    this.userChannel.bind('new_message', (data: any) => {
      console.log('💬 [PUSHER] New message received:', data);
      callback(data);
    });

    console.log('👂 [PUSHER] Listening for messages');
  }

  /**
   * Subscribe to matching updates
   */
  subscribeToMatching(callback: (matchData: any) => void) {
    if (!this.userChannel) {
      console.warn('⚠️ [PUSHER] User channel not available for matching');
      return;
    }

    this.userChannel.bind('matching-update', (data: any) => {
      console.log('🎯 [PUSHER] Matching update received:', data);
      callback(data);
    });

    console.log('👂 [PUSHER] Listening for matching updates');
  }

  /**
   * Subscribe to booking updates
   */
  subscribeToBookings(callback: (bookingData: any) => void) {
    if (!this.userChannel) {
      console.warn('⚠️ [PUSHER] User channel not available for bookings');
      return;
    }

    this.userChannel.bind('booking-update', (data: any) => {
      console.log('🏠 [PUSHER] Booking update received:', data);
      callback(data);
    });

    console.log('👂 [PUSHER] Listening for booking updates');
  }

  /**
   * Subscribe to payment status updates
   */
  subscribeToPayments(callback: (paymentData: any) => void) {
    if (!this.userChannel) {
      console.warn('⚠️ [PUSHER] User channel not available for payments');
      return;
    }

    this.userChannel.bind('payment-status', (data: any) => {
      console.log('💳 [PUSHER] Payment update received:', data);
      callback(data);
    });

    console.log('👂 [PUSHER] Listening for payment updates');
  }

  /**
   * Subscribe to chat channel for real-time messaging
   */
  subscribeToChatChannel(chatId: string, callbacks: {
    onMessage?: (data: any) => void;
    onTyping?: (data: any) => void;
    onUserOnline?: (data: any) => void;
  }) {
    if (!this.pusher) {
      console.warn('⚠️ [PUSHER] Not connected, cannot subscribe to chat');
      return null;
    }

    try {
      const chatChannel = this.pusher.subscribe(`chat-${chatId}`);

      chatChannel.bind('pusher:subscription_succeeded', () => {
        console.log(`✅ [PUSHER] Subscribed to chat-${chatId}`);
      });

      if (callbacks.onMessage) {
        chatChannel.bind('message-received', callbacks.onMessage);
      }

      if (callbacks.onTyping) {
        chatChannel.bind('user_typing', callbacks.onTyping);
      }

      if (callbacks.onUserOnline) {
        chatChannel.bind('user_online', callbacks.onUserOnline);
      }

      return chatChannel;
    } catch (error) {
      console.error(`❌ [PUSHER] Failed to subscribe to chat-${chatId}:`, error);
      return null;
    }
  }

  /**
   * Unsubscribe from chat channel
   */
  unsubscribeFromChatChannel(chatId: string) {
    if (!this.pusher) return;

    try {
      this.pusher.unsubscribe(`chat-${chatId}`);
      console.log(`🔌 [PUSHER] Unsubscribed from chat-${chatId}`);
    } catch (error) {
      console.error(`❌ [PUSHER] Failed to unsubscribe from chat-${chatId}:`, error);
    }
  }

  /**
   * Get connection status
   */
  isConnectedToPusher(): boolean {
    return this.isConnected && this.pusher?.connection.state === 'connected';
  }

  /**
   * Reconnect to Pusher
   */
  async reconnect() {
    console.log('🔄 [PUSHER] Attempting to reconnect...');
    
    if (this.pusher) {
      this.pusher.disconnect();
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await this.initialize();
  }

  /**
   * Disconnect from Pusher
   */
  disconnect() {
    if (this.pusher) {
      console.log('🔌 [PUSHER] Disconnecting...');
      this.pusher.disconnect();
      this.pusher = null;
      this.userChannel = null;
      this.isConnected = false;
      this.userId = null;
    }
  }

  /**
   * Test notification (for development)
   */
  async sendTestNotification() {
    try {
      // This now uses the apiClient for consistency
      const result = await apiClient.post('/notifications/test', {
        type: 'test',
        title: 'Test Notification',
        message: 'This is a test notification from the app!',
      });

      console.log('✅ [PUSHER] Test notification sent:', result);
      return result;
    } catch (error) {
      console.error('❌ [PUSHER] Failed to send test notification:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const pusherService = new PusherService();
export default pusherService;