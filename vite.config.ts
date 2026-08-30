import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// `base: "./"` makes the production build use relative asset paths, so the
// same build works when served from a domain root (Netlify, Vercel) or from
// a GitHub Pages project subpath (https://user.github.io/repo/) without any
// extra configuration. See README "Deployment" for details.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    // The generated item catalog (~6,133 items) is bundled as JSON and
    // dominates this number; it's a single cacheable ~200KB-gzipped chunk
    // fetched once, not per-item network calls, so this is an expected
    // size rather than something to code-split away. See README
    // "Performance".
    chunkSizeWarningLimit: 1100,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
