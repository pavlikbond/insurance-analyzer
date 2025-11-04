export type SubscriptionPlan = "ai_analyzer" | "ai_analyzer_plus";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "incomplete";

export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionPlan?: SubscriptionPlan;
  createdAt: string;
}

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface CreateCheckoutRequest {
  plan: SubscriptionPlan;
}

export interface CreateCheckoutResponse {
  checkoutUrl: string;
}

export interface HumanReview {
  id: string;
  policyId?: string;
  analysisId?: string;
  comparisonId?: string; // Keep as comparisonId for API compatibility
  status: "pending" | "in_progress" | "completed";
  reviewerNotes?: string;
  requestedAt: string;
  completedAt?: string;
}

export interface HumanReviewsResponse {
  reviews: HumanReview[];
}

export interface CreateHumanReviewRequest {
  policyId?: string;
  analysisId?: string;
  comparisonId?: string; // Keep as comparisonId for API compatibility
}

export interface CreateHumanReviewResponse {
  reviewId: string;
  paymentIntent: {
    clientSecret: string;
    amount: number; // in cents
  };
  message: string;
}
