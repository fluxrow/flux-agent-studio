import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Bots from "./pages/Bots";
import BotNew from "./pages/BotNew";
import Builder from "./pages/Builder";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import Conversations from "./pages/Conversations";
import Analytics from "./pages/Analytics";
import Templates from "./pages/Templates";
import Variables from "./pages/Variables";
import PublicBot from "./pages/PublicBot";
import Tracking from "./pages/Tracking";
import Attribution from "./pages/Attribution";
import Revenue from "./pages/Revenue";
import Alerts from "./pages/Alerts";
import Channels from "./pages/Channels";
import Forms from "./pages/Forms";
import Settings from "./pages/Settings";
import Simulator from "./pages/Simulator";
import DebugRepositories from "./pages/DebugRepositories";
import ChannelsDebug from "./pages/ChannelsDebug";
import AIPlayground from "./pages/AIPlayground";
import Knowledge from "./pages/Knowledge";
import { AuthProvider } from "@/auth/AuthProvider";
import { WorkspaceProvider } from "@/auth/WorkspaceProvider";
import { ProtectedRoute } from "@/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/bot/:slug" element={<PublicBot />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/bots" element={<Bots />} />
                <Route path="/bots/new" element={<BotNew />} />
                <Route path="/builder/:id" element={<Builder />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/leads/:id" element={<LeadDetail />} />
                <Route path="/conversations" element={<Conversations />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/tracking" element={<Tracking />} />
                <Route path="/attribution" element={<Attribution />} />
                <Route path="/revenue" element={<Revenue />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/variables" element={<Variables />} />
                <Route path="/channels" element={<Channels />} />
                <Route path="/forms" element={<Forms />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/simulator" element={<Simulator />} />
                <Route path="/ai/playground" element={<AIPlayground />} />
                <Route path="/knowledge" element={<Knowledge />} />
              </Route>
              <Route
                path="/debug/repositories"
                element={
                  <ProtectedRoute>
                    <DebugRepositories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/channels/debug"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ChannelsDebug />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
