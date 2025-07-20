// Matches slice for simple store
import type { Match, MatchesState } from '../../types';

// Initial state
export const initialMatchesState: MatchesState = {
  matches: [],
  currentMatch: null,
  loading: false,
  error: null,
  type: 'all',
};

// Action types
export const MATCHES_ACTION_TYPES = {
  FETCH_MATCHES_REQUEST: 'FETCH_MATCHES_REQUEST',
  FETCH_MATCHES_SUCCESS: 'FETCH_MATCHES_SUCCESS',
  FETCH_MATCHES_FAILURE: 'FETCH_MATCHES_FAILURE',
  SET_CURRENT_MATCH: 'SET_CURRENT_MATCH',
  UPDATE_MATCH_STATUS: 'UPDATE_MATCH_STATUS',
  SET_MATCH_TYPE: 'SET_MATCH_TYPE',
  CLEAR_MATCHES_ERROR: 'CLEAR_MATCHES_ERROR',
  CLEAR_MATCHES: 'CLEAR_MATCHES',
} as const;

// Action creators
export const matchesActions = {
  fetchMatchesRequest: () => ({
    type: MATCHES_ACTION_TYPES.FETCH_MATCHES_REQUEST,
  }),

  fetchMatchesSuccess: (matches: Match[]) => ({
    type: MATCHES_ACTION_TYPES.FETCH_MATCHES_SUCCESS,
    payload: matches,
  }),

  fetchMatchesFailure: (error: string) => ({
    type: MATCHES_ACTION_TYPES.FETCH_MATCHES_FAILURE,
    payload: error,
  }),

  setCurrentMatch: (match: Match | null) => ({
    type: MATCHES_ACTION_TYPES.SET_CURRENT_MATCH,
    payload: match,
  }),

  updateMatchStatus: (matchId: string, status: string) => ({
    type: MATCHES_ACTION_TYPES.UPDATE_MATCH_STATUS,
    payload: { matchId, status },
  }),

  setMatchType: (matchType: 'property' | 'roommate' | 'all') => ({
    type: MATCHES_ACTION_TYPES.SET_MATCH_TYPE,
    payload: matchType,
  }),

  clearMatchesError: () => ({
    type: MATCHES_ACTION_TYPES.CLEAR_MATCHES_ERROR,
  }),

  clearMatches: () => ({
    type: MATCHES_ACTION_TYPES.CLEAR_MATCHES,
  }),
};

// Reducer
export const matchesReducer = (state: MatchesState = initialMatchesState, action: any): MatchesState => {
  switch (action.type) {
    case MATCHES_ACTION_TYPES.FETCH_MATCHES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case MATCHES_ACTION_TYPES.FETCH_MATCHES_SUCCESS:
      return {
        ...state,
        loading: false,
        matches: action.payload,
        error: null,
      };

    case MATCHES_ACTION_TYPES.FETCH_MATCHES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case MATCHES_ACTION_TYPES.SET_CURRENT_MATCH:
      return {
        ...state,
        currentMatch: action.payload,
      };

    case MATCHES_ACTION_TYPES.UPDATE_MATCH_STATUS:
      return {
        ...state,
        matches: state.matches.map((match: Match) =>
          match._id === action.payload.matchId
            ? { ...match, status: action.payload.status }
            : match
        ),
      };

    case MATCHES_ACTION_TYPES.SET_MATCH_TYPE:
      return {
        ...state,
        type: action.payload,
      };

    case MATCHES_ACTION_TYPES.CLEAR_MATCHES_ERROR:
      return {
        ...state,
        error: null,
      };

    case MATCHES_ACTION_TYPES.CLEAR_MATCHES:
      return {
        ...state,
        matches: [],
        currentMatch: null,
      };

    default:
      return state;
  }
};

// Selectors
export const selectMatches = (state: { matches: MatchesState }) => state.matches;
export const selectMatchesList = (state: { matches: MatchesState }) => state.matches.matches;
export const selectCurrentMatch = (state: { matches: MatchesState }) => state.matches.currentMatch;
export const selectMatchesLoading = (state: { matches: MatchesState }) => state.matches.loading;
export const selectMatchesError = (state: { matches: MatchesState }) => state.matches.error;
export const selectMatchType = (state: { matches: MatchesState }) => state.matches.type;

export default matchesReducer;
