import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { authService } from "@/services/auth.service";
import { clearAuth, setAuthState, setLoading } from "@/redux/authSlice";
import { queryClient } from "@/lib/queryClient";

export const useLoginMutation = () => {
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: (payload) => authService.login(payload),
        onMutate: () => dispatch(setLoading(true)),
        onSuccess: (data) => {
            const user = data?.user || data?.data?.user || null;
            const token = data?.token || data?.data?.token || "";
            dispatch(setAuthState({ user, token }));
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        },
        onSettled: () => dispatch(setLoading(false)),
    });
};

export const useRegisterMutation = () => {
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: (formData) => authService.register(formData),
        onMutate: () => dispatch(setLoading(true)),
        onSettled: () => dispatch(setLoading(false)),
    });
};

export const useLogoutMutation = () => {
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            dispatch(clearAuth());
            queryClient.clear();
        },
    });
};

export const useProfileMutation = () => {
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: (formData) => authService.updateProfile(formData),
        onSuccess: (data) => {
            const user = data?.user || data?.data?.user || null;
            if (user) {
                // Cookie auth only; do not read token from localStorage.
                dispatch(setAuthState({ user, token: "" }));
            }
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        },
    });
};



