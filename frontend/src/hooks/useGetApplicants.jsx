import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { applicationService } from "@/services/application.service";
import { setAllApplicants, setApplicationPagination } from "@/redux/applicationSlice";
import { isValidMongoId, toMongoIdString } from "@/utils/mongoId";

const useGetApplicants = (jobId, params = {}) => {
    const dispatch = useDispatch();
    const normalizedJobId = toMongoIdString(jobId);
    const query = useQuery({
        queryKey: ["applicants", normalizedJobId, params],
        queryFn: async () => applicationService.getApplicants(normalizedJobId, params),
        select: (response) => response?.data ?? response,
        enabled: isValidMongoId(normalizedJobId),
    });

    useEffect(() => {
        const data = query.data;
        if (!data) {
            return;
        }

        dispatch(
            setAllApplicants(
                data?.applications ||
                    data?.data?.applications ||
                    data?.applicants ||
                    data?.data?.applicants ||
                    []
            )
        );
        dispatch(setApplicationPagination(data?.pagination || data?.data?.pagination || null));
    }, [dispatch, query.data]);

    return query;
};

export default useGetApplicants;

