// store.js
import { configureStore } from '@reduxjs/toolkit';
import leadReducer from './LeadSlice';
import contactReducer from './contactSlice';

export const store = configureStore({
  reducer: {
    lead: leadReducer,
    contact: contactReducer,
  },
});
