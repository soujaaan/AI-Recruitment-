import { apiClient, getApiErrorMessage } from "@/lib/api";

const unwrap = (response) => response.data;

export const applicationService = {
    async apply(jobId) {
        try {
            const response = await apiClient.post(`/api/v1/application/apply/${jobId}`);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
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
    async updateStatus(applicationId, status) {
        try {
            const response = await apiClient.post(`/api/v1/application/status/${applicationId}/update`, { status });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
};
