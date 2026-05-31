import { apiClient, getApiErrorMessage } from "@/lib/api";

const unwrap = (response) => response.data;

export const authService = {

    async register(formData) {
        try {
            const response = await apiClient.post("/api/auth/send-otp", formData);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async registerJson(payload) {
        try {
            const response = await apiClient.post("/api/auth/send-otp", payload);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async verifyOtp(payload) {
        try {
            const response = await apiClient.post("/api/auth/verify-otp", payload);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async resendOtp(payload) {
        try {
            const response = await apiClient.post("/api/auth/resend-otp", payload);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async login(payload) {
        try {
            const response = await apiClient.post("/api/v1/user/login", payload);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async logout() {
        try {
            const response = await apiClient.post("/api/v1/user/logout");
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async me() {
        try {
            const response = await apiClient.get("/api/v1/user/me");
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async updateProfile(formData) {
        try {
            const response = await apiClient.post("/api/v1/user/profile/update", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async forgotPassword(payload) {
        try {
            const response = await apiClient.post("/api/auth/forgot-password", payload);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async resetPassword(token, payload) {
        try {
            const response = await apiClient.post(`/api/auth/reset-password/${token}`, payload);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
};

