import { createSlice } from "@reduxjs/toolkit";

const companySlice = createSlice({
    name:"company",
    initialState:{
        singleCompany:null,
        companies:[],
        searchCompanyByText:"",
        pagination:null,
        loading:false,
        error:null,
    },
    reducers:{
        setSingleCompany:(state,action) => {
            state.singleCompany = action.payload;
        },
        setCompanies:(state,action) => {
            state.companies = action.payload;
        },
        setSearchCompanyByText:(state,action) => {
            state.searchCompanyByText = action.payload;
        },
        setCompanyPagination:(state,action) => {
            state.pagination = action.payload;
        },
        setCompanyLoading:(state,action) => {
            state.loading = action.payload;
        },
        setCompanyError:(state,action) => {
            state.error = action.payload;
        }
    }
});
export const {setSingleCompany, setCompanies,setSearchCompanyByText,setCompanyPagination,setCompanyLoading,setCompanyError} = companySlice.actions;
export default companySlice.reducer;
