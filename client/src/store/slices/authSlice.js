import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';
import { reloadCartForCurrentUser, clearCart } from './cartSlice.js';

// Load user from localStorage on startup
const user = localStorage.getItem('bazario_user')
  ? JSON.parse(localStorage.getItem('bazario_user'))
  : null;

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('bazario_user', JSON.stringify(data));

      // ── FIX ──────────────────────────────────────────────────────────
      // The cart is keyed per-account (see cartSlice.js). Now that a
      // (possibly different) account has just logged in, swap the cart
      // in memory to whatever THIS account's saved cart actually is —
      // instead of leaving whatever the previous account/guest had.
      dispatch(reloadCartForCurrentUser());

      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('bazario_user', JSON.stringify(data));

      // Brand new account — give it a clean, empty cart rather than
      // inheriting whatever the guest cart happened to contain.
      dispatch(clearCart());

      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    await api.post('/auth/logout');
    localStorage.removeItem('bazario_user');

    // ── FIX ──────────────────────────────────────────────────────────
    // After logging out, switch back to the "guest" cart bucket instead
    // of leaving this account's cart items visible on screen.
    dispatch(reloadCartForCurrentUser());
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('bazario_user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(logoutUser.fulfilled, (s) => { s.user = null; });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
