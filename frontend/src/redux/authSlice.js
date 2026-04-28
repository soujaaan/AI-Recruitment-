import { createSlice } from "@reduxjs/toolkit";
import { normalizeUser } from "@/lib/normalize";

const authSlice = createSlice({
    name:"auth",
    initialState:{
        loading:false,
        user:null,
        token: localStorage.getItem("accessToken") || "",
        status:"idle",
        error:null
    },
    reducers:{
        setLoading:(state, action) => {
            state.loading = action.payload;
        },
        setUser:(state, action) => {
            state.user = normalizeUser(action.payload);
            state.status = action.payload ? "authenticated" : "anonymous";
        },
        setToken:(state, action) => {
            state.token = action.payload || "";
            if (action.payload) {
                localStorage.setItem("accessToken", action.payload);
            } else {
                localStorage.removeItem("accessToken");
            }
        },
        setAuthState:(state, action) => {
            state.user = normalizeUser(action.payload?.user ?? null);
            state.token = action.payload?.token ?? state.token;
            state.status = action.payload?.user ? "authenticated" : "anonymous";
            if (action.payload?.token) {
                localStorage.setItem("accessToken", action.payload.token);
            }
        },
        clearAuth:(state) => {
            state.user = null;
            state.token = "";
            state.status = "anonymous";
            state.error = null;
            localStorage.removeItem("accessToken");
        },
        setAuthError:(state, action) => {
            state.error = action.payload;
        }
    }
});
export const {setLoading, setUser, setToken, setAuthState, clearAuth, setAuthError} = authSlice.actions;
export default authSlice.reducer;
