import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Boot the analytics adapter (subscribes runtime events → persistence).
import "./lib/analytics/adapter";
// Bridge runtime events → CRM (auto-creates leads from completed flows).
import { startCrmBridge } from "./lib/crm-bridge";
// Tracking core — visitor profile, attribution, session events.
import { trackingEngine, destinations } from "./tracking";
// Channel Engine — register web + stub adapters and emit channel_connected.
import { bootChannels } from "./channels";

startCrmBridge();
trackingEngine.start();
destinations.start();
bootChannels();

createRoot(document.getElementById("root")!).render(<App />);
