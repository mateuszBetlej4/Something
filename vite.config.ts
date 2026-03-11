import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    target: "esnext",
  },
  test: {
    globals: false,
    environment: "node",
  },
});
