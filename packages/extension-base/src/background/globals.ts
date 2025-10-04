/**
 * Service Worker Global Polyfills
 *
 * Chrome extension service workers don't have access to window, document, etc.
 * This file provides minimal polyfills for libraries that expect browser globals.
 */

// Polyfill window for libraries that check for it
if (typeof window === 'undefined') {
  (globalThis as any).window = globalThis;
}

// Polyfill document for libraries that check for it
if (typeof document === 'undefined') {
  (globalThis as any).document = {
    createElement: () => ({}),
    createElementNS: () => ({}),
    getElementsByTagName: () => [],
  };
}

// Polyfill navigator if needed
if (typeof navigator === 'undefined') {
  (globalThis as any).navigator = {
    userAgent: 'Chrome Extension Service Worker',
  };
}

export {};
