import { apiClient, getApiErrorMessage } from "@/lib/api";

const unwrap = (response) => response.data;

export const companyService = {
    async listCompanies(params = {}) {
        try {
            const response = await apiClient.get("/api/v1/company", { params });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    async getCompanyById(companyId) {
        try {
            const response = await apiClient.get(`/api/v1/company/${companyId}`);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    async createCompany(payload) {
        try {
            const response = await apiClient.post("/api/v1/company", payload);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    async updateCompany(companyId, formData) {
        try {
            const response = await apiClient.put(`/api/v1/company/${companyId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
};

