import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    server: {
      deps: {
        inline: [
          /^@angular/,
          'rxjs',
          'zone.js',
        ],
      },
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../../coverage/libs/shared/services',
    },
  },
});