import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/build/**/*.test.ts'],
    globalSetup: ['tests/build/globalSetup.ts'],
    testTimeout: 30000,
  },
});
