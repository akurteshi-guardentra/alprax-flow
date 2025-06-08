
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock browser APIs that may not be available in the test environment
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Handle Intl API mocking - use conditional check for TypeScript
if (typeof Intl !== 'undefined') {
  // Only mock if the property doesn't exist
  if (!('supportedValuesOf' in Intl)) {
    // Use type assertion to avoid TypeScript errors
    // @ts-ignore - Intentionally adding a non-standard method for testing
    Object.defineProperty(Intl, 'supportedValuesOf', {
      value: () => ["UTC"],
      configurable: true
    });
  }
}

// Setup global before and after hooks
beforeAll(() => {
  // Initialize any global test setup here
  console.log('Test suite started');
});

afterEach(() => {
  // Clean up after each test
  cleanup();
  vi.clearAllMocks();
});

afterAll(() => {
  // Global test teardown
  console.log('Test suite completed');
});
