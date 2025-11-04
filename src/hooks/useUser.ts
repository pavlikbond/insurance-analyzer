import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { User, Subscription } from "@/types/user";

export function useUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => apiRequest<User>("/user/me"),
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription", "current"],
    queryFn: () => apiRequest<Subscription>("/subscriptions/current"),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name?: string }) => {
      return apiRequest<User>("/user/me", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}
