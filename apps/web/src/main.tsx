import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { NotificationProvider } from "./context/NotificationContext";
import "./index.css";
createRoot(document.getElementById("root")!).render(<StrictMode><AppErrorBoundary><NotificationProvider><App /></NotificationProvider></AppErrorBoundary></StrictMode>);
