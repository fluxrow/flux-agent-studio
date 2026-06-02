/**
 * AdminRoute — Internal-only gate.
 *
 * Used for diagnostic / staff routes: /qa, /debug/repositories,
 * /channels/debug, /system-health, /errors.
 *
 * Policy (Phase 18.6):
 *   - In mock mode (USE_SUPABASE === false) we keep the routes open so
 *     local development still works.
 *   - In Supabase mode we require an authenticated session AND that the
 *     user owns the active workspace. A proper `app_role` table will
 *     replace the owner heuristic once Phase 19 lands.
 *   - Unauthorized users are redirected to /dashboard rather than seeing
 *     a 404 to make the gate obvious.
 */
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useWorkspace } from "./WorkspaceProvider";
import { USE_SUPABASE } from "@/lib/runtime-config";

export function AdminRoute({ children }: { children: React.ReactNode }) {
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

  // Workspace-role based admin gate. A formal app_role table will replace
  // this heuristic in Phase 19; for now only owners/admins reach internal tooling.
  const role = workspace?.role;
  const isAdmin = role === "owner" || role === "admin";
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
