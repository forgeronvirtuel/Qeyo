import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],

    // Only run unit/component tests
    include: ["src/**/*.test.{ts,tsx}"],

    // Never pick up Playwright tests or config
    exclude: ["e2e/**", "playwright.config.{ts,js,mjs,cjs}"],
  },
});
