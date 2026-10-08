import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Detect saved edits reliably on this Mac.
  server: { watch: { usePolling: true, interval: 300 } },
});
