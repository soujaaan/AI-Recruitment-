import { apiClient, getApiErrorMessage } from "@/lib/api";

const unwrap = (response) => response.data;

export const applicationService = {
    async apply(jobId) {
        try {
            console.log("===== APPLY REQUEST =====");
            console.log({ jobId });
            const response = await apiClient.post(`/api/v1/application/apply/${jobId}`);
            return unwrap(response);
        } catch (error) {
            console.log("APPLICATION ERROR:", error.response?.data);
            // Throw the original error or response data so component can extract message
            throw error;
        }
    },
    async getAppliedJobs(params = {}) {
        try {
            const response = await apiClient.get("/api/v1/application/get", { params });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async getApplicants(jobId, params = {}) {
        try {
            const response = await apiClient.get(`/api/v1/application/${jobId}/applicants`, { params });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async getMatchPreview(jobId) {
        try {
            const response = await apiClient.get(`/api/v1/application/match/${jobId}`);
            return response.data?.data || response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async updateStatus(applicationId, status) {
        try {
            const response = await apiClient.post(`/api/v1/application/status/${applicationId}/update`, { status });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
};
