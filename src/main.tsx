import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

/* Two destinations, one bundle. The build emits admin/index.html so direct
   visits and refreshes receive HTTP 200 on Pages. The 404 entry remains a
   fallback for unknown paths. See staticEntries in vite.config.ts.

   No router: one extra route does not justify the dependency, and the panel is
   somewhere you go rather than a tab you flick between.

   It is loaded lazily so a visitor reading the portfolio never downloads the
   editor, nor the Supabase client it needs for sign-in and uploads. Reading
   content needs neither. */
const AdminApp = lazy(() => import("./admin/AdminApp"));

const isAdmin = /^\/admin(?:\/(?:index\.html)?)?$/.test(window.location.pathname);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isAdmin ? (
      // Inline styles on purpose: this shows while the chunk carrying the
      // panel's stylesheet is still in flight, so no class name would apply.
      <Suspense
        fallback={
          <p style={{ padding: "48px 20px", color: "#8d8a85", fontFamily: "system-ui, sans-serif" }}>
            Loading the editor...
          </p>
        }
      >
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>
);
