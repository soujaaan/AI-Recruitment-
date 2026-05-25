import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../lib/api';
import { toast } from 'sonner';

export const fetchProfile = createAsyncThunk(
    'resume/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiClient.get(`/api/resume/me`);
            console.log("[resumeSlice/fetchProfile] raw response:", res.data);
            // Backend now returns profile: null when no profile exists (200 status)
            return res.data.profile ?? null;
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to fetch profile';
            console.error("[resumeSlice/fetchProfile] error:", msg);
            return rejectWithValue(msg);
        }
    }
);

export const saveProfile = createAsyncThunk(
    'resume/saveProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            console.log("[resumeSlice/saveProfile] sending payload keys:", Object.keys(profileData));
            console.log("[resumeSlice/saveProfile] experience:", profileData.experience?.length);
            console.log("[resumeSlice/saveProfile] projects:", profileData.projects?.length);
            console.log("[resumeSlice/saveProfile] education:", profileData.education);

            const res = await apiClient.post(`/api/resume/save`, profileData);
            console.log("[resumeSlice/saveProfile] server response:", res.data);

            if (!res.data.success) {
                return rejectWithValue(res.data.message || 'Save failed');
            }

            return res.data.profile;
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to save profile';
            console.error("[resumeSlice/saveProfile] error:", msg, error.response?.data);
            return rejectWithValue(msg);
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
                state.profile = action.payload; // null is valid (no profile yet)
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                // Don't toast on fetch failure — silently shows empty form
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
                toast.error(`Save failed: ${action.payload}`);
            });
    }
});

export const { resetSaveStatus } = resumeSlice.actions;
export default resumeSlice.reducer;
