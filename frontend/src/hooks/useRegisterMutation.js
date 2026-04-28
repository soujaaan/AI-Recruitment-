import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { authService } from "@/services/auth.service";
import { setLoading } from "@/redux/authSlice";

export const useRegisterMutation = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (values) => authService.register(values),
    onMutate: () => {
      dispatch(setLoading(true));
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.message || "Registration failed";
      console.error("Register error:", message);
      // Error handled by component toast(error.message)
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

