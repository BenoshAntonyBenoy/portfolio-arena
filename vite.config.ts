import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  // Served from a root custom domain (portfolio.benosh.tech), so base is "/".
  base: "/",
  plugins: [react(), tailwindcss()],
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
