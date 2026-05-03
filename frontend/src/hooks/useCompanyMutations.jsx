import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { companyService } from "@/services/company.service";

export const useGetCompaniesQuery = () => useQuery({
    queryKey: ["companies"],
    queryFn: () => companyService.getCompanies()
});

export const useGetCompanyByIdQuery = (companyId) => useQuery({
    queryKey: ["company", companyId],
    queryFn: () => companyService.getCompanyById(companyId),
    enabled: !!companyId
});

export const useRegisterCompanyMutation = () => useMutation({
    mutationFn: (payload) => companyService.registerCompany(payload),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["companies"] });
    }
});

export const useUpdateCompanyMutation = () => useMutation({
    mutationFn: ({ companyId, formData }) => companyService.updateCompany(companyId, formData),
    onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["companies"] });
        queryClient.invalidateQueries({ queryKey: ["company", variables.companyId] });
    }
});

export const useCompanyMutations = () => ({
    registerCompany: useRegisterCompanyMutation(),
    updateCompany: useUpdateCompanyMutation()
});
