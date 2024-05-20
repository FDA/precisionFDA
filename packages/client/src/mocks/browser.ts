/* eslint-disable import/no-extraneous-dependencies */
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// This configures a request mocking server with the given request handlers.
export const worker = setupWorker(...handlers)
