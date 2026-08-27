import { copyFileSync } from "fs";
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
  plugins: [react(), tailwindcss(), copy404()],
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

/**
 * GitHub Pages serves static files and nothing else - there is no rewrite rule
 * to point unknown paths back at index.html. Without this, /admin works when
 * you navigate to it inside the app but returns a genuine 404 on a direct
 * visit, a refresh, or a bookmark.
 *
 * Pages does serve 404.html for anything it cannot find, so shipping a copy of
 * index.html under that name turns the miss into a normal app boot, and
 * main.tsx routes from there. The cost is that a genuinely wrong URL also
 * loads the portfolio rather than an error page, which for a personal site is
 * the better of the two.
 */
function copy404(): Plugin {
  return {
    name: "copy-index-to-404",
    apply: "build",
    closeBundle() {
      const dist = path.resolve(__dirname, "dist");
      copyFileSync(path.join(dist, "index.html"), path.join(dist, "404.html"));
    },
  };
}
