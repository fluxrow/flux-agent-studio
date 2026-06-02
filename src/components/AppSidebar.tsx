import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Bot, Users, MessageSquare,
  BarChart3, LayoutTemplate, Settings, Sparkles,
  Activity, Target, DollarSign, Bell, Plug, PlayCircle,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const main = [
  { title: "Dashboard",     url: "/dashboard",     icon: LayoutDashboard },
  { title: "Bots",          url: "/bots",          icon: Bot },
  { title: "Leads",         url: "/leads",         icon: Users },
  { title: "Conversas",     url: "/conversations", icon: MessageSquare },
  { title: "Analytics",     url: "/analytics",     icon: BarChart3 },
  { title: "Templates",     url: "/templates",     icon: LayoutTemplate },
  { title: "Canais",        url: "/channels",      icon: Plug },
  { title: "Configurações", url: "/settings",      icon: Settings },
];

const intel = [
  { title: "Simulator",   url: "/simulator",   icon: PlayCircle },
  { title: "Tracking",    url: "/tracking",    icon: Activity },
  { title: "Attribution", url: "/attribution", icon: Target },
  { title: "Revenue",     url: "/revenue",     icon: DollarSign },
  { title: "Alertas",     url: "/alerts",      icon: Bell },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (url: string) =>
    url === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(url);

  const renderGroup = (label: string, items: typeof main) => (
    <SidebarGroup className="mt-4 first:mt-0">
      <SidebarGroupLabel className="text-[11px] uppercase tracking-widest text-muted-foreground/70">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((i) => (
            <SidebarMenuItem key={i.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(i.url)}
                tooltip={i.title}
                className="data-[active=true]:bg-primary/15 data-[active=true]:text-primary-foreground data-[active=true]:border-l-2 data-[active=true]:border-primary"
              >
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
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
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
        {renderGroup("Principal", main)}
        {renderGroup("Intelligence", intel)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {!collapsed && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
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
