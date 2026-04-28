import { createSlice } from "@reduxjs/toolkit";

const aiSlice = createSlice({
    name: "ai",
    initialState: {
        resumeAnalysis: null,
        jobMatch: null,
        interviewQuestions: [],
        answerFeedback: null,
        loading: false,
        error: null,
    },
    reducers: {
        setAIResponse: (state, action) => {
            const { key, value } = action.payload;
            state[key] = value;
        },
        setAILoading: (state, action) => {
            state.loading = action.payload;
        },
        setAIError: (state, action) => {
            state.error = action.payload;
        },
        clearAIState: (state) => {
            state.resumeAnalysis = null;
            state.jobMatch = null;
            state.interviewQuestions = [];
            state.answerFeedback = null;
            state.loading = false;
            state.error = null;
        },
    },
});

export const { setAIResponse, setAILoading, setAIError, clearAIState } = aiSlice.actions;
export default aiSlice.reducer;
