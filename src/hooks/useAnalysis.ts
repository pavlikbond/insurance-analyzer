import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { Analysis } from "@/types/policy";

export function useAnalysis(policyId: string) {
  return useQuery({
    queryKey: ["analyses", policyId],
    queryFn: () => apiRequest<Analysis>(`/policies/${policyId}/analysis`),
    enabled: !!policyId,
  });
}
