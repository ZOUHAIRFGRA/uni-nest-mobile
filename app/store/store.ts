import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import reducers
import authReducer from './slices/authSlice';
import propertiesSlice from './slices/propertiesSlice';
import matchesReducer from './slices/matchesSliceRedux';
import bookingsSlice from './slices/bookingsSlice';
import chatsSlice from './slices/chatsSlice';
import notificationsSlice from './slices/notificationsSliceRedux';
import uiSlice from './slices/uiSlice';

// Configure store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesSlice,
    matches: matchesReducer,
    bookings: bookingsSlice,
    chats: chatsSlice,
    notifications: notificationsSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
