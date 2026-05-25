import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { authService } from "@/services/auth.service";
import { setAuthState, clearAuth } from "@/redux/authSlice";

const useCurrentUser = () => {
    const dispatch = useDispatch();
    const query = useQuery({
        queryKey: ["currentUser"],
        queryFn: async () => authService.me(),
        retry: false,
        select: (response) => response?.data ?? response,
    });

    useEffect(() => {
        const data = query.data;
        if (!data) {
            return;
        }

        // Cookie auth only; do not read token from localStorage.
        dispatch(setAuthState({ user: data?.user || data?.data?.user || null, token: "" }));
    }, [dispatch, query.data]);

    useEffect(() => {
        if (query.isError) {
            dispatch(clearAuth());
        }
    }, [dispatch, query.isError]);

    return query;
};

export default useCurrentUser;
