import * as React from "react";
import { Badge } from "@/components/ui/badge";
import type { PolicyStatus } from "@/types/policy";
import type { SubscriptionStatus } from "@/types/user";
import { cn } from "@/lib/utils";

type HumanReviewStatus = "pending" | "in_progress" | "completed" | "cancelled";

type Status = PolicyStatus | SubscriptionStatus | HumanReviewStatus;

type BadgeProps = React.ComponentProps<typeof Badge>;

interface StatusChipProps extends Omit<BadgeProps, "variant" | "children"> {
  status: Status;
  className?: string;
}

/**
 * Maps policy status to Badge variant
 */
function getPolicyStatusVariant(status: PolicyStatus): BadgeProps["variant"] {
  switch (status) {
    case "analyzed":
      return "default";
    case "processing":
      return "secondary";
    case "failed":
      return "destructive";
    case "uploaded":
    default:
      return "outline";
  }
}

/**
 * Maps subscription status to Badge variant
 */
function getSubscriptionStatusVariant(status: SubscriptionStatus): BadgeProps["variant"] {
  switch (status) {
    case "active":
      return "default";
    case "canceled":
    case "past_due":
    case "incomplete":
    default:
      return "secondary";
  }
}

/**
 * Maps human review status to Badge variant
 */
function getHumanReviewStatusVariant(status: HumanReviewStatus): BadgeProps["variant"] {
  switch (status) {
    case "completed":
      return "default";
    case "in_progress":
      return "secondary";
    case "cancelled":
      return "destructive";
    case "pending":
    default:
      return "outline";
  }
}

/**
 * Formats status text for display (capitalizes and replaces underscores)
 */
function formatStatusText(status: Status): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Gets the appropriate Badge variant for a given status
 */
function getStatusVariant(status: Status): BadgeProps["variant"] {
  // Check if it's a PolicyStatus
  const policyStatuses: PolicyStatus[] = ["uploaded", "processing", "analyzed", "failed"];
  if (policyStatuses.includes(status as PolicyStatus)) {
    return getPolicyStatusVariant(status as PolicyStatus);
  }

  // Check if it's a SubscriptionStatus
  const subscriptionStatuses: SubscriptionStatus[] = ["active", "canceled", "past_due", "incomplete"];
  if (subscriptionStatuses.includes(status as SubscriptionStatus)) {
    return getSubscriptionStatusVariant(status as SubscriptionStatus);
  }

  // Check if it's a HumanReviewStatus
  const humanReviewStatuses: HumanReviewStatus[] = ["pending", "in_progress", "completed", "cancelled"];
  if (humanReviewStatuses.includes(status as HumanReviewStatus)) {
    return getHumanReviewStatusVariant(status as HumanReviewStatus);
  }

  // Default fallback
  return "outline";
}

/**
 * Standardized StatusChip component for displaying status throughout the app.
 * Automatically maps status values to appropriate Badge variants and formats text.
 */
export function StatusChip({ status, className, ...props }: StatusChipProps) {
  const variant = getStatusVariant(status);
  const displayText = formatStatusText(status);

  return (
    <Badge variant={variant} className={cn(className)} {...props}>
      {displayText}
    </Badge>
  );
}
