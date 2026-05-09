import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiData } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const useResumeAnalysis = () => {
    return useQuery({
        queryKey: ['resumeAnalysis'],
        queryFn: async () => {
            const response = await apiClient.get('/api/ai/resume-analysis');
            return extractApiData(response);

        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
            if (error.response?.status === 404) return false;
            return failureCount < 2;
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error));
        },
        enabled: true, // Always fetch for profile
    });
};
