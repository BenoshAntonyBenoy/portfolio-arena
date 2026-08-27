import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

/* Two destinations, one bundle. GitHub Pages has no rewrites, so the build
   also writes dist/404.html as a copy of index.html - Pages serves that for
   any unknown path, which lands here and lets the check below take over. See
   the copy404 plugin in vite.config.ts.

   No router: one extra route does not justify the dependency, and the panel is
   somewhere you go rather than a tab you flick between.

   It is loaded lazily so a visitor reading the portfolio never downloads the
   editor, nor the Supabase client it needs for sign-in and uploads. Reading
   content needs neither. */
const AdminApp = lazy(() => import("./admin/AdminApp"));

const isAdmin = /^\/admin\/?$/.test(window.location.pathname);

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
