import { useQuery } from "@tanstack/react-query";
import { jobService } from "@/services/job.service";

const useGetJobFilters = () => {
    return useQuery({
        queryKey: ["jobFilters"],
        queryFn: () => jobService.getJobFilters(),
        select: (response) => response?.filters ?? response?.data?.filters ?? {},
        staleTime: 5 * 60 * 1000,
    });
};

export default useGetJobFilters;
