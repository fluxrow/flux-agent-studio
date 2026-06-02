import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Bots from "./pages/Bots";
import Builder from "./pages/Builder";
import Leads from "./pages/Leads";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/bot/:slug" element={<PublicBot />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="bots" element={<Bots />} />
            <Route path="builder/:id" element={<Builder />} />
            <Route path="leads" element={<Leads />} />
            <Route path="conversations" element={<Conversations />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="tracking" element={<Tracking />} />
            <Route path="attribution" element={<Attribution />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="templates" element={<Templates />} />
            <Route path="variables" element={<Variables />} />
            <Route path="channels" element={<Channels />} />
            <Route path="forms" element={<Forms />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
