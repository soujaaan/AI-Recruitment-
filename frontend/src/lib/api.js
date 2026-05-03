import axios from "axios";
import { API_BASE_URL } from "@/utils/constant";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem("accessToken");
        }

        return Promise.reject(error);
    }
);

export const extractApiData = (response) => response?.data?.data ?? response?.data ?? {};

export const getApiErrorMessage = (error) => {
    return error?.response?.data?.message || error?.message || "Something went wrong";
};
