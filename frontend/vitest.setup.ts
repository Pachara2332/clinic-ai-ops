/**
 * vitest.setup.ts
 * Runs before every test file.
 * Imports @testing-library/jest-dom so custom matchers like
 * .toBeInTheDocument(), .toHaveTextContent() etc. are available.
 */
import '@testing-library/jest-dom'