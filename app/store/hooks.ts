// Redux Toolkit hooks
import { useAppSelector, useAppDispatch } from './store';
export { useAppDispatch as useDispatch, useAppSelector as useSelector } from './store';

// Specific selector hooks for convenience
export function useAuth() {
  return useAppSelector(state => state.auth);
}

export function useProperties() {
  return useAppSelector(state => state.properties);
}

export function useMatches() {
  return useAppSelector(state => state.matches);
}

export function useBookings() {
  return useAppSelector(state => state.bookings);
}

export function useChats() {
  return useAppSelector(state => state.chats);
}

export function useNotifications() {
  return useAppSelector(state => state.notifications);
}

export function useUI() {
  return useAppSelector(state => state.ui);
}

// Combined auth state and actions hook
export function useAuthActions() {
  const auth = useAuth();
  const dispatch = useAppDispatch();

  return {
    ...auth,
    dispatch,
  };
}

// Combined properties state and actions hook
export function usePropertiesActions() {
  const properties = useProperties();
  const dispatch = useAppDispatch();

  return {
    ...properties,
    dispatch,
  };
}

// Combined matches state and actions hook
export function useMatchesActions() {
  const matches = useMatches();
  const dispatch = useAppDispatch();

  return {
    ...matches,
    dispatch,
  };
}

// Combined bookings state and actions hook
export function useBookingsActions() {
  const bookings = useBookings();
  const dispatch = useAppDispatch();

  return {
    ...bookings,
    dispatch,
  };
}

// Combined chats state and actions hook
export function useChatsActions() {
  const chats = useChats();
  const dispatch = useAppDispatch();

  return {
    ...chats,
    dispatch,
  };
}

// Combined notifications state and actions hook
export function useNotificationsActions() {
  const notifications = useNotifications();
  const dispatch = useAppDispatch();

  return {
    ...notifications,
    dispatch,
  };
}

// Combined UI state and actions hook
export function useUIActions() {
  const ui = useUI();
  const dispatch = useAppDispatch();

  return {
    ...ui,
    dispatch,
  };
}
