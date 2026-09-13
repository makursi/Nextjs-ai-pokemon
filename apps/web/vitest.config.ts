import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Unit tests for Tool logic and shared helpers only, in a Node environment —
 * no Next runtime, no DOM. A Tool that needs browser APIs is tested through
 * its pure parts; see `docs/adr/0003-vitest-for-unit-tests.md`.
 */
export default defineConfig({
  resolve: {
    // Mirrors the `@/*` mapping in tsconfig.json, which Vite does not read.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // Scoped rather than the default glob so build output in `.next` is
    // never collected.
    include: ["src/**/*.test.ts"],
  },
});
