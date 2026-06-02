import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppLayout() {
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
              <Button size="sm" variant="ghost" className="text-muted-foreground"><Bell className="h-4 w-4" /></Button>
              <Button size="sm" className="gradient-primary text-primary-foreground border-0 shadow-elegant">
                <Plus className="h-4 w-4 mr-1" /> Novo bot
              </Button>
              <div className="h-8 w-8 rounded-full gradient-accent shadow-glow ring-2 ring-background" />
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
