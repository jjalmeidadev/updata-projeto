import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "tests/business/**/*.spec.ts",
      "tests/presentation/api/**/*.spec.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/business/**/*.ts", "src/presentation/api/**/*.ts"],
      exclude: ["**/*.spec.ts", "**/node_modules/**"],
    },
  },
})
