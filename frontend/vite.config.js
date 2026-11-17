import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// --host lets you open the app from your Android phone over the same WiFi
// (see README.md "Testing on your Android phone" section)
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
