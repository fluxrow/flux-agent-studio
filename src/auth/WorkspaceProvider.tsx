import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { setCurrentWorkspaceId } from "@/domain/persistence/workspaceContext";

interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface WorkspaceContextValue {
  workspace: WorkspaceInfo | null;
  workspaces: WorkspaceInfo[];
  loading: boolean;
  refresh: () => Promise<void>;
  switchTo: (id: string) => void;
}

const Ctx = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [active, setActive] = useState<WorkspaceInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user) {
      setWorkspaces([]);
      setActive(null);
      setCurrentWorkspaceId(null);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("workspace_members")
      .select("role, workspace:workspaces(id, name, slug)")
      .eq("user_id", user.id);
    setLoading(false);
    if (error) {
      console.error("[WorkspaceProvider] load", error);
      return;
    }
    const list: WorkspaceInfo[] = (data ?? [])
      .filter((r: any) => r.workspace)
      .map((r: any) => ({
        id: r.workspace.id,
        name: r.workspace.name,
        slug: r.workspace.slug,
        role: r.role,
      }));
    setWorkspaces(list);
    const stored = localStorage.getItem("fluxbot.workspace");
    const next = list.find((w) => w.id === stored) ?? list[0] ?? null;
    setActive(next);
    setCurrentWorkspaceId(next?.id ?? null);
  };

  useEffect(() => {
    load();
     
  }, [user?.id]);

  const switchTo = (id: string) => {
    const w = workspaces.find((x) => x.id === id);
    if (!w) return;
    setActive(w);
    setCurrentWorkspaceId(w.id);
    localStorage.setItem("fluxbot.workspace", w.id);
  };

  return (
    <Ctx.Provider value={{ workspace: active, workspaces, loading, refresh: load, switchTo }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
