import { apiClient, getApiErrorMessage } from "@/lib/api";

const unwrap = (response) => response.data;

export const jobService = {
    async listJobs(params = {}) {
        try {
            const response = await apiClient.get("/api/v1/job/get", { params });
            return unwrap(response);
        } catch (error) {
            if (error.response?.status === 404) {
                return { jobs: [], pagination: null };
            }
            throw new Error(getApiErrorMessage(error));
        }
    },
    async getJobById(jobId) {
        try {
            const response = await apiClient.get(`/api/v1/job/get/${jobId}`);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async getAdminJobs(params = {}) {
        try {
            const response = await apiClient.get("/api/v1/job/getadminjobs", { params });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async createJob(payload) {
        try {
            const response = await apiClient.post("/api/v1/job/post", payload);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async updateJob(jobId, payload) {
        try {
            const response = await apiClient.patch(`/api/v1/job/${jobId}`, payload);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async deleteJob(jobId) {
        try {
            const response = await apiClient.delete(`/api/v1/job/${jobId}`);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
};
