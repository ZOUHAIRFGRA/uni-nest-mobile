// React hooks for the app store
import { useEffect, useState, useCallback } from 'react';
import { store } from './index';
import type { RootState } from '../types';

// Hook to use store state with selector
export function useSelector<TSelected>(
  selector: (state: RootState) => TSelected
): TSelected {
  const [state, setState] = useState(() => selector(store.getState()));

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState(selector(store.getState()));
    });

    return unsubscribe;
  }, [selector]);

  return state;
}

// Hook to dispatch actions
export function useDispatch() {
  return useCallback((action: any) => {
    return store.dispatch(action);
  }, []);
}

// Hook to get the current state
export function useStore() {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState(store.getState());
    });

    return unsubscribe;
  }, []);

  return state;
}

// Specific selector hooks for convenience
export function useAuth() {
  return useSelector(state => state.auth);
}

export function useProperties() {
  return useSelector(state => state.properties);
}

export function useMatches() {
  return useSelector(state => state.matches);
}

export function useBookings() {
  return useSelector(state => state.bookings);
}

export function useChats() {
  return useSelector(state => state.chats);
}

export function useNotifications() {
  return useSelector(state => state.notifications);
}

export function useUI() {
  return useSelector(state => state.ui);
}

// Combined hooks with dispatch for convenience
export function useAuthActions() {
  const auth = useAuth();
  const dispatch = useDispatch();

  return {
    ...auth,
    dispatch,
  };
}

export function usePropertiesActions() {
  const properties = useProperties();
  const dispatch = useDispatch();

  return {
    ...properties,
    dispatch,
  };
}

export function useMatchesActions() {
  const matches = useMatches();
  const dispatch = useDispatch();

  return {
    ...matches,
    dispatch,
  };
}

export function useBookingsActions() {
  const bookings = useBookings();
  const dispatch = useDispatch();

  return {
    ...bookings,
    dispatch,
  };
}

export function useChatsActions() {
  const chats = useChats();
  const dispatch = useDispatch();

  return {
    ...chats,
    dispatch,
  };
}

export function useNotificationsActions() {
  const notifications = useNotifications();
  const dispatch = useDispatch();

  return {
    ...notifications,
    dispatch,
  };
}

export function useUIActions() {
  const ui = useUI();
  const dispatch = useDispatch();

  return {
    ...ui,
    dispatch,
  };
}

// Utility hooks
export function useIsAuthenticated() {
  return useSelector(state => state.auth.isAuthenticated);
}

export function useCurrentUser() {
  return useSelector(state => state.auth.user);
}

export function useAuthLoading() {
  return useSelector(state => state.auth.isLoading);
}

export function useAuthError() {
  return useSelector(state => state.auth.error);
}

export function usePropertiesList() {
  return useSelector(state => state.properties.properties);
}

export function useCurrentProperty() {
  return useSelector(state => state.properties.currentProperty);
}

export function usePropertiesLoading() {
  return useSelector(state => state.properties.loading);
}

export function useUnreadNotificationsCount() {
  return useSelector(state => state.notifications.unreadCount);
}

export function useCurrentTheme() {
  return useSelector(state => state.ui.theme);
}

export function useNetworkStatus() {
  return useSelector(state => state.ui.isNetworkConnected);
}

export default {
  useSelector,
  useDispatch,
  useStore,
  useAuth,
  useProperties,
  useMatches,
  useBookings,
  useChats,
  useNotifications,
  useUI,
  useAuthActions,
  usePropertiesActions,
  useMatchesActions,
  useBookingsActions,
  useChatsActions,
  useNotificationsActions,
  useUIActions,
  useIsAuthenticated,
  useCurrentUser,
  useAuthLoading,
  useAuthError,
  usePropertiesList,
  useCurrentProperty,
  usePropertiesLoading,
  useUnreadNotificationsCount,
  useCurrentTheme,
  useNetworkStatus,
};
