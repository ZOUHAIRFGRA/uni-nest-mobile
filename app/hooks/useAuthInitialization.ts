import { useEffect } from 'react';
import { useDispatch, useSelector } from '../store/hooks';
import { initializeAuth, selectAuthLoading } from '../store/slices/authSlice';

/**
 * Hook to initialize authentication state from AsyncStorage on app startup
 * This hook should be called in your App component or main navigation component
 */
export const useAuthInitialization = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);

  useEffect(() => {
    // Initialize auth state from storage when app starts
    dispatch(initializeAuth());
  }, [dispatch]);

  return { isLoading };
};

/**
 * Example usage in App.tsx:
 * 
 * ```typescript
 * import { useAuthInitialization } from './hooks/useAuthInitialization';
 * 
 * export default function App() {
 *   const { isLoading } = useAuthInitialization();
 * 
 *   if (isLoading) {
 *     return <LoadingScreen />;
 *   }
 * 
 *   return (
 *     <NavigationContainer>
 *       <AppNavigator />
 *     </NavigationContainer>
 *   );
 * }
 * ```
 */
