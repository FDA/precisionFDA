/**
 * Configuration constants for the upload worker
 */

/** Default chunk size: 20 MB */
export const DEFAULT_CHUNK_SIZE = 20 * 1024 ** 2

/** Default maximum retry attempts per chunk */
export const DEFAULT_MAX_ATTEMPTS = 5

/** Base delay before first retry in ms */
export const DEFAULT_BASE_DELAY_MS = 500

/** Maximum random jitter added to retry delay in ms */
export const DEFAULT_MAX_JITTER_MS = 400

/** Default number of concurrent chunk uploads */
export const DEFAULT_CONCURRENCY = 2

/** Minimum interval between progress event emissions in ms */
export const PROGRESS_EMIT_INTERVAL_MS = 333

/** Delay between starting concurrent worker loops in ms */
export const CONCURRENT_START_STAGGER_MS = 1234

/** Maximum backoff delay for retries in ms (30 seconds) */
export const MAX_BACKOFF_MS = 30000
