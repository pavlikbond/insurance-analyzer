import { useState } from "react";
import { useRequestHumanReview } from "@/hooks/useBilling";
import { useSubscription } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HUMAN_REVIEW_PRICE } from "@/lib/constants";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface HumanReviewUpsellProps {
  policyId?: string;
  analysisId?: string;
  comparisonId?: string; // Keep as comparisonId for API compatibility
}

export function HumanReviewUpsell({ policyId, analysisId, comparisonId }: HumanReviewUpsellProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const requestReview = useRequestHumanReview();
  const { data: subscription } = useSubscription();

  const isPlusPlan = subscription?.plan === "ai_analyzer_plus";

  const handleRequestReview = async () => {
    setIsProcessing(true);
    try {
      const result = await requestReview.mutateAsync({
        policyId,
        analysisId,
        comparisonId,
      });

      // If user has Plus plan, the review is free
      if (isPlusPlan) {
        toast.success("Human review requested successfully!");
        return;
      }

      // Otherwise, redirect to Stripe checkout
      // Dynamically import Stripe only when needed
      const { loadStripe } = await import("@stripe/stripe-js");
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

      if (!stripe) {
        toast.error("Payment system not configured");
        return;
      }

      await stripe.confirmCardPayment(result.paymentIntent.clientSecret);
      toast.success("Payment processed! Human review requested.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to request review");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Human Review</CardTitle>
        <CardDescription>Get an expert review from a licensed insurance professional</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span className="text-sm">Detailed analysis by licensed professionals</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span className="text-sm">Identification of potential issues and concerns</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span className="text-sm">Recommendations for improvements</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span className="text-sm">Priority support</span>
          </div>
        </div>

        {isPlusPlan ? (
          <div className="rounded-lg bg-primary/10 p-4">
            <p className="text-sm font-medium mb-2">Included with AI Analyzer Plus Plan</p>
            <Button onClick={handleRequestReview} disabled={isProcessing} className="w-full">
              {isProcessing ? "Processing..." : "Request Human Review (Free)"}
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-2xl font-bold mb-2">${HUMAN_REVIEW_PRICE}</p>
            <p className="text-sm text-muted-foreground mb-4">One-time payment for professional review</p>
            <Button onClick={handleRequestReview} disabled={isProcessing} className="w-full">
              {isProcessing ? "Processing..." : `Request Review - $${HUMAN_REVIEW_PRICE}`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
