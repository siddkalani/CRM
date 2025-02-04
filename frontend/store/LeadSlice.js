// features/lead/leadSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to update lead notes on the backend
export const updateLeadNotes = createAsyncThunk(
  'lead/updateLeadNotes',
  async ({ leadId, notes }, thunkAPI) => {
    try {
      const response = await fetch(`http://localhost:5000/api/leads/${leadId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });
      const data = await response.json();
      if (!response.ok) {
        // Pass the error message to the reducer
        return thunkAPI.rejectWithValue(data);
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const leadSlice = createSlice({
  name: 'lead',
  initialState: {
    currentLead: null, // you can initialize this with lead details if needed
    status: 'idle',
    error: null,
  },
  reducers: {
    setCurrentLead: (state, action) => {
      state.currentLead = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateLeadNotes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateLeadNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update the current lead with the returned data (which includes the saved notes)
        state.currentLead = action.payload;
      })
      .addCase(updateLeadNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setCurrentLead } = leadSlice.actions;
export default leadSlice.reducer;
