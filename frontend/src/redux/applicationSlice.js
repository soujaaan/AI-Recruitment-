import { createSlice } from "@reduxjs/toolkit";

const applicationSlice = createSlice({
    name:'application',
    initialState:{
        applicants:null,
        loading:false,
        error:null,
        pagination:null
    },
    reducers:{
        setAllApplicants:(state,action) => {
            state.applicants = action.payload;
        },
        setApplicationLoading:(state,action) => {
            state.loading = action.payload;
        },
        setApplicationError:(state,action) => {
            state.error = action.payload;
        },
        setApplicationPagination:(state,action) => {
            state.pagination = action.payload;
        }
    }
});
export const {setAllApplicants, setApplicationLoading, setApplicationError, setApplicationPagination} = applicationSlice.actions;
export default applicationSlice.reducer;
