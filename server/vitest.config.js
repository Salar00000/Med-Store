import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'forks',
    hookTimeout: 120000,
  },
});
