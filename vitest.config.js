import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.js", "tests/dom/**/*.test.js"],
    environment: "node",
    // DOM-facing tests opt into jsdom by living under tests/dom.
    environmentMatchGlobs: [["tests/dom/**", "jsdom"]],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.js"],
      reporter: ["text", "html"],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
});
