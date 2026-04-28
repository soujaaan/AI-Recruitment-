import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { applicationService } from "@/services/application.service";
import { setAllAppliedJobs, setAppliedJobPagination } from "@/redux/jobSlice";

const useGetAppliedJobs = (params = {}) => {
    const dispatch = useDispatch();
    const query = useQuery({
        queryKey: ["appliedJobs", params],
        queryFn: async () => applicationService.getAppliedJobs(params),
        select: (response) => response?.data ?? response,
    });

    useEffect(() => {
        const data = query.data;
        if (!data) {
            return;
        }

        dispatch(setAllAppliedJobs(data?.application || data?.data?.application || []));
        dispatch(setAppliedJobPagination(data?.pagination || data?.data?.pagination || null));
    }, [dispatch, query.data]);

    return query;
};

export default useGetAppliedJobs;
