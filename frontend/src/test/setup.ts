import '@testing-library/jest-dom/vitest'

// Create a localStorage mock that always works in test environments
const createLocalStorageMock = () => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => { store[key] = String(value) },
    removeItem: (key: string): void => { delete store[key] },
    clear: (): void => { store = {} },
    get length(): number { return Object.keys(store).length },
    key: (i: number): string | null => Object.keys(store)[i] ?? null,
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: createLocalStorageMock(),
  writable: true,
  configurable: true,
})
