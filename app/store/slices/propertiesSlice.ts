// Properties slice for simple store
import type { Property, PropertiesState, SearchFilters } from '../../types';

// Initial state
export const initialPropertiesState: PropertiesState = {
  properties: [],
  currentProperty: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
  },
};

// Action types
export const PROPERTIES_ACTION_TYPES = {
  FETCH_PROPERTIES_REQUEST: 'FETCH_PROPERTIES_REQUEST',
  FETCH_PROPERTIES_SUCCESS: 'FETCH_PROPERTIES_SUCCESS',
  FETCH_PROPERTIES_FAILURE: 'FETCH_PROPERTIES_FAILURE',
  FETCH_PROPERTY_BY_ID_REQUEST: 'FETCH_PROPERTY_BY_ID_REQUEST',
  FETCH_PROPERTY_BY_ID_SUCCESS: 'FETCH_PROPERTY_BY_ID_SUCCESS',
  FETCH_PROPERTY_BY_ID_FAILURE: 'FETCH_PROPERTY_BY_ID_FAILURE',
  SEARCH_PROPERTIES_REQUEST: 'SEARCH_PROPERTIES_REQUEST',
  SEARCH_PROPERTIES_SUCCESS: 'SEARCH_PROPERTIES_SUCCESS',
  SEARCH_PROPERTIES_FAILURE: 'SEARCH_PROPERTIES_FAILURE',
  SET_CURRENT_PROPERTY: 'SET_CURRENT_PROPERTY',
  UPDATE_FILTERS: 'UPDATE_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  CLEAR_PROPERTIES: 'CLEAR_PROPERTIES',
  ADD_TO_FAVORITES: 'ADD_TO_FAVORITES',
  REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES',
  CLEAR_PROPERTIES_ERROR: 'CLEAR_PROPERTIES_ERROR',
} as const;

// Action creators
export const propertiesActions = {
  fetchPropertiesRequest: () => ({
    type: PROPERTIES_ACTION_TYPES.FETCH_PROPERTIES_REQUEST,
  }),

  fetchPropertiesSuccess: (properties: Property[], pagination: any) => ({
    type: PROPERTIES_ACTION_TYPES.FETCH_PROPERTIES_SUCCESS,
    payload: { properties, pagination },
  }),

  fetchPropertiesFailure: (error: string) => ({
    type: PROPERTIES_ACTION_TYPES.FETCH_PROPERTIES_FAILURE,
    payload: error,
  }),

  fetchPropertyByIdRequest: () => ({
    type: PROPERTIES_ACTION_TYPES.FETCH_PROPERTY_BY_ID_REQUEST,
  }),

  fetchPropertyByIdSuccess: (property: Property) => ({
    type: PROPERTIES_ACTION_TYPES.FETCH_PROPERTY_BY_ID_SUCCESS,
    payload: property,
  }),

  fetchPropertyByIdFailure: (error: string) => ({
    type: PROPERTIES_ACTION_TYPES.FETCH_PROPERTY_BY_ID_FAILURE,
    payload: error,
  }),

  searchPropertiesRequest: () => ({
    type: PROPERTIES_ACTION_TYPES.SEARCH_PROPERTIES_REQUEST,
  }),

  searchPropertiesSuccess: (properties: Property[], pagination: any) => ({
    type: PROPERTIES_ACTION_TYPES.SEARCH_PROPERTIES_SUCCESS,
    payload: { properties, pagination },
  }),

  searchPropertiesFailure: (error: string) => ({
    type: PROPERTIES_ACTION_TYPES.SEARCH_PROPERTIES_FAILURE,
    payload: error,
  }),

  setCurrentProperty: (property: Property | null) => ({
    type: PROPERTIES_ACTION_TYPES.SET_CURRENT_PROPERTY,
    payload: property,
  }),

  updateFilters: (filters: SearchFilters) => ({
    type: PROPERTIES_ACTION_TYPES.UPDATE_FILTERS,
    payload: filters,
  }),

  clearFilters: () => ({
    type: PROPERTIES_ACTION_TYPES.CLEAR_FILTERS,
  }),

  clearProperties: () => ({
    type: PROPERTIES_ACTION_TYPES.CLEAR_PROPERTIES,
  }),

  addToFavorites: (propertyId: string) => ({
    type: PROPERTIES_ACTION_TYPES.ADD_TO_FAVORITES,
    payload: propertyId,
  }),

  removeFromFavorites: (propertyId: string) => ({
    type: PROPERTIES_ACTION_TYPES.REMOVE_FROM_FAVORITES,
    payload: propertyId,
  }),

  clearPropertiesError: () => ({
    type: PROPERTIES_ACTION_TYPES.CLEAR_PROPERTIES_ERROR,
  }),
};

// Reducer
export const propertiesReducer = (
  state: PropertiesState = initialPropertiesState,
  action: any
): PropertiesState => {
  switch (action.type) {
    case PROPERTIES_ACTION_TYPES.FETCH_PROPERTIES_REQUEST:
    case PROPERTIES_ACTION_TYPES.FETCH_PROPERTY_BY_ID_REQUEST:
    case PROPERTIES_ACTION_TYPES.SEARCH_PROPERTIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case PROPERTIES_ACTION_TYPES.FETCH_PROPERTIES_SUCCESS:
    case PROPERTIES_ACTION_TYPES.SEARCH_PROPERTIES_SUCCESS:
      return {
        ...state,
        loading: false,
        properties: action.payload.properties,
        pagination: action.payload.pagination,
        error: null,
      };

    case PROPERTIES_ACTION_TYPES.FETCH_PROPERTY_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        currentProperty: action.payload,
        error: null,
      };

    case PROPERTIES_ACTION_TYPES.FETCH_PROPERTIES_FAILURE:
    case PROPERTIES_ACTION_TYPES.FETCH_PROPERTY_BY_ID_FAILURE:
    case PROPERTIES_ACTION_TYPES.SEARCH_PROPERTIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case PROPERTIES_ACTION_TYPES.SET_CURRENT_PROPERTY:
      return {
        ...state,
        currentProperty: action.payload,
      };

    case PROPERTIES_ACTION_TYPES.UPDATE_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case PROPERTIES_ACTION_TYPES.CLEAR_FILTERS:
      return {
        ...state,
        filters: {},
      };

    case PROPERTIES_ACTION_TYPES.CLEAR_PROPERTIES:
      return {
        ...state,
        properties: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          hasMore: false,
        },
      };

    case PROPERTIES_ACTION_TYPES.ADD_TO_FAVORITES:
    case PROPERTIES_ACTION_TYPES.REMOVE_FROM_FAVORITES:
      // Update properties list to reflect favorite status
      return {
        ...state,
        properties: state.properties.map((property: Property) =>
          property._id === action.payload
            ? { ...property }  // You might want to add a 'isFavorite' field to Property type
            : property
        ),
      };

    case PROPERTIES_ACTION_TYPES.CLEAR_PROPERTIES_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Selectors
export const selectProperties = (state: { properties: PropertiesState }) => state.properties;
export const selectPropertyList = (state: { properties: PropertiesState }) => state.properties.properties;
export const selectCurrentProperty = (state: { properties: PropertiesState }) => state.properties.currentProperty;
export const selectPropertiesLoading = (state: { properties: PropertiesState }) => state.properties.loading;
export const selectPropertiesError = (state: { properties: PropertiesState }) => state.properties.error;
export const selectPropertiesFilters = (state: { properties: PropertiesState }) => state.properties.filters;
export const selectPropertiesPagination = (state: { properties: PropertiesState }) => state.properties.pagination;

export default propertiesReducer;
