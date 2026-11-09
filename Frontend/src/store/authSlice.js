import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, setToken, getToken } from '../api';

const toPayload = (e) => ({ message: e.message, errors: e.errors || {} });

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const data = await api.post('/api/auth/login', credentials);
    setToken(data.token);
    return data.user;
  } catch (e) {
    return rejectWithValue(toPayload(e));
  }
});

export const register = createAsyncThunk('auth/register', async (values, { rejectWithValue }) => {
  try {
    const data = await api.post('/api/auth/register', values);
    setToken(data.token);
    return data.user;
  } catch (e) {
    return rejectWithValue(toPayload(e));
  }
});

// При открытии сайта: если есть токен, узнаём, кто вошёл
export const loadUser = createAsyncThunk('auth/loadUser', async () => {
  if (!getToken()) return null;
  try {
    const data = await api.get('/api/auth/me');
    return data.user;
  } catch {
    setToken(null);
    return null;
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (values, { rejectWithValue }) => {
  try {
    const data = await api.put('/api/users/me', values);
    return data.user;
  } catch (e) {
    return rejectWithValue(toPayload(e));
  }
});

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, ready: false, error: null, fieldErrors: {} },
  reducers: {
    loggedOut(state) {
      state.user = null;
    },
    clearError(state) {
      state.error = null;
      state.fieldErrors = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.fulfilled, (s, a) => {
        s.user = a.payload;
        s.ready = true;
      })
      .addCase(loadUser.rejected, (s) => {
        s.ready = true;
      });

    for (const thunk of [login, register, updateProfile]) {
      builder
        .addCase(thunk.pending, (s) => {
          s.loading = true;
          s.error = null;
          s.fieldErrors = {};
        })
        .addCase(thunk.fulfilled, (s, a) => {
          s.loading = false;
          s.user = a.payload;
        })
        .addCase(thunk.rejected, (s, a) => {
          s.loading = false;
          s.error = a.payload?.message || 'Ошибка';
          s.fieldErrors = a.payload?.errors || {};
        });
    }
  },
});

export const { clearError } = slice.actions;

// Выход: убираем токен и очищаем пользователя в хранилище
export const logout = () => (dispatch) => {
  setToken(null);
  dispatch(slice.actions.loggedOut());
};

export default slice.reducer;