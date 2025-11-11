import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useSession } from "@/lib/auth-client";

interface AuthContextType {
  user: {
    id: string;
    email: string;
    name?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Call useSession() once at the top level - this is the only place it's called
  const { data: session, isPending } = useSession();

  const value: AuthContextType = {
    user: session?.user || null,
    isAuthenticated: !!session?.user,
    isLoading: isPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
