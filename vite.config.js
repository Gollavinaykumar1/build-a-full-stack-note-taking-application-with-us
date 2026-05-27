import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/build-a-full-stack-note-taking-application-with-user-authentication-createeditdelete-notes-responsiv/",
  build: { outDir: "dist", assetsDir: "assets" },
  server: { port: 3000 },
});
