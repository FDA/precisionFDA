/**
 * Worker-internal types and interfaces
 *
 * These types are used within the worker implementation and are separate
 * from the shared types used for communication between worker and main thread.
 */

import type { PauseReason, UploadStatus } from '../fileUpload.shared'

/**
 * Configuration for retry behavior during chunk uploads
 */
export interface WorkerRetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number
  /** Base delay in milliseconds before first retry */
  baseDelayMs: number
  /** Maximum random jitter added to retry delay */
  maxJitterMs: number
}

/**
 * Context for tracking a single chunk upload
 */
export interface ChunkContext {
  /** Zero-based chunk index */
  index: number
  /** Byte offset where this chunk starts */
  startByte: number
  /** Size of this chunk in bytes */
  size: number
  /** Timestamp when chunk upload started (Date.now()) */
  startedAt: number
  /** High-resolution timestamp for performance measurement */
  perfStartedAt: number
}

/**
 * Result from preparing a chunk for upload
 */
export interface PreparedChunk {
  /** Raw chunk data */
  chunkBuffer: ArrayBuffer
  /** MD5 hash of the chunk */
  chunkHash: string
  /** Context for tracking this chunk */
  context: ChunkContext
}

/**
 * Throttle state for controlling event emission frequency
 */
export interface ThrottleState {
  /** Last time an event was emitted */
  lastEmitTime: number
  /** Minimum interval between emissions */
  minIntervalMs: number
  /** Bytes uploaded at last emission */
  lastEmittedBytes: number
}

/**
 * Simplified worker session state
 */
export interface WorkerSession {
  /** Unique session identifier */
  id: string
  /** Server-assigned file UID (empty until file is created) */
  fileUid: string
  /** Original file name */
  fileName: string
  /** File object being uploaded */
  file: File
  /** Relative path for folder uploads */
  relativePath: string
  /** Upload scope */
  scope?: string
  /** Space ID for space uploads */
  spaceId?: string
  /** Parent folder ID */
  folderId?: string
  /** Home scope for organizing uploads */
  homeScope?: string
  /** Total file size in bytes */
  totalSize: number
  /** Size of each chunk in bytes */
  chunkSize: number
  /** Number of concurrent chunk uploads */
  concurrency: number
  /** Retry configuration */
  retry: WorkerRetryConfig
  /** Total bytes uploaded so far */
  uploadedBytes: number
  /** Set of completed chunk indices */
  uploadedChunks: Set<number>
  /** Whether upload is currently paused */
  paused: boolean
  /** Reason for pause */
  pauseReason?: PauseReason
  /** Whether upload has been cancelled */
  cancelled: boolean
  /** Message to show when cancelled */
  cancelMessage?: string
  /** Promises waiting for resume */
  resumeWaiters: Array<() => void>
  /** Active fetch abort controllers */
  currentControllers: Set<AbortController>
  /** Session start time (Date.now()) */
  startedAt: number
  /** Completion time (Date.now()) */
  completedAt?: number
  /** Current upload status */
  status: UploadStatus
  /** Throttle state for progress events */
  throttle: ThrottleState
  /** Timer ID for periodic progress updates */
  progressTimerId: number | null
}

/**
 * Options for posting state updates
 */
export interface PostStateOptions {
  /** Override uploaded bytes */
  uploadedBytes?: number
  /** Error message */
  error?: string
  /** Completion timestamp */
  completedAt?: number
  /** Force emission regardless of throttling */
  force?: boolean
  /** Emit as error event instead of status */
  asError?: boolean
}

/**
 * Response from upload URL request
 */
export interface UploadUrlResponse {
  /** Pre-signed URL for chunk upload */
  url: string
  /** Headers to include in upload request */
  headers: Record<string, string>
}
