import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { companyService } from "@/services/company.service";
import { setCompanies, setCompanyPagination } from "@/redux/companySlice";

const useGetAllCompanies = (params = {}) => {
    const dispatch = useDispatch();
    const query = useQuery({
        queryKey: ["companies", params],
        queryFn: async () => companyService.listCompanies(params),
        select: (response) => response?.data ?? response,
    });

    useEffect(() => {
        const data = query.data;
        if (!data) {
            return;
        }

        dispatch(setCompanies(data?.companies || data?.data?.companies || []));
        dispatch(setCompanyPagination(data?.pagination || data?.data?.pagination || null));
    }, [dispatch, query.data]);

    return query;
};

export default useGetAllCompanies;
