import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "./AppLayout";
import { LandingLayout } from "./LandingLayout";

/**
 * Conditionally renders AppLayout when authenticated, LandingLayout when not
 * This allows the home page to use the same navigation as the app when signed in
 */
export function ConditionalLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // When authenticated, use AppLayout (same nav as dashboard/policies)
  // When not authenticated, use LandingLayout (landing page with Features/Pricing)
  return isAuthenticated ? <AppLayout /> : <LandingLayout />;
}
