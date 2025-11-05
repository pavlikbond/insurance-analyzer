import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { Report, ReportsResponse, CreateAnalysisRequest, CreateAnalysisResponse } from "@/types/report";

const queryKeys = {
  all: ["analyses"] as const,
  lists: () => [...queryKeys.all, "list"] as const,
  details: () => [...queryKeys.all, "detail"] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
};

export function useReports() {
  return useQuery({
    queryKey: queryKeys.lists(),
    queryFn: async () => {
      const response = await apiRequest<ReportsResponse>("/analyses");
      // Transform analyses to reports for compatibility
      return {
        reports: response.analyses.map((analysis) => ({
          ...analysis,
        })),
        total: response.total,
      };
    },
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => apiRequest<Report>(`/analyses/${id}`),
    enabled: !!id,
  });
}

export function useCreateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAnalysisRequest) => {
      return apiRequest<CreateAnalysisResponse>("/analyses", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate analyses list
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      // Invalidate the specific policy's analysis
      queryClient.invalidateQueries({ queryKey: ["analyses", variables.policyId] });
      // Invalidate the policy to update its status
      queryClient.invalidateQueries({ queryKey: ["policies", "detail", variables.policyId] });
      // Invalidate policies list to update status badges
      queryClient.invalidateQueries({ queryKey: ["policies", "list"] });
    },
  });
}
