import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const resolveFromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@angular\/core$/,
        replacement: resolveFromRoot('./node_modules/@angular/core/fesm2022/core.mjs'),
      },
      {
        find: /^@angular\/core\/testing$/,
        replacement: resolveFromRoot('./node_modules/@angular/core/fesm2022/testing.mjs'),
      },
      {
        find: /^@angular\/common$/,
        replacement: resolveFromRoot('./node_modules/@angular/common/fesm2022/common.mjs'),
      },
      {
        find: /^@angular\/common\/http$/,
        replacement: resolveFromRoot('./node_modules/@angular/common/fesm2022/http.mjs'),
      },
      {
        find: /^@angular\/common\/http\/testing$/,
        replacement: resolveFromRoot('./node_modules/@angular/common/fesm2022/http-testing.mjs'),
      },
      {
        find: /^@angular\/forms$/,
        replacement: resolveFromRoot('./node_modules/@angular/forms/fesm2022/forms.mjs'),
      },
      {
        find: /^@angular\/router$/,
        replacement: resolveFromRoot('./node_modules/@angular/router/fesm2022/router.mjs'),
      },
      {
        find: /^@angular\/platform-browser\/testing$/,
        replacement: resolveFromRoot('./node_modules/@angular/platform-browser/fesm2022/testing.mjs'),
      },
      {
        find: /^@auth0\/auth0-angular$/,
        replacement: resolveFromRoot('./test-mocks/auth0-angular.mock.ts'),
      },
      {
        find: /^@auth0\/auth0-spa-js$/,
        replacement: resolveFromRoot('./node_modules/@auth0/auth0-spa-js/dist/auth0-spa-js.production.esm.js'),
      },
      {
        find: /^rxjs$/,
        replacement: resolveFromRoot('./node_modules/rxjs/dist/esm/index.js'),
      },
      {
        find: /^rxjs\/operators$/,
        replacement: resolveFromRoot('./node_modules/rxjs/dist/esm/operators/index.js'),
      },
      {
        find: /^xlsx$/,
        replacement: resolveFromRoot('./node_modules/xlsx/xlsx.mjs'),
      },
    ],
  },
});