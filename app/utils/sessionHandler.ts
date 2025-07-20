import { Alert } from 'react-native';
import { logoutUser } from '../store/slices/authSlice';
import { ERROR_MESSAGES } from './config';

/**
 * Global session expiration handler
 * This utility handles session expiration across the entire app
 */
export class SessionHandler {
  private static dispatch: any = null;

  /**
   * Initialize session handler with Redux dispatch
   */
  static initialize(dispatch: any) {
    SessionHandler.dispatch = dispatch;
  }

  /**
   * Check if error indicates session expiration
   */
  static isSessionExpired(error: any): boolean {
    const errorMessage = error?.message || '';
    return (
      errorMessage.includes('Session expired') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('UNAUTHORIZED') ||
      errorMessage.includes('Please login again') ||
      errorMessage === ERROR_MESSAGES.UNAUTHORIZED
    );
  }

  /**
   * Handle session expiration - logout user and show alert
   */
  static async handleSessionExpiration(error: any): Promise<boolean> {
    if (!SessionHandler.isSessionExpired(error)) {
      return false;
    }

    console.log('🔐 Session expired - handling logout');

    if (SessionHandler.dispatch) {
      try {
        // Dispatch logout to clear auth state and redirect to login
        await SessionHandler.dispatch(logoutUser());
        
        // Show alert to inform user
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again to continue.',
          [
            {
              text: 'OK',
              style: 'default',
            }
          ],
          { cancelable: false }
        );
        
        return true;
      } catch (logoutError) {
        console.error('Failed to logout on session expiration:', logoutError);
      }
    } else {
      console.warn('SessionHandler not initialized with dispatch');
    }

    return false;
  }

  /**
   * Wrapper for async operations that might have session expiration
   */
  static async withSessionHandling<T>(
    operation: () => Promise<T>,
    onSessionExpired?: () => void
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      const handled = await SessionHandler.handleSessionExpiration(error);
      if (handled) {
        onSessionExpired?.();
        return null;
      }
      throw error;
    }
  }
}

/**
 * Helper function for thunks to handle session expiration
 */
export const handleSessionExpirationInThunk = (error: any, dispatch: any): boolean => {
  SessionHandler.initialize(dispatch);
  return SessionHandler.isSessionExpired(error);
};

export default SessionHandler;
