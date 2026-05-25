import axios from "axios";
import { API_BASE_URL } from "@/utils/constant";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Cookie-based auth (canonical strategy).
// Backend reads req.cookies.token, so we MUST NOT attach Authorization headers from localStorage.
apiClient.interceptors.request.use((config) => {
    return config;
});



apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // With cookie auth, we don't manage bearer tokens in localStorage.
        return Promise.reject(error);
    }
);


export const extractApiData = (response) => response?.data?.data ?? response?.data ?? {};

export const getApiErrorMessage = (error) => {
    return error?.response?.data?.message || error?.message || "Something went wrong";
};
