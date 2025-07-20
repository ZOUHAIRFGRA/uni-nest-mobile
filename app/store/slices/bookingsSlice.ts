// Bookings slice for simple store
import type { Booking, BookingsState } from '../../types';

// Initial state
export const initialBookingsState: BookingsState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
};

// Action types
export const BOOKINGS_ACTION_TYPES = {
  FETCH_BOOKINGS_REQUEST: 'FETCH_BOOKINGS_REQUEST',
  FETCH_BOOKINGS_SUCCESS: 'FETCH_BOOKINGS_SUCCESS',
  FETCH_BOOKINGS_FAILURE: 'FETCH_BOOKINGS_FAILURE',
  CREATE_BOOKING_REQUEST: 'CREATE_BOOKING_REQUEST',
  CREATE_BOOKING_SUCCESS: 'CREATE_BOOKING_SUCCESS',
  CREATE_BOOKING_FAILURE: 'CREATE_BOOKING_FAILURE',
  UPDATE_BOOKING_REQUEST: 'UPDATE_BOOKING_REQUEST',
  UPDATE_BOOKING_SUCCESS: 'UPDATE_BOOKING_SUCCESS',
  UPDATE_BOOKING_FAILURE: 'UPDATE_BOOKING_FAILURE',
  SET_CURRENT_BOOKING: 'SET_CURRENT_BOOKING',
  CLEAR_BOOKINGS_ERROR: 'CLEAR_BOOKINGS_ERROR',
  CLEAR_BOOKINGS: 'CLEAR_BOOKINGS',
} as const;

// Action creators
export const bookingsActions = {
  fetchBookingsRequest: () => ({
    type: BOOKINGS_ACTION_TYPES.FETCH_BOOKINGS_REQUEST,
  }),

  fetchBookingsSuccess: (bookings: Booking[]) => ({
    type: BOOKINGS_ACTION_TYPES.FETCH_BOOKINGS_SUCCESS,
    payload: bookings,
  }),

  fetchBookingsFailure: (error: string) => ({
    type: BOOKINGS_ACTION_TYPES.FETCH_BOOKINGS_FAILURE,
    payload: error,
  }),

  createBookingRequest: () => ({
    type: BOOKINGS_ACTION_TYPES.CREATE_BOOKING_REQUEST,
  }),

  createBookingSuccess: (booking: Booking) => ({
    type: BOOKINGS_ACTION_TYPES.CREATE_BOOKING_SUCCESS,
    payload: booking,
  }),

  createBookingFailure: (error: string) => ({
    type: BOOKINGS_ACTION_TYPES.CREATE_BOOKING_FAILURE,
    payload: error,
  }),

  updateBookingRequest: () => ({
    type: BOOKINGS_ACTION_TYPES.UPDATE_BOOKING_REQUEST,
  }),

  updateBookingSuccess: (booking: Booking) => ({
    type: BOOKINGS_ACTION_TYPES.UPDATE_BOOKING_SUCCESS,
    payload: booking,
  }),

  updateBookingFailure: (error: string) => ({
    type: BOOKINGS_ACTION_TYPES.UPDATE_BOOKING_FAILURE,
    payload: error,
  }),

  setCurrentBooking: (booking: Booking | null) => ({
    type: BOOKINGS_ACTION_TYPES.SET_CURRENT_BOOKING,
    payload: booking,
  }),

  clearBookingsError: () => ({
    type: BOOKINGS_ACTION_TYPES.CLEAR_BOOKINGS_ERROR,
  }),

  clearBookings: () => ({
    type: BOOKINGS_ACTION_TYPES.CLEAR_BOOKINGS,
  }),
};

// Reducer
export const bookingsReducer = (state: BookingsState = initialBookingsState, action: any): BookingsState => {
  switch (action.type) {
    case BOOKINGS_ACTION_TYPES.FETCH_BOOKINGS_REQUEST:
    case BOOKINGS_ACTION_TYPES.CREATE_BOOKING_REQUEST:
    case BOOKINGS_ACTION_TYPES.UPDATE_BOOKING_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case BOOKINGS_ACTION_TYPES.FETCH_BOOKINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        bookings: action.payload,
        error: null,
      };

    case BOOKINGS_ACTION_TYPES.CREATE_BOOKING_SUCCESS:
      return {
        ...state,
        loading: false,
        bookings: [...state.bookings, action.payload],
        currentBooking: action.payload,
        error: null,
      };

    case BOOKINGS_ACTION_TYPES.UPDATE_BOOKING_SUCCESS:
      return {
        ...state,
        loading: false,
        bookings: state.bookings.map((booking: Booking) =>
          booking._id === action.payload._id ? action.payload : booking
        ),
        currentBooking: state.currentBooking?._id === action.payload._id ? action.payload : state.currentBooking,
        error: null,
      };

    case BOOKINGS_ACTION_TYPES.FETCH_BOOKINGS_FAILURE:
    case BOOKINGS_ACTION_TYPES.CREATE_BOOKING_FAILURE:
    case BOOKINGS_ACTION_TYPES.UPDATE_BOOKING_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case BOOKINGS_ACTION_TYPES.SET_CURRENT_BOOKING:
      return {
        ...state,
        currentBooking: action.payload,
      };

    case BOOKINGS_ACTION_TYPES.CLEAR_BOOKINGS_ERROR:
      return {
        ...state,
        error: null,
      };

    case BOOKINGS_ACTION_TYPES.CLEAR_BOOKINGS:
      return {
        ...state,
        bookings: [],
        currentBooking: null,
      };

    default:
      return state;
  }
};

// Selectors
export const selectBookings = (state: { bookings: BookingsState }) => state.bookings;
export const selectBookingsList = (state: { bookings: BookingsState }) => state.bookings.bookings;
export const selectCurrentBooking = (state: { bookings: BookingsState }) => state.bookings.currentBooking;
export const selectBookingsLoading = (state: { bookings: BookingsState }) => state.bookings.loading;
export const selectBookingsError = (state: { bookings: BookingsState }) => state.bookings.error;

export default bookingsReducer;
