import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
    name:"job",
    initialState:{
        allJobs:[],
        allAdminJobs:[],
        singleJob:null, 
        searchJobByText:"",
        allAppliedJobs:[],
        searchedQuery:"",
        feedType:"latest",
        personalized:false,
        pagination:null,
        adminPagination:null,
        appliedPagination:null,
        loading:false,
        error:null
    },
    reducers:{
        setAllJobs:(state,action) => {
            state.allJobs = action.payload;
        },
        setSingleJob:(state,action) => {
            state.singleJob = action.payload;
        },
        setAllAdminJobs:(state,action) => {
            state.allAdminJobs = action.payload;
        },
        setSearchJobByText:(state,action) => {
            state.searchJobByText = action.payload;
        },
        setAllAppliedJobs:(state,action) => {
            state.allAppliedJobs = action.payload;
        },
        setSearchedQuery:(state,action) => {
            state.searchedQuery = action.payload;
        },
        setJobFeedMeta:(state,action) => {
            state.feedType = action.payload?.feedType ?? "latest";
            state.personalized = Boolean(action.payload?.personalized);
        },
        setJobPagination:(state,action) => {
            state.pagination = action.payload;
        },
        setAdminJobPagination:(state,action) => {
            state.adminPagination = action.payload;
        },
        setAppliedJobPagination:(state,action) => {
            state.appliedPagination = action.payload;
        },
        setJobLoading:(state,action) => {
            state.loading = action.payload;
        },
        setJobError:(state,action) => {
            state.error = action.payload;
        }
    }
});
export const {
    setAllJobs, 
    setSingleJob, 
    setAllAdminJobs,
    setSearchJobByText, 
    setAllAppliedJobs,
    setSearchedQuery,
    setJobFeedMeta,
    setJobPagination,
    setAdminJobPagination,
    setAppliedJobPagination,
    setJobLoading,
    setJobError
} = jobSlice.actions;
export default jobSlice.reducer;
