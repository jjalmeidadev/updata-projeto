import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "tests/business/**/*.spec.js",
      "tests/presentation/api/**/*.spec.js",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/business/**/*.js", "src/presentation/api/**/*.js"],
      exclude: ["**/*.spec.js", "**/node_modules/**"],
    },
  },
})
