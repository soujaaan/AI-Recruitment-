import { apiClient, getApiErrorMessage } from "@/lib/api";

const unwrap = (response) => response.data;

export const jobService = {
async listJobs(params = {}) {
        try {
            const response = await apiClient.get("/api/jobs", { params });
            return unwrap(response);
        } catch (error) {
            if (error.response?.status === 404) {
                return { jobs: [], pagination: null }; // Graceful 404
            }
            throw new Error(getApiErrorMessage(error));
        }
    },
async getJobById(jobId) {
        try {
            const response = await apiClient.get(`/api/jobs/${jobId}`);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async getAdminJobs(params = {}) {
        try {
            const response = await apiClient.get("/job/getadminjobs", { params });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async createJob(payload) {
        try {
            const response = await apiClient.post("/job/post", payload);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async updateJob(jobId, payload) {
        try {
            const response = await apiClient.patch(`/job/${jobId}`, payload);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async deleteJob(jobId) {
        try {
            const response = await apiClient.delete(`/job/${jobId}`);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
};
