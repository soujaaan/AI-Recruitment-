import { apiClient, getApiErrorMessage } from '@/lib/api';

export const interviewService = {
    async schedule(payload) {
        try {
            const res = await apiClient.post('/api/interviews/schedule', payload);
            return res.data?.data || res.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async getMyInterviews() {
        try {
            const res = await apiClient.get('/api/interviews/me');
            return res.data?.data?.schedules || res.data?.schedules || [];
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
};
