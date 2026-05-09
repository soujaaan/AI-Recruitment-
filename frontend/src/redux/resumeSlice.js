import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// To be safe, we'll construct the URL locally if not in constants:
// Actually, let's just use axios with credentials

export const fetchProfile = createAsyncThunk(
    'resume/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`http://localhost:8000/api/profile/me`, {
                withCredentials: true
            });
            return res.data.profile;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
        }
    }
);

export const saveProfile = createAsyncThunk(
    'resume/saveProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`http://localhost:8000/api/profile/save`, profileData, {
                withCredentials: true
            });
            return res.data.profile;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to save profile');
        }
    }
);

const initialState = {
    profile: null,
    loading: false,
    error: null,
    saveLoading: false,
    saveSuccess: false
};

const resumeSlice = createSlice({
    name: 'resume',
    initialState,
    reducers: {
        resetSaveStatus: (state) => {
            state.saveLoading = false;
            state.saveSuccess = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(saveProfile.pending, (state) => {
                state.saveLoading = true;
                state.saveSuccess = false;
                state.error = null;
            })
            .addCase(saveProfile.fulfilled, (state, action) => {
                state.saveLoading = false;
                state.saveSuccess = true;
                state.profile = action.payload;
            })
            .addCase(saveProfile.rejected, (state, action) => {
                state.saveLoading = false;
                state.saveSuccess = false;
                state.error = action.payload;
            });
    }
});

export const { resetSaveStatus } = resumeSlice.actions;
export default resumeSlice.reducer;
