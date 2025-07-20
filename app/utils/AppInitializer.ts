import { authService } from '../services/authService';
import { StorageService } from '../services/storageService';

/**
 * Comprehensive app initialization utility
 * Handles loading user data, preferences, and app settings on startup
 */
export class AppInitializer {
  /**
   * Initialize all app data for authenticated users
   */
  static async initializeUserData(): Promise<{
    preferences: Record<string, any> | null;
    searchHistory: string[];
    theme: 'light' | 'dark' | null;
    onboardingCompleted: boolean;
  }> {
    try {
      console.log('Loading user-specific data...');
      
      const [preferences, searchHistory, theme, onboardingCompleted] = await Promise.all([
        authService.getUserPreferences(),
        StorageService.getSearchHistory(),
        StorageService.getTheme(),
        StorageService.getOnboardingCompleted()
      ]);

      console.log('User data loaded:', {
        hasPreferences: !!preferences,
        searchHistoryCount: searchHistory.length,
        theme,
        onboardingCompleted
      });

      return {
        preferences,
        searchHistory,
        theme,
        onboardingCompleted
      };
    } catch (error) {
      console.error('Error loading user data:', error);
      return {
        preferences: null,
        searchHistory: [],
        theme: null,
        onboardingCompleted: false
      };
    }
  }

  /**
   * Set default preferences for new users
   */
  static async setDefaultPreferences(): Promise<void> {
    try {
      const defaultPreferences = {
        theme: 'light',
        notifications: {
          push: true,
          email: true,
          marketing: false
        },
        privacy: {
          showProfile: true,
          showLocation: false
        },
        filters: {
          maxDistance: 10,
          budget: { min: 0, max: 2000 }
        }
      };

      await authService.saveUserPreferences(defaultPreferences);
      console.log('Default preferences set for new user');
    } catch (error) {
      console.error('Error setting default preferences:', error);
    }
  }

  /**
   * Apply user preferences to app state
   */
  static applyUserPreferences(preferences: Record<string, any> | null): void {
    if (!preferences) return;

    try {
      // Apply theme
      if (preferences.theme) {
        console.log('Applying theme:', preferences.theme);
        // TODO: Apply theme to app
      }

      // Apply notification settings
      if (preferences.notifications) {
        console.log('Applying notification settings:', preferences.notifications);
        // TODO: Configure notification preferences
      }

      // Apply privacy settings
      if (preferences.privacy) {
        console.log('Applying privacy settings:', preferences.privacy);
        // TODO: Configure privacy settings
      }

      console.log('User preferences applied successfully');
    } catch (error) {
      console.error('Error applying user preferences:', error);
    }
  }

  /**
   * Check if this is user's first app launch
   */
  static async isFirstLaunch(): Promise<boolean> {
    try {
      const onboardingCompleted = await StorageService.getOnboardingCompleted();
      return !onboardingCompleted;
    } catch (error) {
      console.error('Error checking first launch:', error);
      return true;
    }
  }

  /**
   * Mark app as launched and save initial settings
   */
  static async markFirstLaunchComplete(): Promise<void> {
    try {
      await StorageService.saveOnboardingCompleted();
      console.log('First launch marked as complete');
    } catch (error) {
      console.error('Error marking first launch complete:', error);
    }
  }

  /**
   * Full app initialization flow
   */
  static async initializeApp(isAuthenticated: boolean): Promise<void> {
    try {
      console.log('Starting app initialization...');

      // Check if this is first launch
      const isFirst = await this.isFirstLaunch();
      if (isFirst) {
        await this.markFirstLaunchComplete();
      }

      // If user is authenticated, load their data
      if (isAuthenticated) {
        const userData = await this.initializeUserData();
        
        // If no preferences exist, set defaults
        if (!userData.preferences) {
          await this.setDefaultPreferences();
          userData.preferences = await authService.getUserPreferences();
        }

        // Apply theme if available
        if (userData.theme) {
          console.log('Applying saved theme:', userData.theme);
          // TODO: Apply theme to app
        }

        // Apply preferences to app
        this.applyUserPreferences(userData.preferences);
      }

      console.log('App initialization complete');
    } catch (error) {
      console.error('Error during app initialization:', error);
    }
  }
}

/**
 * Example usage in your MainAppNavigator:
 * 
 * ```typescript
 * useEffect(() => {
 *   const initializeApp = async () => {
 *     if (!isAuthInitializing) {
 *       await AppInitializer.initializeApp(auth.isAuthenticated);
 *       setIsAppReady(true);
 *     }
 *   };
 *   initializeApp();
 * }, [auth.isAuthenticated, isAuthInitializing]);
 * ```
 */
