import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Bot, GitBranch, Variable, Users, MessageSquare,
  BarChart3, LayoutTemplate, Settings, Sparkles,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const main = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard },
  { title: "Bots", url: "/app/bots", icon: Bot },
  { title: "Leads", url: "/app/leads", icon: Users },
  { title: "Conversas", url: "/app/conversations", icon: MessageSquare },
  { title: "Analytics", url: "/app/analytics", icon: BarChart3 },
];

const build = [
  { title: "Templates", url: "/app/templates", icon: LayoutTemplate },
  { title: "Variáveis", url: "/app/variables", icon: Variable },
  { title: "Builder", url: "/app/builder/sdr-imob", icon: GitBranch },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (url: string) =>
    url === "/app" ? pathname === "/app" : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight">FluxBot</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">v1.0 · Workspace</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-widest text-muted-foreground/70">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {main.map((i) => (
                <SidebarMenuItem key={i.title}>
                  <SidebarMenuButton asChild isActive={isActive(i.url)} tooltip={i.title}
                    className="data-[active=true]:bg-primary/15 data-[active=true]:text-primary-foreground data-[active=true]:border-l-2 data-[active=true]:border-primary">
                    <NavLink to={i.url}>
                      <i.icon className="h-4 w-4" />
                      <span>{i.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[11px] uppercase tracking-widest text-muted-foreground/70">
            Construção
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {build.map((i) => (
                <SidebarMenuItem key={i.title}>
                  <SidebarMenuButton asChild isActive={isActive(i.url)} tooltip={i.title}
                    className="data-[active=true]:bg-primary/15 data-[active=true]:text-primary-foreground data-[active=true]:border-l-2 data-[active=true]:border-primary">
                    <NavLink to={i.url}>
                      <i.icon className="h-4 w-4" />
                      <span>{i.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Configurações">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!collapsed && (
          <div className="mt-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-glow">
              <Sparkles className="h-3.5 w-3.5" /> Plano Pro
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Você usou 64% das mensagens IA do mês.</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-[64%] gradient-primary" />
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
