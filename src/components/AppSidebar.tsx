import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Bot, Users, MessageSquare,
  BarChart3, LayoutTemplate, Settings, Sparkles,
  Plug, Cable, BookOpen, Wand2,
  HeartPulse, AlertOctagon, ClipboardCheck, FlaskConical, LifeBuoy, Sparkle,
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
  tooltip?: string;
};

// Phase 23B — Streamlined navigation for beta users.
// Primary items: core CRM + IA flow. Secondary: configuration & integrations.
const primary: NavItem[] = [
  { title: "Dashboard",     url: "/dashboard",     icon: LayoutDashboard },
  { title: "Bots",          url: "/bots",          icon: Bot },
  { title: "Leads",         url: "/leads",         icon: Users },
  { title: "Conversas",     url: "/conversations", icon: MessageSquare },
  { title: "Analytics",     url: "/analytics",     icon: BarChart3 },
];

const secondary: NavItem[] = [
  { title: "Templates",     url: "/templates",     icon: LayoutTemplate },
  { title: "Canais",        url: "/channels",      icon: Plug,  tooltip: "Defina onde seu agente será publicado." },
  { title: "Conectores",    url: "/connectors",    icon: Cable, tooltip: "Conecte ferramentas e serviços externos.", flag: "connectors" },
  { title: "Configurações", url: "/settings",      icon: Settings },
];

const intel: NavItem[] = [
  { title: "AI Builder",    url: "/ai-builder",    icon: Wand2,    flag: "ai_builder" },
  { title: "Knowledge",     url: "/knowledge",     icon: BookOpen, flag: "knowledge_base" },
];

const help: NavItem[] = [
  { title: "Documentação",  url: "/docs",          icon: LifeBuoy },
  { title: "Novidades",     url: "/updates",       icon: Sparkle },
];

// Internal-only — hidden from regular beta users; visible to workspace
// owners/admins for diagnostics. Pages remain accessible by URL.
const internal: NavItem[] = [
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

  const role = workspace?.role;
  const isAdmin = role === "owner" || role === "admin";

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
                  tooltip={i.tooltip ?? i.title}
                  className="data-[active=true]:bg-primary/15 data-[active=true]:text-primary-foreground data-[active=true]:border-l-2 data-[active=true]:border-primary"
                >
                  <NavLink to={i.url} title={i.tooltip}>
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

  const workspaceName = workspace?.name?.trim();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold tracking-tight">
                Flux Agent Studio
              </span>
              {workspaceName && (
                <span className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                  {workspaceName}
                </span>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {renderGroup("Principal", primary)}
        {renderGroup("Workspace", secondary)}
        {renderGroup("Intelligence", intel)}
        {renderGroup("Ajuda", help)}
        {isAdmin && renderGroup("Interno", internal)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {!collapsed && (
          <div className="rounded-xl border border-border bg-card/60 p-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/15 text-primary-glow border border-primary/30 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider">
                BETA
              </span>
              <span className="text-xs font-medium">
                {workspaceName ?? "Workspace ativo"}
              </span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
