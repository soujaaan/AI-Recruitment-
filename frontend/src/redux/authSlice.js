import { createSlice } from "@reduxjs/toolkit";
import { normalizeUser } from "@/lib/normalize";

const authSlice = createSlice({
    name:"auth",
    initialState:{
        loading:false,
        user:null,
        token: "" ,
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
            // Token is cookie-based; keep Redux token for UI only (optional) but do not persist.
            state.token = action.payload || "";
        },
        setAuthState:(state, action) => {
            state.user = normalizeUser(action.payload?.user ?? null);
            state.token = action.payload?.token ?? state.token;
            state.status = action.payload?.user ? "authenticated" : "anonymous";
        },
        clearAuth:(state) => {
            state.user = null;
            state.token = "";
            state.status = "anonymous";
            state.error = null;
            localStorage.removeItem("token");
            localStorage.removeItem("accessToken");
        },
        setAuthError:(state, action) => {
            state.error = action.payload;
        }
    }
});
export const {setLoading, setUser, setToken, setAuthState, clearAuth, setAuthError} = authSlice.actions;
export default authSlice.reducer;
