/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/shared/services',
  plugins: [angular(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  test: {
    name: 'shared-services',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // image-preload spec still uses the Vitest 3 `done` callback style and is
    // deferred to the dedicated test-coverage batch for migration to promises.
    exclude: [...configDefaults.exclude, 'src/lib/image-preload/**'],
    setupFiles: ['src/test-setup.ts'],
    passWithNoTests: true,
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/libs/shared/services',
      provider: 'v8' as const,
    },
  },
}));
