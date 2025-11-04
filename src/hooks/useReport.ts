import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { Report, ReportsResponse, CreateReportRequest, CreateReportResponse } from "@/types/report";

const queryKeys = {
  all: ["reports"] as const,
  lists: () => [...queryKeys.all, "list"] as const,
  details: () => [...queryKeys.all, "detail"] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
};

export function useReports() {
  return useQuery({
    queryKey: queryKeys.lists(),
    queryFn: () => apiRequest<ReportsResponse>("/reports"),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => apiRequest<Report>(`/reports/${id}`),
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReportRequest) => {
      return apiRequest<CreateReportResponse>("/reports", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
}
