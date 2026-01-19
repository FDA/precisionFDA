import { vi, beforeAll, afterEach, afterAll } from 'vitest'
import { setupWorker } from 'msw/browser'
import { handlers } from '../mocks/handlers'

// Setup MSW worker for browser mode
export const worker = setupWorker(...handlers)

// Mock ResizeObserver (use window in browser mode)
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
}

// Setup MSW worker
beforeAll(async () => {
  await worker.start({ onUnhandledRequest: 'warn' })
})

afterEach(() => worker.resetHandlers())

afterAll(() => worker.stop())
