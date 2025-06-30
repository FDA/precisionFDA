import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// This configures a request mocking server with the given request handlers.
// @ts-expect-error - Type conflict between MSW handler versions
export const worker = setupWorker(...handlers)
