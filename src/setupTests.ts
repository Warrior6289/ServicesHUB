import '@testing-library/jest-dom';

// Polyfill IntersectionObserver for framer-motion tests
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

// jsdom exposes globalThis; use it to attach the mock
(globalThis as any).IntersectionObserver = MockIntersectionObserver as any;



