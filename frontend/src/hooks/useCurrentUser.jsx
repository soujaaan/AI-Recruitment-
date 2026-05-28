import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { authService } from "@/services/auth.service";
import { setAuthState, clearAuth, setLoading } from "@/redux/authSlice";

const useCurrentUser = () => {
    const dispatch = useDispatch();
    const query = useQuery({
        queryKey: ["currentUser"],
        queryFn: async () => authService.me(),
        retry: false,
        select: (response) => response?.data ?? response,
    });

    useEffect(() => {
        dispatch(setLoading(query.isLoading || query.isFetching));
    }, [dispatch, query.isLoading, query.isFetching]);

    useEffect(() => {
        const data = query.data;
        if (!data) {
            return;
        }

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
