import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json'] })],
  test: {
    passWithNoTests: false,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts', 'convex/lib/**/*.test.ts'],
          exclude: ['e2e/**', 'node_modules/**', '.output/**'],
        },
      },
      {
        extends: true,
        test: {
          name: 'convex',
          environment: 'edge-runtime',
          include: ['convex/**/*.integration.test.ts'],
          exclude: ['e2e/**', 'node_modules/**', '.output/**'],
        },
      },
    ],
  },
})
