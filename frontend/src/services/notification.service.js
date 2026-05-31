import { apiClient, getApiErrorMessage } from "@/lib/api";

const unwrap = (response) => response.data;

export const notificationService = {
    async getNotifications(params = {}) {
        try {
            const response = await apiClient.get("/api/v1/notifications", { params });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    async getUnreadCount() {
        try {
            const response = await apiClient.get("/api/v1/notifications/unread-count");
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    async markAsRead(notificationId) {
        try {
            const response = await apiClient.patch(`/api/v1/notifications/${notificationId}/read`);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    async markAllAsRead() {
        try {
            const response = await apiClient.patch("/api/v1/notifications/read-all");
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    async deleteNotification(notificationId) {
        try {
            const response = await apiClient.delete(`/api/v1/notifications/${notificationId}`);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    async createAnnouncement(payload) {
        try {
            const response = await apiClient.post("/api/v1/notifications/system-announcement", payload);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
};

export default notificationService;
