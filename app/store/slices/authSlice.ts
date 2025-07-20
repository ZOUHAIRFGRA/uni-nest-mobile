import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { 
  User, 
  AuthState, 
  LoginCredentials, 
  RegisterData, 
} from '../../types';

// Initial state
const initialState: AuthState = {
  user: null,
  // API v2 uses HTTP-only cookies, no client-side token
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const authState = await authService.initializeAuthState();
      return authState;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initialize auth state');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (response && response.user) {
        return response;
      }
      throw new Error('Login failed - invalid response format');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue, dispatch }) => {
    try {
      const response = await authService.register(userData);
      console.log('Register thunk response:', response);
      
      // The API returns data directly, not wrapped in success/data structure
      if (response && response.user) {
        // Auto-login after successful registration
        try {
          const loginCredentials = {
            email: userData.email,
            password: userData.password
          };
          const loginResponse = await authService.login(loginCredentials);
          if (loginResponse && loginResponse.user) {
            return loginResponse;
          }
          // If login fails, still return registration data
          return response;
        } catch (loginError) {
          // If auto-login fails, still return registration success
          console.log('Auto-login failed, but registration successful:', loginError);
          return response;
        }
      }
      throw new Error('Registration failed - invalid response format');
    } catch (error: any) {
      console.error('Registration error:', error);
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get user');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get user');
    }
  }
);

// Commented out as these endpoints are not available in API v2
// TODO: Implement when API v2 adds these endpoints
/*
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      if (response.success && response.data) {
        return response.data.token;
      }
      throw new Error(response.message || 'Token refresh failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        return response.message;
      }
      throw new Error(response.message || 'Failed to send reset email');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send reset email');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }: { token: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(token, newPassword);
      if (response.success) {
        return response.message;
      }
      throw new Error(response.message || 'Password reset failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset failed');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authService.verifyEmail(token);
      if (response.success) {
        return response.message;
      }
      throw new Error(response.message || 'Email verification failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Email verification failed');
    }
  }
);
*/

export const saveUserPreferences = createAsyncThunk(
  'auth/savePreferences',
  async (preferences: Record<string, any>, { rejectWithValue }) => {
    try {
      await authService.saveUserPreferences(preferences);
      return preferences;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save preferences');
    }
  }
);

export const updateStoredUserData = createAsyncThunk(
  'auth/updateStoredUserData',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      await authService.updateStoredUserData(userData);
      return userData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update user data');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      // API v2 uses HTTP-only cookies, no client-side token
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Initialize auth state from storage
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        const { user } = action.payload;
        state.user = user;
        // API v2 uses HTTP-only cookies, no client-side token
        state.isAuthenticated = !!user;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        // API v2 uses HTTP-only cookies, no token property
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        // API v2 uses HTTP-only cookies, no token property
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        // API v2 uses HTTP-only cookies, no client-side token
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Force logout even if API call fails
        state.user = null;
        // API v2 uses HTTP-only cookies, no client-side token
        state.isAuthenticated = false;
      });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        // Clear auth state if getting user fails
        state.user = null;
        // API v2 uses HTTP-only cookies, no token
      });

    // Commented out reducer cases for unavailable API v2 endpoints
    /*
    // Refresh token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Clear auth state if token refresh fails
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // Forgot password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Reset password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify email
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        // Update user verification status if user exists
        if (state.user) {
          state.user.verified = true;
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    */

    // Update stored user data
    builder
      .addCase(updateStoredUserData.fulfilled, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(updateStoredUserData.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Save user preferences
    builder
      .addCase(saveUserPreferences.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearError, setUser, clearAuth, updateUser } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

// Export reducer
export default authSlice.reducer;
