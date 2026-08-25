import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/apple.svg"],
      workbox: {
        // exceljs (export .xlsx solo del docente, importado dinámicamente) si no se excluye
        // se precachea igual en el dispositivo de cada alumno al instalar la PWA — mejor
        // que se baje bajo demanda.
        globIgnores: ["**/exceljs*.js"],
      },
      manifest: {
        name: "Teacher's Pet",
        short_name: "Teacher's Pet",
        description: "Practice English by playing exercises by level and difficulty.",
        lang: "en",
        theme_color: "#FF6B6B",
        background_color: "#FFF8E7",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icons/apple.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
