import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, apiUpload } from "@/lib/api";
import type {
  Policy,
  PoliciesResponse,
  UploadPolicyResponse,
  BatchAnalysisRequest,
  BatchAnalysisResponse,
} from "@/types/policy";

const queryKeys = {
  all: ["policies"] as const,
  lists: () => [...queryKeys.all, "list"] as const,
  list: (filters?: { year?: number; status?: string }) => [...queryKeys.lists(), filters] as const,
  details: () => [...queryKeys.all, "detail"] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
};

export function usePolicies(filters?: { year?: number; status?: string }) {
  return useQuery({
    queryKey: queryKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.year) params.append("year", filters.year.toString());
      if (filters?.status) params.append("status", filters.status);

      const query = params.toString();
      return apiRequest<PoliciesResponse>(`/policies${query ? `?${query}` : ""}`);
    },
  });
}

export function usePolicy(id: string) {
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => apiRequest<Policy>(`/policies/${id}`),
    enabled: !!id,
  });
}

export function useUploadPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { file: File; coverageStart: string; coverageEnd?: string; description?: string }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("coverageStart", data.coverageStart); // ISO 8601: YYYY-MM-DD
      if (data.coverageEnd) {
        formData.append("coverageEnd", data.coverageEnd); // ISO 8601: YYYY-MM-DD
      }
      if (data.description) {
        formData.append("description", data.description);
      }
      return apiUpload<UploadPolicyResponse>("/policies/upload", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
}

export function useDeletePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiRequest<{ success: boolean; message: string }>(`/policies/${id}`, { method: "DELETE" });
    },
    onSuccess: (_, deletedId) => {
      // Invalidate list queries to update the policies list
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      // Invalidate the specific detail query for the deleted policy
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(deletedId) });
    },
  });
}

export function useBatchAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BatchAnalysisRequest) => {
      return apiRequest<BatchAnalysisResponse>("/analyses/batch", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
}
