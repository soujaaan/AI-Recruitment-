import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { companyService } from "@/services/company.service";
import { setSingleCompany } from "@/redux/companySlice";

const useGetCompanyById = (companyId) => {
    const dispatch = useDispatch();
    const query = useQuery({
        queryKey: ["company", companyId],
        enabled: Boolean(companyId),
        queryFn: async () => companyService.getCompanyById(companyId),
        select: (response) => response?.data ?? response,
    });

    useEffect(() => {
        const data = query.data;
        if (!data) {
            return;
        }

        dispatch(setSingleCompany(data?.company || data?.data?.company || null));
    }, [dispatch, query.data]);

    return query;
};

export default useGetCompanyById;
