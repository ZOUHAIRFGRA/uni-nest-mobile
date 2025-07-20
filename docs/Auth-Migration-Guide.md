# Auth Slice Migration Guide

## Summary: Use `authSlice.ts`, NOT `simpleAuthSlice.ts`

After migrating from the simple store to Redux Toolkit, here's what you need to know:

## ✅ **Current State (What to Use)**

### **`authSlice.ts` - Modern Redux Toolkit Implementation**
- **Location**: `app/store/slices/authSlice.ts`
- **Status**: ✅ **ACTIVE - USE THIS**
- **Used by**: `store.ts` (your main Redux store)

**Key Features:**
```typescript
// Modern async thunks with built-in loading states
export const loginUser = createAsyncThunk('auth/login', ...)
export const registerUser = createAsyncThunk('auth/register', ...)
export const logoutUser = createAsyncThunk('auth/logout', ...)
export const initializeAuth = createAsyncThunk('auth/initialize', ...) // NEW!
export const saveUserPreferences = createAsyncThunk('auth/savePreferences', ...) // NEW!

// Modern slice with automatic action creators
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: { /* automatic actions */ },
  extraReducers: { /* async thunk handlers */ }
})
```

## ❌ **Deprecated (Don't Use)**

### **`simpleAuthSlice.ts` - Legacy Implementation**
- **Location**: `app/store/slices/simpleAuthSlice.ts`
- **Status**: ❌ **DEPRECATED - DON'T USE**
- **Purpose**: Legacy compatibility, kept for reference only

### **`appThunks.ts` Auth Section**
- **Location**: `app/store/appThunks.ts`
- **Status**: ❌ **AUTH THUNKS DEPRECATED**
- **Purpose**: Legacy manual thunks, auth section replaced by `authSlice.ts`

## 🔄 **Migration Mapping**

| **Old (Don't Use)** | **New (Use This)** | **Notes** |
|---------------------|---------------------|-----------|
| `authActions.loginRequest()` | `dispatch(loginUser(credentials))` | Auto loading states |
| `authActions.loginSuccess()` | Automatic in `loginUser.fulfilled` | Built-in success handling |
| `authActions.loginFailure()` | Automatic in `loginUser.rejected` | Built-in error handling |
| `authThunks.login()` | `dispatch(loginUser(credentials))` | Single thunk call |
| `authThunks.register()` | `dispatch(registerUser(userData))` | Single thunk call |
| `authThunks.logout()` | `dispatch(logoutUser())` | Enhanced with storage clearing |
| ❌ No equivalent | `dispatch(initializeAuth())` | **NEW: Session restoration** |
| ❌ No equivalent | `dispatch(saveUserPreferences())` | **NEW: Preferences** |

## 📱 **How to Use the Modern Auth System**

### **1. Login**
```typescript
// Old way (DON'T USE)
// dispatch(authThunks.login(credentials))

// New way (USE THIS)
import { loginUser } from '../store/slices/authSlice';
const result = await dispatch(loginUser(credentials));
```

### **2. Register**
```typescript
// Old way (DON'T USE)
// dispatch(authThunks.register(userData))

// New way (USE THIS)
import { registerUser } from '../store/slices/authSlice';
const result = await dispatch(registerUser(userData));
```

### **3. Logout**
```typescript
// Old way (DON'T USE)
// dispatch(authThunks.logout())

// New way (USE THIS)
import { logoutUser } from '../store/slices/authSlice';
await dispatch(logoutUser());
```

### **4. Session Restoration (NEW)**
```typescript
// Initialize auth state from AsyncStorage on app startup
import { initializeAuth } from '../store/slices/authSlice';
await dispatch(initializeAuth());
```

### **5. Using Auth State**
```typescript
// Same for both old and new
import { useAuth } from '../store/hooks';
const { user, isAuthenticated, isLoading, error } = useAuth();
```

## 🏗️ **Architecture Comparison**

### **Old Architecture (simpleAuthSlice.ts)**
```
Component → Manual Action Creator → Manual Reducer → State Update
         → Manual Thunk → API Call → Manual Success/Error Actions
```

### **New Architecture (authSlice.ts)**
```
Component → Redux Toolkit Thunk → Automatic Loading States → Auto Reducer → State Update
                                → AsyncStorage Integration → Session Persistence
```

## 🎯 **Benefits of New System**

1. **✅ Less Boilerplate**: Automatic action creators and immutable updates
2. **✅ Built-in Async**: Loading states handled automatically
3. **✅ AsyncStorage Integration**: Session persistence and restoration
4. **✅ Type Safety**: Better TypeScript integration
5. **✅ DevTools**: Enhanced Redux DevTools support
6. **✅ Best Practices**: Follows Redux Toolkit patterns

## 🧹 **Cleanup Status**

- ✅ **simpleAuthSlice.ts**: Marked as deprecated
- ✅ **appThunks.ts**: Auth thunks commented out and marked deprecated
- ✅ **store.ts**: Using modern `authSlice.ts`
- ✅ **Components**: Should use modern auth thunks

## 🔍 **Quick Check: What Am I Using?**

**Look at your imports:**

```typescript
// ❌ OLD - Don't use these
import { authActions } from './slices/simpleAuthSlice';
import { authThunks } from './appThunks';

// ✅ NEW - Use these instead
import { loginUser, registerUser, logoutUser, initializeAuth } from './slices/authSlice';
import { useAuth } from './hooks';
```

**Look at your store configuration:**

```typescript
// ✅ Correct - Using modern authSlice
import authReducer from './slices/authSlice'; // ← This is right

export const store = configureStore({
  reducer: {
    auth: authReducer, // ← This points to modern authSlice.ts
  },
});
```

## 🚀 **You're All Set!**

Your app is now using the modern Redux Toolkit auth system with:
- ✅ Automatic session restoration
- ✅ AsyncStorage integration  
- ✅ Enhanced error handling
- ✅ Type-safe operations
- ✅ Less boilerplate code

**Next time you need auth functionality, import from `authSlice.ts`, not `simpleAuthSlice.ts`!**
