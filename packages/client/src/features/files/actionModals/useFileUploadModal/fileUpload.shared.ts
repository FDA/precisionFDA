import type { HomeScope } from '@/features/home/types'

/**
 * Unified upload status used everywhere (worker, store, UI)
 */
export type UploadStatus =
  | 'pending'     // File added, not yet started
  | 'queued'      // Waiting to start (when other files are uploading)
  | 'preparing'   // Initial preparation
  | 'creating'    // Creating file on server
  | 'hashing'     // Computing file hash
  | 'uploading'   // Actively uploading chunks
  | 'paused'      // Paused by user or system
  | 'retrying'    // Retrying after error
  | 'finalizing'  // Closing file on server
  | 'completed'   // Successfully uploaded
  | 'failed'      // Upload failed
  | 'cancelled'   // Cancelled by user

/**
 * Simplified progress snapshot - just bytes, speed calculated on main thread
 */
export interface UploadProgressSnapshot {
  readonly uploadedBytes: number
  readonly totalBytes: number
}

export type PauseReason = 'user' | 'offline' | 'system'

/**
 * Simplified state snapshot from worker to main thread
 */
export interface UploadStateSnapshot {
  readonly id: string
  readonly status: UploadStatus
  readonly progress: UploadProgressSnapshot
  readonly completedAt?: number
  readonly error?: string
  readonly fileUid?: string
}

export interface UploadResumeSnapshot {
  readonly sessionId: string
  readonly fileUid: string
  readonly fileName: string
  readonly chunkSize: number
  readonly uploadedBytes: number
  readonly startedAt: number
  readonly totalSize?: number
  readonly uploadedChunks?: number[]
}

export interface UploadWorkerStartPayload {
  readonly file: File
  readonly relativePath: string
  readonly scope?: string
  readonly spaceId?: string
  readonly folderId?: string
  readonly homeScope?: HomeScope
  readonly chunkSize?: number
  readonly retry?: {
    readonly maxAttempts?: number
    readonly baseDelayMs?: number
    readonly maxJitterMs?: number
  }
  readonly concurrency?: number
  readonly resumeFrom?: UploadResumeSnapshot
}

export type UploadWorkerCommand =
  | { type: 'start'; payload: UploadWorkerStartPayload }
  | { type: 'pause'; sessionId?: string; reason?: PauseReason }
  | { type: 'resume'; sessionId?: string }
  | { type: 'cancel'; sessionId?: string }
  | { type: 'shutdown' }

export type UploadWorkerEvent =
  | { type: 'status'; payload: UploadStateSnapshot }
  | { type: 'error'; payload: UploadStateSnapshot }
