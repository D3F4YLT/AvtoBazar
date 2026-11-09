import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice';
import meta from './metaSlice';
import lang from './langSlice';

export const store = configureStore({ reducer: { auth, meta, lang } });