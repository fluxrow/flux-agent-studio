import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/auth/AuthProvider";
import { useWorkspace } from "@/auth/WorkspaceProvider";
import { USE_SUPABASE } from "@/lib/runtime-config";

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { workspace } = useWorkspace();

  const displayName = user?.user_metadata?.full_name
    ?? user?.email?.split("@")[0]
    ?? "Cauã";
  const initials = displayName
    .split(" ")
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground w-72">
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">Buscar bots, leads, conversas...</span>
              <kbd className="ml-auto text-[10px] rounded border border-border bg-background px-1.5 py-0.5">⌘K</kbd>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {USE_SUPABASE && workspace && (
                <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-2.5 py-1">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Workspace</span>
                  <span className="text-xs font-medium">{workspace.name}</span>
                </div>
              )}
              <Button size="sm" variant="ghost" className="text-muted-foreground"><Bell className="h-4 w-4" /></Button>
              <Button
                size="sm"
                className="gradient-primary text-primary-foreground border-0 shadow-elegant"
                onClick={() => navigate("/bots/new")}
              >
                <Plus className="h-4 w-4 mr-1" /> Novo bot
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 rounded-full gradient-accent shadow-glow ring-2 ring-background text-xs font-bold text-background flex items-center justify-center">
                    {initials || "FB"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="text-sm font-medium">{displayName}</div>
                    <div className="text-xs text-muted-foreground font-normal">{user?.email ?? "modo demo"}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/settings")}>Configurações</DropdownMenuItem>
                  {USE_SUPABASE && (
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="h-3.5 w-3.5 mr-2" /> Sair
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
