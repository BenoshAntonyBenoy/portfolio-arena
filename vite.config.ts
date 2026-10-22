import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import type { Plugin } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  // Served from a root custom domain (portfolio.benosh.tech), so base is "/".
  base: "/",
  plugins: [react(), tailwindcss(), staticEntries()],
  // Tailwind v4 runs via its Vite plugin; disable PostCSS file lookup so Vite
  // doesn't walk up and pick a stray postcss.config from a parent directory.
  css: { postcss: {} },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    target: "es2020",
    cssMinify: true,
    rollupOptions: {
      output: {
        // Split the framer-motion/React vendor chunk for better caching.
        manualChunks: {
          react: ["react", "react-dom"],
          motion: ["framer-motion"],
        },
      },
    },
  },
});

// A real directory entry lets Pages serve /admin/ with HTTP 200. Keep the
// existing fallback for other paths; a 404 fallback alone keeps its 404 status.
function staticEntries(): Plugin {
  return {
    name: "static-page-entries",
    apply: "build",
    closeBundle() {
      const dist = path.resolve(__dirname, "dist");
      copyFileSync(path.join(dist, "index.html"), path.join(dist, "404.html"));
      const admin = readFileSync(path.join(dist, "index.html"), "utf8")
        .replace(/<title>[^<]*<\/title>/, "<title>Portfolio editor · Benosh Benoy</title>")
        .replace("<head>", '<head>\n    <meta name="robots" content="noindex, nofollow" />')
        .replace('href="https://portfolio.benosh.tech/"', 'href="https://portfolio.benosh.tech/admin/"');
      mkdirSync(path.join(dist, "admin"), { recursive: true });
      writeFileSync(path.join(dist, "admin", "index.html"), admin);
    },
  };
}
