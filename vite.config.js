import { defineConfig } from "vite";

export default defineConfig({
  // Static host (Cloudflare Workers assets) serves from the root.
  base: "/",
  build: {
    outDir: "dist",
    // Content modules are large; keep the warning meaningful rather than noisy.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Split content away from app logic so a copy change doesn't bust the
        // app bundle, and lazily-loaded tabs land in their own files.
        manualChunks(id) {
          if (id.includes("/src/content/feed.js")) return "content-feed";
          if (id.includes("/src/content/")) return "content";
          if (id.includes("/src/lib/")) return "lib";
        },
      },
    },
  },
  server: { port: 8099, host: true },
  preview: { port: 8099, host: true },
});
