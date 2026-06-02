import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useWorkspace } from "./WorkspaceProvider";
import { USE_SUPABASE } from "@/lib/runtime-config";

/**
 * Protects routes when Supabase mode is active. In mock mode the app
 * is open (no auth) so this component just renders children.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const { workspace, loading: wsLoading } = useWorkspace();
  const location = useLocation();

  if (!USE_SUPABASE) return <>{children}</>;

  if (authLoading || (session && wsLoading && !workspace)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-primary-glow" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
