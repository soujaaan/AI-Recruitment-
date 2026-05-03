import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { jobService } from "@/services/job.service";
import { applicationService } from "@/services/application.service";

export const usePostJobMutation = () => useMutation({
    mutationFn: (payload) => jobService.createJob(payload),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["jobs"] });
        queryClient.invalidateQueries({ queryKey: ["adminJobs"] });
    },
});

export const useUpdateJobMutation = () => useMutation({
    mutationFn: ({ jobId, payload }) => jobService.updateJob(jobId, payload),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["jobs"] });
        queryClient.invalidateQueries({ queryKey: ["adminJobs"] });
        queryClient.invalidateQueries({ queryKey: ["job"] });
    },
});

export const useDeleteJobMutation = () => useMutation({
    mutationFn: (jobId) => jobService.deleteJob(jobId),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["jobs"] });
        queryClient.invalidateQueries({ queryKey: ["adminJobs"] });
    },
});

export const useApplyJobMutation = () => useMutation({
    mutationFn: (jobId) => applicationService.apply(jobId),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["job"] });
        queryClient.invalidateQueries({ queryKey: ["appliedJobs"] });
    },
});

export const useUpdateApplicationStatusMutation = () => useMutation({
    mutationFn: ({ applicationId, status }) => applicationService.updateStatus(applicationId, status),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["adminJobs"] });
        queryClient.invalidateQueries({ queryKey: ["applicants"] });
    },
});

export const useJobMutations = () => ({
    createJob: usePostJobMutation(),
    updateJob: useUpdateJobMutation(),
    deleteJob: useDeleteJobMutation(),
    applyJob: useApplyJobMutation(),
    updateApplicationStatus: useUpdateApplicationStatusMutation(),
});
