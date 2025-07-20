// UI slice for simple store
import type { UIState } from '../../types';

// Initial state
export const initialUIState: UIState = {
  theme: 'light',
  activeTab: 'home',
  isNetworkConnected: true,
  refreshing: false,
  modals: {},
};

// Action types
export const UI_ACTION_TYPES = {
  SET_THEME: 'SET_THEME',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_NETWORK_STATUS: 'SET_NETWORK_STATUS',
  SET_REFRESHING: 'SET_REFRESHING',
  TOGGLE_MODAL: 'TOGGLE_MODAL',
  CLOSE_ALL_MODALS: 'CLOSE_ALL_MODALS',
  SET_LOADING: 'SET_LOADING',
  CLEAR_LOADING: 'CLEAR_LOADING',
} as const;

// Action creators
export const uiActions = {
  setTheme: (theme: 'light' | 'dark') => ({
    type: UI_ACTION_TYPES.SET_THEME,
    payload: theme,
  }),

  setActiveTab: (tab: string) => ({
    type: UI_ACTION_TYPES.SET_ACTIVE_TAB,
    payload: tab,
  }),

  setNetworkStatus: (isConnected: boolean) => ({
    type: UI_ACTION_TYPES.SET_NETWORK_STATUS,
    payload: isConnected,
  }),

  setRefreshing: (refreshing: boolean) => ({
    type: UI_ACTION_TYPES.SET_REFRESHING,
    payload: refreshing,
  }),

  toggleModal: (modalName: string, isOpen: boolean) => ({
    type: UI_ACTION_TYPES.TOGGLE_MODAL,
    payload: { modalName, isOpen },
  }),

  closeAllModals: () => ({
    type: UI_ACTION_TYPES.CLOSE_ALL_MODALS,
  }),

  setLoading: (loadingKey: string, isLoading: boolean) => ({
    type: UI_ACTION_TYPES.SET_LOADING,
    payload: { loadingKey, isLoading },
  }),

  clearLoading: () => ({
    type: UI_ACTION_TYPES.CLEAR_LOADING,
  }),
};

// Reducer
export const uiReducer = (state: UIState = initialUIState, action: any): UIState => {
  switch (action.type) {
    case UI_ACTION_TYPES.SET_THEME:
      return {
        ...state,
        theme: action.payload,
      };

    case UI_ACTION_TYPES.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload,
      };

    case UI_ACTION_TYPES.SET_NETWORK_STATUS:
      return {
        ...state,
        isNetworkConnected: action.payload,
      };

    case UI_ACTION_TYPES.SET_REFRESHING:
      return {
        ...state,
        refreshing: action.payload,
      };

    case UI_ACTION_TYPES.TOGGLE_MODAL:
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.modalName]: action.payload.isOpen,
        },
      };

    case UI_ACTION_TYPES.CLOSE_ALL_MODALS:
      return {
        ...state,
        modals: {},
      };

    case UI_ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        modals: {
          ...state.modals,
          [`loading_${action.payload.loadingKey}`]: action.payload.isLoading,
        },
      };

    case UI_ACTION_TYPES.CLEAR_LOADING:
      const clearedModals = Object.keys(state.modals).reduce((acc, key) => {
        if (!key.startsWith('loading_')) {
          acc[key] = state.modals[key];
        }
        return acc;
      }, {} as { [key: string]: boolean });
      
      return {
        ...state,
        modals: clearedModals,
      };

    default:
      return state;
  }
};

// Selectors
export const selectUI = (state: { ui: UIState }) => state.ui;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectActiveTab = (state: { ui: UIState }) => state.ui.activeTab;
export const selectNetworkStatus = (state: { ui: UIState }) => state.ui.isNetworkConnected;
export const selectRefreshing = (state: { ui: UIState }) => state.ui.refreshing;
export const selectModals = (state: { ui: UIState }) => state.ui.modals;
export const selectModalOpen = (modalName: string) => (state: { ui: UIState }) => 
  state.ui.modals[modalName] || false;
export const selectIsLoading = (loadingKey: string) => (state: { ui: UIState }) => 
  state.ui.modals[`loading_${loadingKey}`] || false;

export default uiReducer;
