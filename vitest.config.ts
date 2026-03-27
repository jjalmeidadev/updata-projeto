import { defineConfig } from "vitest/config"
import path from "node:path"

const resolveFromRoot = (p: string) => path.resolve(process.cwd(), p)

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@angular\/core$/,
        replacement: resolveFromRoot("./src/presentation/web/node_modules/@angular/core/fesm2022/core.mjs"),
      },
      {
        find: /^@angular\/core\/testing$/,
        replacement: resolveFromRoot("./src/presentation/web/node_modules/@angular/core/fesm2022/testing.mjs"),
      },
      {
        find: /^@angular\/common$/,
        replacement: resolveFromRoot("./src/presentation/web/node_modules/@angular/common/fesm2022/common.mjs"),
      },
      {
        find: /^@angular\/compiler$/,
        replacement: resolveFromRoot("./src/presentation/web/node_modules/@angular/compiler/fesm2022/compiler.mjs"),
      },
      {
        find: /^@angular\/common\/http$/,
        replacement: resolveFromRoot("./src/presentation/web/node_modules/@angular/common/fesm2022/http.mjs"),
      },
      {
        find: /^@angular\/common\/http\/testing$/,
        replacement: resolveFromRoot("./src/presentation/web/node_modules/@angular/common/fesm2022/http-testing.mjs"),
      },
      {
        find: /^@angular\/forms$/,
        replacement: resolveFromRoot("./src/presentation/web/node_modules/@angular/forms/fesm2022/forms.mjs"),
      },
      {
        find: /^@angular\/router$/,
        replacement: resolveFromRoot("./src/presentation/web/node_modules/@angular/router/fesm2022/router.mjs"),
      },
      {
        find: /^@angular\/platform-browser\/testing$/,
        replacement: resolveFromRoot("./src/presentation/web/node_modules/@angular/platform-browser/fesm2022/testing.mjs"),
      },
      {
        find: /^@auth0\/auth0-angular$/,
        replacement: resolveFromRoot("./tests/mocks/auth0-angular.mock.ts"),
      },
      {
        find: /^@auth0\/auth0-spa-js$/,
        replacement: resolveFromRoot("./src/presentation/web/node_modules/@auth0/auth0-spa-js/dist/auth0-spa-js.production.esm.js"),
      },
      {
        find: /^rxjs$/,
        replacement: resolveFromRoot("./src/presentation/web/node_modules/rxjs/dist/esm/index.js"),
      },
      {
        find: /^rxjs\/operators$/,
        replacement: resolveFromRoot("./src/presentation/web/node_modules/rxjs/dist/esm/operators/index.js"),
      },
      {
        find: /^xlsx$/,
        replacement: resolveFromRoot("./src/presentation/web/node_modules/xlsx/xlsx.mjs"),
      },
    ],
  },
  test: {
    environment: "node",
    setupFiles: ["tests/setup/angular-testbed.ts"],
    environmentMatchGlobs: [
      ["tests/presentation/login/**/*.spec.ts", "jsdom"],
      ["tests/presentation/onboarding/**/*.spec.ts", "jsdom"],
      ["tests/presentation/upload/**/*.spec.ts", "jsdom"],
      ["tests/presentation/home/**/*.spec.ts", "jsdom"],
      ["tests/presentation/signup/**/*.spec.ts", "jsdom"],
      ["tests/presentation/module-selector/**/*.spec.ts", "jsdom"],
      ["tests/presentation/input-method/**/*.spec.ts", "jsdom"],
      ["tests/presentation/review/**/*.spec.ts", "jsdom"],
      ["tests/presentation/dynamic-field/**/*.spec.ts", "jsdom"],
      ["tests/presentation/services/**/*.spec.ts", "jsdom"],
    ],
    include: [
      "tests/**/*.spec.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/**/*.ts",
      ],
      exclude: [
        "**/*.spec.ts",
        "**/node_modules/**",
        "src/presentation/web/.angular/**",
        "src/business/dto/**",
        "src/presentation/web/src/app/models/**",
        "src/presentation/web/scripts/**",
        "src/presentation/web/src/main.ts",
      ],
    },
  },
})
