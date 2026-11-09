import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';

// Справочники (марки, модели, топливо...) загружаются один раз
export const loadMeta = createAsyncThunk('meta/load', () => api.get('/api/meta'));

const slice = createSlice({
  name: 'meta',
  initialState: { brands: {}, fuels: [], transmissions: [], bodyTypes: [], loaded: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadMeta.fulfilled, (state, action) => ({ ...action.payload, loaded: true }));
  },
});

export default slice.reducer;