import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Match, 
  MatchesState} from '../../types';

// For now, we'll use mock data until the match service is implemented
const mockMatchService = {
  getMatches: async (type: string) => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: [] as Match[]
    };
  },
  updateMatchStatus: async (matchId: string, status: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: { _id: matchId, status }
    };
  },
  createMatch: async (targetId: string, type: 'property' | 'roommate') => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        _id: Date.now().toString(),
        type,
        userId: 'mock-user-id', // Add required userId field
        targetId,
        status: 'pending' as const,
        compatibilityScore: Math.floor(Math.random() * 100),
        reasons: ['Budget match', 'Location preference', 'Lifestyle compatibility'],
        aiRecommendationData: {
          budgetMatch: 95,
          locationMatch: 88,
          amenitiesMatch: 92,
          personalityMatch: 85,
          overallScore: 90
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }
};

// Initial state
const initialState: MatchesState = {
  matches: [],
  currentMatch: null,
  loading: false,
  error: null,
  type: 'all',
};

// Async thunks
export const fetchMatches = createAsyncThunk(
  'matches/fetchMatches',
  async (type: 'property' | 'roommate' | 'all' = 'all', { rejectWithValue }) => {
    try {
      const response = await mockMatchService.getMatches(type);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch matches');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch matches');
    }
  }
);

export const updateMatchStatus = createAsyncThunk(
  'matches/updateMatchStatus',
  async ({ matchId, status }: { matchId: string; status: 'pending' | 'liked' | 'disliked' | 'matched' | 'expired' }, { rejectWithValue }) => {
    try {
      const response = await mockMatchService.updateMatchStatus(matchId, status);
      if (response.success) {
        return { matchId, status };
      }
      throw new Error('Failed to update match status');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update match status');
    }
  }
);

export const createMatch = createAsyncThunk(
  'matches/createMatch',
  async ({ targetId, type }: { targetId: string; type: 'property' | 'roommate' }, { rejectWithValue }) => {
    try {
      const response = await mockMatchService.createMatch(targetId, type);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to create match');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create match');
    }
  }
);

export const likeMatch = createAsyncThunk(
  'matches/likeMatch',
  async (matchId: string, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(updateMatchStatus({ matchId, status: 'liked' }));
      return result.payload;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to like match');
    }
  }
);

export const dislikeMatch = createAsyncThunk(
  'matches/dislikeMatch',
  async (matchId: string, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(updateMatchStatus({ matchId, status: 'disliked' }));
      return result.payload;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to dislike match');
    }
  }
);

// Matches slice
const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentMatch: (state, action: PayloadAction<Match | null>) => {
      state.currentMatch = action.payload;
    },
    setMatchType: (state, action: PayloadAction<'property' | 'roommate' | 'all'>) => {
      state.type = action.payload;
    },
    clearMatches: (state) => {
      state.matches = [];
      state.currentMatch = null;
    },
    removeMatch: (state, action: PayloadAction<string>) => {
      state.matches = state.matches.filter(match => match._id !== action.payload);
      if (state.currentMatch?._id === action.payload) {
        state.currentMatch = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch matches
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
        state.error = null;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update match status
    builder
      .addCase(updateMatchStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMatchStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { matchId, status } = action.payload;
        state.matches = state.matches.map(match =>
          match._id === matchId ? { ...match, status: status as Match['status'] } : match
        );
        if (state.currentMatch?._id === matchId) {
          state.currentMatch = { ...state.currentMatch, status: status as Match['status'] };
        }
        state.error = null;
      })
      .addCase(updateMatchStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create match
    builder
      .addCase(createMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMatch.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = [action.payload, ...state.matches];
        state.error = null;
      })
      .addCase(createMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Like match
    builder
      .addCase(likeMatch.fulfilled, (state, action) => {
        // Handle like action (maybe move to next match)
        const payload = action.payload as { matchId: string; status: string };
        const likedMatchId = payload.matchId;
        const nextMatch = state.matches.find(match => 
          match._id !== likedMatchId && match.status === 'pending'
        );
        state.currentMatch = nextMatch || null;
      });

    // Dislike match
    builder
      .addCase(dislikeMatch.fulfilled, (state, action) => {
        // Handle dislike action (maybe move to next match)
        const payload = action.payload as { matchId: string; status: string };
        const dislikedMatchId = payload.matchId;
        const nextMatch = state.matches.find(match => 
          match._id !== dislikedMatchId && match.status === 'pending'
        );
        state.currentMatch = nextMatch || null;
      });
  },
});

// Export actions
export const { 
  clearError, 
  setCurrentMatch, 
  setMatchType, 
  clearMatches, 
  removeMatch 
} = matchesSlice.actions;

// Selectors
export const selectMatches = (state: { matches: MatchesState }) => state.matches;
export const selectMatchesList = (state: { matches: MatchesState }) => state.matches.matches;
export const selectCurrentMatch = (state: { matches: MatchesState }) => state.matches.currentMatch;
export const selectMatchesLoading = (state: { matches: MatchesState }) => state.matches.loading;
export const selectMatchesError = (state: { matches: MatchesState }) => state.matches.error;
export const selectMatchType = (state: { matches: MatchesState }) => state.matches.type;

// Computed selectors
export const selectPendingMatches = (state: { matches: MatchesState }) => 
  state.matches.matches.filter(match => match.status === 'pending');

export const selectLikedMatches = (state: { matches: MatchesState }) => 
  state.matches.matches.filter(match => match.status === 'liked');

export const selectMutualMatches = (state: { matches: MatchesState }) => 
  state.matches.matches.filter(match => match.status === 'matched');

export const selectPropertyMatches = (state: { matches: MatchesState }) => 
  state.matches.matches.filter(match => match.type === 'property');

export const selectRoommateMatches = (state: { matches: MatchesState }) => 
  state.matches.matches.filter(match => match.type === 'roommate');

// Export reducer
export default matchesSlice.reducer;
