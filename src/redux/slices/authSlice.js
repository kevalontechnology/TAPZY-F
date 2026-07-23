import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const userFromStorage = localStorage.getItem('tapzy_user')
  ? JSON.parse(localStorage.getItem('tapzy_user'))
  : null;

const tokenFromStorage = localStorage.getItem('tapzy_token') || null;

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const data = await api.post('/auth/login', credentials);
    localStorage.setItem('tapzy_token', data.token);
    localStorage.setItem('tapzy_user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Login failed');
  }
});

export const getProfile = createAsyncThunk('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    const data = await api.get('/auth/profile');
    localStorage.setItem('tapzy_user', JSON.stringify(data.user));
    return data.user;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch profile');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: userFromStorage,
    token: tokenFromStorage,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('tapzy_token');
      localStorage.removeItem('tapzy_user');
      state.user = null;
      state.token = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
