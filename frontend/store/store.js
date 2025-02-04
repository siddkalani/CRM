// store.js
import { configureStore } from '@reduxjs/toolkit';
import leadReducer from './LeadSlice';

export const store = configureStore({
  reducer: {
    lead: leadReducer,
  },
});
