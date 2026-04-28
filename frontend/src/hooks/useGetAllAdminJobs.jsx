import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { jobService } from "@/services/job.service";
import { setAllAdminJobs, setAdminJobPagination } from "@/redux/jobSlice";

const useGetAllAdminJobs = (params = {}) => {
    const dispatch = useDispatch();
    const query = useQuery({
        queryKey: ["adminJobs", params],
        queryFn: async () => jobService.getAdminJobs(params),
        select: (response) => response?.data ?? response,
    });

    useEffect(() => {
        const data = query.data;
        if (!data) {
            return;
        }

        dispatch(setAllAdminJobs(data?.jobs || data?.data?.jobs || []));
        dispatch(setAdminJobPagination(data?.pagination || data?.data?.pagination || null));
    }, [dispatch, query.data]);

    return query;
};

export default useGetAllAdminJobs;
