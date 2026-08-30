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
    // Most item sprites (src/assets/sprites/*.png) are well under Vite's
    // default 4KB inline threshold, so without this they'd get base64'd
    // straight into the JS bundle instead of emitted as separate files —
    // `sprites.ts`'s `import.meta.glob(..., { eager: true })` only resolves
    // cheap URL strings eagerly, not image bytes; browsers should still
    // fetch/cache each sprite as its own file, lazily, only for rows
    // actually scrolled into view.
    assetsInlineLimit: 0,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
