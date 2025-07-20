# Session Expiration Handling - Implementation Guide

## Overview
This document outlines the comprehensive session expiration handling system implemented across the app to ensure users are automatically logged out and redirected to login when their session expires.

## Components Implemented

### 1. SessionHandler Utility (`app/utils/sessionHandler.ts`)
**Purpose**: Central utility for detecting and handling session expiration globally.

**Key Methods**:
- `isSessionExpired(error)`: Detects session expiration from API error responses
- `handleSessionExpiration(error)`: Handles logout and cleanup when session expires
- `withSessionHandling(apiCall)`: Wrapper for API calls with automatic session handling
- `initialize(dispatch)`: Initializes the handler with Redux dispatch function

**Error Detection**: Looks for:
- HTTP 401 Unauthorized responses
- Error messages containing "session expired", "expired", "unauthorized", "authentication failed"

### 2. Updated API Client (`app/services/apiClient.ts`)
**Existing Features**:
- Already handles 401 errors by clearing tokens from AsyncStorage
- Automatic token injection in request headers
- Global error handling for network issues

**Session Integration**:
- Works seamlessly with SessionHandler for comprehensive session management
- Tokens are cleared on 401 responses, triggering re-authentication

### 3. Enhanced Redux Thunks (`app/store/appThunks.ts`)
**Updated Thunks with Session Handling**:
- `fetchProperties()` - Property data loading
- `fetchPropertyById()` - Single property details
- `searchProperties()` - Property search
- `fetchBookings()` - User booking history
- `createBooking()` - New booking creation
- `updateBookingStatus()` - Booking status updates
- `fetchChats()` - Chat list loading
- `fetchMessages()` - Chat message history
- `sendMessage()` - Message sending
- `createChat()` - New chat creation
- `fetchNotifications()` - Notification loading
- `markNotificationAsRead()` - Notification status updates
- `markAllNotificationsAsRead()` - Bulk notification updates

**Implementation Pattern**:
```typescript
try {
  // API call
  const result = await apiService.method();
  dispatch(successAction(result));
  return result;
} catch (error: any) {
  // Check for session expiration and handle logout
  if (await handleSessionExpiration(error, dispatch)) {
    return; // Don't dispatch failure action if session expired
  }
  
  dispatch(failureAction(errorMessage));
  throw error;
}
```

### 4. MainAppNavigator Integration (`app/navigation/MainAppNavigator.tsx`)
**Session-Aware Data Loading**:
- Initializes SessionHandler during app startup
- Handles session expiration during initial data loading
- Graceful handling of session expiration in parallel data operations

**Enhanced Error Handling**:
- Detects session expiration in individual data loading operations
- Prevents UI errors when session expires during app initialization
- Logs session expiration events for debugging

## User Experience Flow

### Normal Operation
1. User makes API request through app interface
2. API call executes with valid session token
3. Data is loaded and displayed normally

### Session Expiration Scenario
1. User makes API request with expired session
2. Backend returns 401 Unauthorized or "Session expired" message
3. SessionHandler detects expiration automatically
4. User is immediately logged out (tokens cleared from storage)
5. App redirects to login screen
6. User can log in again to continue

### Benefits
- **Automatic**: No manual session checking required
- **Secure**: Expired tokens are immediately cleared
- **User-Friendly**: Clear feedback and immediate redirect
- **Consistent**: Same behavior across all API calls
- **Robust**: Works during app initialization and runtime

## Error Messages Detected

The SessionHandler detects these session expiration indicators:
- "Session expired. Please login again."
- "expired"
- "unauthorized" 
- "authentication failed"
- HTTP 401 status codes

## Implementation Status

✅ **Complete**: Session expiration handling across all major API operations
✅ **Complete**: Central SessionHandler utility with robust error detection
✅ **Complete**: Integration with existing apiClient token management
✅ **Complete**: MainAppNavigator session-aware data loading
✅ **Complete**: All Redux thunks updated with session handling

## Testing Recommendations

1. **Session Expiration Testing**:
   - Test with expired tokens to verify logout behavior
   - Verify tokens are cleared from AsyncStorage
   - Confirm redirect to login screen

2. **Data Loading Testing**:
   - Test session expiration during app startup
   - Verify graceful handling of parallel API failures
   - Test individual thunk session handling

3. **User Experience Testing**:
   - Verify smooth logout → login → resume workflow
   - Test session expiration during various app operations
   - Confirm no UI crashes or stuck loading states

## Future Enhancements

Potential improvements for the session handling system:

1. **Token Refresh**: Implement automatic token refresh before expiration
2. **Warning System**: Show user warnings before session expires
3. **Session Monitoring**: Track session duration and usage patterns
4. **Offline Handling**: Enhanced session management for offline scenarios

## Troubleshooting

**Common Issues**:
- If session expiration isn't detected, check error message format from backend
- If logout doesn't redirect, verify auth state management in navigation
- If tokens persist after logout, check AsyncStorage clearing in apiClient

**Debug Logging**:
The SessionHandler includes comprehensive console logging:
- `🔐 Session expired detected` - When expiration is detected
- `🔄 Handling session expiration` - During logout process
- `✅ Session expiration handled` - After successful logout

## Conclusion

The session expiration handling system provides robust, automatic session management that enhances both security and user experience. Users will never be stuck with expired sessions, and the app will gracefully handle authentication state changes across all operations.
