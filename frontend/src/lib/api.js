import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const apiClient = api;

// Cookie-based auth (canonical strategy).
// Backend reads req.cookies.token, so we MUST NOT attach Authorization headers from localStorage.
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
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
