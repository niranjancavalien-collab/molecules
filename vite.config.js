import { vitePlugin as remix } from "@remix-run/dev";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1600,
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
  ssr: {
    // three + R3F ship ESM that Vite should bundle rather than externalise
    noExternal: ["three", "@react-three/fiber", "@react-three/drei"],
  },
});
