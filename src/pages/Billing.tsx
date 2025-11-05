import { useState } from "react";
import { useSubscription } from "@/hooks/useUser";
import { useCreateCheckout, useCancelSubscription } from "@/hooks/useBilling";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function Billing() {
  const { data: subscription, isLoading } = useSubscription();
  const createCheckout = useCreateCheckout();
  const cancelSubscription = useCancelSubscription();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async (plan: "ai_analyzer" | "ai_analyzer_plus") => {
    setIsProcessing(true);
    try {
      const result = await createCheckout.mutateAsync({ plan });
      window.location.href = result.checkoutUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create checkout");
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? It will remain active until the end of the billing period."
      )
    ) {
      return;
    }

    try {
      await cancelSubscription.mutateAsync();
      toast.success("Subscription will be canceled at the end of the billing period");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel subscription");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading subscription...</div>;
  }

  const currentPlan = subscription?.plan || null;
  const isActive = subscription?.status === "active";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">Manage your subscription and billing</p>
      </div>

      {subscription && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>{subscription.status === "active" ? "Active" : "Inactive"}</CardDescription>
              </div>
              <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                {subscription.plan === "ai_analyzer_plus" ? "AI Analyzer Plus" : "AI Analyzer"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Period</p>
                <p className="text-sm">
                  {new Date(subscription.currentPeriodStart).toLocaleDateString()} -{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-sm capitalize">{subscription.status}</p>
              </div>
            </div>

            {subscription.cancelAtPeriodEnd && (
              <Alert>
                <AlertDescription>
                  Your subscription will be canceled at the end of the current billing period.
                </AlertDescription>
              </Alert>
            )}

            {isActive && !subscription.cancelAtPeriodEnd && (
              <Button variant="outline" onClick={handleCancel} disabled={cancelSubscription.isPending}>
                Cancel Subscription
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={currentPlan === "ai_analyzer" ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>AI Analyzer</CardTitle>
            <CardDescription>Basic AI analysis features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-bold">$29</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Unlimited policy uploads</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">AI-powered analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Year-over-year reports</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Email notifications</span>
              </li>
            </ul>
            <Button
              className="w-full"
              variant={currentPlan === "ai_analyzer" ? "default" : "outline"}
              onClick={() => handleUpgrade("ai_analyzer")}
              disabled={isProcessing || currentPlan === "ai_analyzer"}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : currentPlan === "ai_analyzer" ? (
                "Current Plan"
              ) : (
                "Select Plan"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className={currentPlan === "ai_analyzer_plus" ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>AI Analyzer Plus</CardTitle>
            <CardDescription>Everything in AI Analyzer + Human Review</CardDescription>
            {currentPlan === "ai_analyzer_plus" && (
              <Badge variant="default" className="mt-2">
                Current Plan
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-bold">$49</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Everything in AI Analyzer</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Human review access included</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Priority support</span>
              </li>
            </ul>
            <Button
              className="w-full"
              variant={currentPlan === "ai_analyzer_plus" ? "default" : "outline"}
              onClick={() => handleUpgrade("ai_analyzer_plus")}
              disabled={isProcessing || currentPlan === "ai_analyzer_plus"}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : currentPlan === "ai_analyzer_plus" ? (
                "Current Plan"
              ) : (
                "Select Plan"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
