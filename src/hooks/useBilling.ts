import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type {
  CreateCheckoutRequest,
  CreateCheckoutResponse,
  CreateHumanReviewRequest,
  CreateHumanReviewResponse,
} from "@/types/user";

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (data: CreateCheckoutRequest) => {
      return apiRequest<CreateCheckoutResponse>("/subscriptions/create-checkout", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });
}

export function useCancelSubscription() {
  return useMutation({
    mutationFn: async () => {
      return apiRequest<{ success: boolean; message: string }>("/subscriptions/cancel", {
        method: "POST",
      });
    },
  });
}

export function useRequestHumanReview() {
  return useMutation({
    mutationFn: async (data: CreateHumanReviewRequest) => {
      return apiRequest<CreateHumanReviewResponse>("/human-reviews", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });
}
