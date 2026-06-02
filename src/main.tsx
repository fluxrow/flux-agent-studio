import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Boot the analytics adapter (subscribes runtime events → persistence).
import "./lib/analytics/adapter";
// Bridge runtime events → CRM (auto-creates leads from completed flows).
import { startCrmBridge } from "./lib/crm-bridge";
startCrmBridge();

createRoot(document.getElementById("root")!).render(<App />);
