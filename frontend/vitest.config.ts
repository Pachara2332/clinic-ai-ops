/**
 * vitest.config.ts  –  root config for both backend and frontend tests
 *
 * Run all tests:          npx vitest run
 * Run backend only:       npx vitest run backend.test.ts
 * Run frontend only:      npx vitest run frontend.test.ts
 * Watch mode:             npx vitest
 *
 * Required dev-deps (add once):
 *   npm i -D vitest @testing-library/react @testing-library/user-event \
 *             @testing-library/jest-dom jsdom happy-dom
 */

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    // jsdom gives the frontend hook tests a DOM + window.fetch stub capability.
    // The backend tests do not need a DOM but jsdom doesn't hurt them.
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
  },
})