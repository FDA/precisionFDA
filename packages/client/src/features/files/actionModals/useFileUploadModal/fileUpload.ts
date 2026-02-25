/**
 * Single File Upload Manager (2025)
 *
 * The worker handles the complete upload lifecycle: file creation, chunking,
 * hashing, uploading, and finalization.
 *
 */

import type { HomeScope } from '../../../home/types'
import {
  DEFAULT_CHUNK_CONCURRENCY,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_MAX_RETRY_ATTEMPTS,
  DEFAULT_RETRY_BACKOFF_MS,
  type PauseReason,
} from './constants'
import type {
  UploadStateSnapshot,
  UploadWorkerCommand,
  UploadWorkerEvent,
  UploadWorkerStartPayload,
} from './fileUpload.shared'
import { uploadWorkerPool } from './workerPool'

// ============================================================================
// Types
// ============================================================================

export interface FileUploadConfig {
  readonly file: File
  readonly relativePath: string
  readonly scope?: string
  readonly spaceId?: string
  readonly folderId?: string
  readonly homeScope?: HomeScope
  readonly chunkSize?: number
  readonly maxRetryAttempts?: number
  readonly retryBackoffMs?: number
  readonly concurrency?: number
}

export type StatusChangeHandler = (state: UploadStateSnapshot) => void
export type ErrorHandler = (error: Error) => void
export type UploadState = UploadStateSnapshot

// ============================================================================
// File Upload Controller
// ============================================================================

export class FileUploadController {
  private worker: Worker | null = null
  private currentState: UploadStateSnapshot
  private disposed = false
  private sessionId: string | null = null
  private resolveStart?: () => void
  private rejectStart?: (error: Error) => void
  private boundMessageHandler: ((event: MessageEvent<UploadWorkerEvent>) => void) | null = null
  private boundErrorHandler: ((event: ErrorEvent) => void) | null = null

  constructor(
    private readonly config: FileUploadConfig,
    private readonly onStatusChange: StatusChangeHandler,
    private readonly onError: ErrorHandler,
  ) {
    this.currentState = this.createInitialState()
  }

  async start(): Promise<void> {
    if (this.disposed) {
      throw new Error('Upload controller has been disposed')
    }

    if (this.worker) {
      throw new Error('Upload already in progress')
    }

    return new Promise((resolve, reject) => {
      this.resolveStart = resolve
      this.rejectStart = reject

      this.boundMessageHandler = (event: MessageEvent<UploadWorkerEvent>) => {
        this.handleWorkerMessage(event.data)
      }

      this.boundErrorHandler = (event: ErrorEvent) => {
        const error = new Error(event.message || 'Worker error')
        const rejectStart = this.rejectStart
        this.handleUploadError(error)
        rejectStart?.(error)
      }

      // Acquire worker from pool
      this.worker = uploadWorkerPool.acquire(this.boundMessageHandler, this.boundErrorHandler)

      // Send start command with full upload configuration
      const payload: UploadWorkerStartPayload = {
        file: this.config.file,
        relativePath: this.config.relativePath,
        scope: this.config.scope,
        spaceId: this.config.spaceId,
        folderId: this.config.folderId,
        homeScope: this.config.homeScope,
        chunkSize: this.config.chunkSize ?? DEFAULT_CHUNK_SIZE,
        retry: {
          maxAttempts: this.config.maxRetryAttempts ?? DEFAULT_MAX_RETRY_ATTEMPTS,
          baseDelayMs: this.config.retryBackoffMs ?? DEFAULT_RETRY_BACKOFF_MS,
        },
        concurrency: this.config.concurrency ?? DEFAULT_CHUNK_CONCURRENCY,
      }

      this.worker.postMessage({
        type: 'start',
        payload,
      } satisfies UploadWorkerCommand)
    })
  }

  pause(reason: PauseReason = 'user'): void {
    if (!this.worker || this.currentState.status === 'paused') return

    this.worker.postMessage({
      type: 'pause',
      sessionId: this.sessionId ?? undefined,
      reason,
    } satisfies UploadWorkerCommand)
  }

  resume(): void {
    if (!this.worker || this.currentState.status !== 'paused') return

    this.worker.postMessage({
      type: 'resume',
      sessionId: this.sessionId ?? undefined,
    } satisfies UploadWorkerCommand)
  }

  cancel(): void {
    if (!this.worker) return

    this.worker.postMessage({
      type: 'cancel',
      sessionId: this.sessionId ?? undefined,
    } satisfies UploadWorkerCommand)
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.cleanup()
  }

  getState(): Readonly<UploadStateSnapshot> {
    return this.currentState
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private handleWorkerMessage(message: UploadWorkerEvent): void {
    switch (message.type) {
      case 'status': {
        this.updateFromWorker(message.payload)
        break
      }

      case 'error': {
        this.updateFromWorker(message.payload)
        break
      }
    }
  }

  private handleUploadError(error: Error): void {
    this.onError(error)
    this.cleanup()
  }

  private updateFromWorker(nextState: UploadStateSnapshot): void {
    this.currentState = nextState
    this.sessionId = nextState.id
    this.onStatusChange(this.currentState)

    if (nextState.status === 'completed') {
      const resolveStart = this.resolveStart
      this.cleanup()
      resolveStart?.()
    }

    if (nextState.status === 'failed') {
      const errorMessage = nextState.error ?? 'Upload failed'
      const error = new Error(errorMessage)
      const rejectStart = this.rejectStart
      this.onError(error)
      this.cleanup()
      rejectStart?.(error)
    }

    if (nextState.status === 'cancelled') {
      const cancelError = new Error(nextState.error ?? 'Upload cancelled')
      const rejectStart = this.rejectStart
      this.cleanup()
      rejectStart?.(cancelError)
    }
  }

  private createInitialState(): UploadStateSnapshot {
    return {
      id: 'pending',
      status: 'pending',
      progress: {
        uploadedBytes: 0,
        totalBytes: this.config.file.size,
      },
    }
  }

  private cleanup(): void {
    if (this.worker) {
      // Release worker back to pool for reuse instead of terminating
      uploadWorkerPool.release(this.worker)
      this.worker = null
    }
    this.boundMessageHandler = null
    this.boundErrorHandler = null
    this.sessionId = null
    this.resolveStart = undefined
    this.rejectStart = undefined
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createFileUpload(
  config: FileUploadConfig,
  onStatusChange: StatusChangeHandler,
  onError: ErrorHandler = () => {},
): FileUploadController {
  return new FileUploadController(config, onStatusChange, onError)
}
