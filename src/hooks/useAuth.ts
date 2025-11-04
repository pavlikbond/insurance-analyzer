import { useSession } from "@/lib/auth";

export function useAuth() {
  const { data: session, isPending } = useSession();

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: isPending,
  };
}
