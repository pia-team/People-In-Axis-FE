import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

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
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Mock MutationObserver
global.MutationObserver = class MutationObserver {
  constructor(callback: MutationCallback) {
    this.callback = callback;
  }
  callback: MutationCallback;
  disconnect() {}
  observe(target: Node, options?: MutationObserverInit) {}
  takeRecords(): MutationRecord[] {
    return [];
  }
} as unknown as typeof MutationObserver;

// Mock getSelection for user-event
Object.defineProperty(window, 'getSelection', {
  writable: true,
  value: vi.fn(() => ({
    removeAllRanges: vi.fn(),
    getRangeAt: vi.fn(),
    addRange: vi.fn(),
    toString: () => '',
  })),
});

Object.defineProperty(document, 'getSelection', {
  writable: true,
  value: vi.fn(() => ({
    removeAllRanges: vi.fn(),
    getRangeAt: vi.fn(),
    addRange: vi.fn(),
    toString: () => '',
  })),
});

// Suppress React Router Future Flag warnings in tests
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  // Filter out React Router Future Flag warnings
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('React Router Future Flag') ||
      args[0].includes('v7_startTransition') ||
      args[0].includes('v7_relativeSplatPath'))
  ) {
    return;
  }
  // Filter out Vite CJS deprecation warnings
  if (
    typeof args[0] === 'string' &&
    args[0].includes('The CJS build of Vite')
  ) {
    return;
  }
  originalWarn(...args);
};
