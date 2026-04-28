import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { applicationService } from "@/services/application.service";
import { setAllApplicants, setApplicationPagination } from "@/redux/applicationSlice";

const useGetApplicants = (jobId, params = {}) => {
    const dispatch = useDispatch();
    const query = useQuery({
        queryKey: ["applicants", jobId, params],
        queryFn: async () => applicationService.getApplicants(jobId, params),
        select: (response) => response?.data ?? response,
        enabled: !!jobId,
    });

    useEffect(() => {
        const data = query.data;
        if (!data) {
            return;
        }

        dispatch(setAllApplicants(data?.applicants || data?.data?.applicants || []));
        dispatch(setApplicationPagination(data?.pagination || data?.data?.pagination || null));
    }, [dispatch, query.data]);

    return query;
};

export default useGetApplicants;

