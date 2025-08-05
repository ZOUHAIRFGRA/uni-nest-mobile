import { useEffect, useState } from 'react';
import { pusherService } from '../services/pusherService';
import { pushNotificationService } from '../services/pushNotificationService';

export function useNotifications() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        console.log('🔔 [NOTIFICATIONS] Initializing...');
        await pushNotificationService.initialize();
        await pusherService.initialize();
        setIsConnected(pusherService.isConnectedToPusher());
        console.log('✅ [NOTIFICATIONS] Initialized successfully');
      } catch (error) {
        console.error('❌ [NOTIFICATIONS] Initialization failed:', error);
      }
    };

    initializeNotifications();
  }, []);

  const sendTestNotification = async () => {
    try {
      await pushNotificationService.sendTestNotification();
    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Test failed:', error);
      throw error;
    }
  };

  return {
    sendTestNotification,
    isConnected,
  };
}
