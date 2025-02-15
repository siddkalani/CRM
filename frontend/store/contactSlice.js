import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../constants/constant';

// Async thunk to update contact notes
export const updateContactNotes = createAsyncThunk(
  'contact/updateContactNotes',
  async ({ contactId, notes }, thunkAPI) => {
    try {
      const response = await fetch(`${BASE_URL}/api/contacts/${contactId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });
      const data = await response.json();
      if (!response.ok) {
        return thunkAPI.rejectWithValue(data.message || 'Failed to update notes');
      }
      return data; // Return updated contact object
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Network error');
    }
  }
);

const contactSlice = createSlice({
  name: 'contact',
  initialState: {
    currentContact: null,
    status: 'idle', // idle, loading, succeeded, failed
    error: null,
  },
  reducers: {
    setCurrentContact: (state, action) => {
      state.currentContact = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateContactNotes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateContactNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update the notes in the current contact
        if (state.currentContact && state.currentContact._id === action.payload._id) {
          state.currentContact.notes = action.payload.notes;
        }
      })
      .addCase(updateContactNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setCurrentContact } = contactSlice.actions;

export default contactSlice.reducer;
