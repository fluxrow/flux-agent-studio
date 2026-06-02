import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Boot the analytics adapter (subscribes runtime events → persistence).
import "./lib/analytics/adapter";

createRoot(document.getElementById("root")!).render(<App />);
