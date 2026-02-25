/**
 * Utility functions for the upload worker
 */

import { MAX_BACKOFF_MS } from './constants'

/**
 * Convert unknown error to Error object
 */
export function toError(error: unknown): Error {
  if (error instanceof Error) return error
  if (typeof error === 'string') return new Error(error)
  return new Error('Unknown error occurred')
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms)
  })
}

/**
 * Calculate exponential backoff delay with jitter
 */
export function calculateBackoff(baseDelayMs: number, attempt: number, maxJitterMs: number): number {
  const exponent = Math.max(0, attempt - 1)
  const backoff = baseDelayMs * Math.pow(2, exponent)
  const jitter = Math.random() * maxJitterMs
  return Math.min(backoff + jitter, MAX_BACKOFF_MS)
}

/**
 * Check if an error is a pause-related abort
 */
export function isPauseAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

/**
 * Remove null/undefined values from an object
 */
export function cleanObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      result[key] = value
    }
  }
  return result
}
