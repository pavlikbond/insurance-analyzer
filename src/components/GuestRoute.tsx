import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard for guest-only pages (sign in, sign up, etc.)
 * Redirects authenticated users to dashboard
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
