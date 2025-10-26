import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /*  build: {
    outDir: "/var/www/dist",
    emptyOutDir: true,
  }, */

  server: {
    host: "nextonline.aps.dz",
    port: 5173,
    strictPort: true,
    open: false,
  },
});
