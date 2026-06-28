import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  // Map @/* the same way tsconfig.json does, without pulling in
  // vite-tsconfig-paths (which is ESM-only and breaks vitest's config loader).
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx', 'lib/**/*.test.ts'],
    exclude: ['node_modules', '.next', 'dist', 'tests/e2e/**'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['lib/**/*.ts'],
      exclude: ['lib/**/*.test.ts', 'lib/**/*.d.ts'],
    },
  },
})
