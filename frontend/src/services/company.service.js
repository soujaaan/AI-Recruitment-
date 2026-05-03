import { apiClient, getApiErrorMessage } from "@/lib/api";

const unwrap = (response) => response.data;

export const companyService = {
    async registerCompany(payload) {
        try {
            const response = await apiClient.post("/api/v1/company/register", payload);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async getCompanies() {
        try {
            const response = await apiClient.get("/api/v1/company/get");
            return unwrap(response);
        } catch (error) {
            if (error.response?.status === 404) {
                return { companies: [] };
            }
            throw new Error(getApiErrorMessage(error));
        }
    },
    async getCompanyById(companyId) {
        try {
            const response = await apiClient.get(`/api/v1/company/get/${companyId}`);
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async updateCompany(companyId, formData) {
        try {
            const response = await apiClient.put(`/api/v1/company/update/${companyId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }
};
