import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { jobService } from "@/services/job.service";
import { setAllJobs, setJobFeedMeta, setJobPagination } from "@/redux/jobSlice";

const useGetAllJobs = (params = {}) => {
    const dispatch = useDispatch();
    const query = useQuery({
        queryKey: ["jobs", params],
        queryFn: async () => jobService.listJobs(params),
        select: (response) => response?.data ?? response,
    });

    useEffect(() => {
        const data = query.data;
        if (!data) {
            return;
        }

        dispatch(setAllJobs(data?.jobs || data?.data?.jobs || []));
        dispatch(setJobPagination(data?.pagination || data?.data?.pagination || null));
        dispatch(
            setJobFeedMeta({
                feedType: data?.feedType || data?.data?.feedType || "latest",
                personalized: data?.personalized ?? data?.data?.personalized ?? false,
            })
        );
    }, [dispatch, query.data]);

    return query;
};

export default useGetAllJobs;
