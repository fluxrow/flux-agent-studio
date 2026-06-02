import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Bot, Users, MessageSquare,
  BarChart3, LayoutTemplate, Settings, Sparkles,
  Activity, Target, DollarSign, Bell, Plug, PlayCircle, BookOpen, Wand2,
  Rocket, HeartPulse, AlertOctagon, ClipboardCheck, FlaskConical, LifeBuoy, Sparkle,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useWorkspace } from "@/auth/WorkspaceProvider";
import { isFeatureEnabled } from "@/beta/featureFlags";
import type { FeatureKey } from "@/beta/types";

type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  flag?: FeatureKey;
};

const main: NavItem[] = [
  { title: "Dashboard",     url: "/dashboard",     icon: LayoutDashboard },
  { title: "Bots",          url: "/bots",          icon: Bot },
  { title: "Leads",         url: "/leads",         icon: Users },
  { title: "Conversas",     url: "/conversations", icon: MessageSquare },
  { title: "Analytics",     url: "/analytics",     icon: BarChart3 },
  { title: "Templates",     url: "/templates",     icon: LayoutTemplate },
  { title: "Canais",        url: "/channels",      icon: Plug },
  { title: "Conectores",    url: "/connectors",    icon: Plug, flag: "connectors" },
  { title: "Documentação",  url: "/docs",          icon: LifeBuoy },
  { title: "Novidades",     url: "/updates",       icon: Sparkle },
  { title: "Configurações", url: "/settings",      icon: Settings },
];

const intel: NavItem[] = [
  { title: "Simulator",     url: "/simulator",     icon: PlayCircle },
  { title: "AI Builder",    url: "/ai-builder",    icon: Wand2, flag: "ai_builder" },
  { title: "AI Playground", url: "/ai/playground", icon: Sparkles },
  { title: "Knowledge",     url: "/knowledge",     icon: BookOpen, flag: "knowledge_base" },
  { title: "Tracking",      url: "/tracking",      icon: Activity },
  { title: "Attribution",   url: "/attribution",   icon: Target },
  { title: "Revenue",       url: "/revenue",       icon: DollarSign },
  { title: "Alertas",       url: "/alerts",        icon: Bell },
];

const beta: NavItem[] = [
  { title: "Onboarding",    url: "/onboarding",    icon: Rocket },
  { title: "Beta Program",  url: "/beta",          icon: FlaskConical },
  { title: "System Health", url: "/system-health", icon: HeartPulse },
  { title: "Errors",        url: "/errors",        icon: AlertOctagon },
  { title: "QA Dashboard",  url: "/qa",            icon: ClipboardCheck },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id ?? "ws_local_demo";
  const isActive = (url: string) =>
    url === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(url);

  // Feature-flag filter: hide nav items whose flag is off so beta users
  // don't bump into mock-only modules.
  const visible = (items: NavItem[]) =>
    items.filter((i) => !i.flag || isFeatureEnabled(workspaceId, i.flag));

  const renderGroup = (label: string, items: NavItem[]) => {
    const list = visible(items);
    if (list.length === 0) return null;
    return (
      <SidebarGroup className="mt-4 first:mt-0">
        <SidebarGroupLabel className="text-[11px] uppercase tracking-widest text-muted-foreground/70">
          {label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {list.map((i) => (
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
  };

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
        {renderGroup("Beta", beta)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {!collapsed && (
          <NavLink
            to="/docs"
            className="block rounded-xl border border-primary/30 bg-primary/5 p-3 hover:border-primary/50 transition"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-glow">
              <LifeBuoy className="h-3.5 w-3.5" /> Precisa de ajuda?
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Abra a Central de Documentação.
            </p>
          </NavLink>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
