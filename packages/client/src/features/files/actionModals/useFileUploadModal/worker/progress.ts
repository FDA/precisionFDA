/**
 * Progress tracking and state emission
 *
 * Simplified: Speed is now calculated on the main thread from timestamps.
 * Worker only emits bytes uploaded and status.
 */

import type { UploadProgressSnapshot, UploadStateSnapshot, UploadStatus, UploadWorkerEvent } from '../fileUpload.shared'
import { PROGRESS_EMIT_INTERVAL_MS } from './constants'
import type { PostStateOptions, WorkerSession } from './types'

// Reference to worker context - set during worker initialization
let ctx: DedicatedWorkerGlobalScope | null = null

/**
 * Set the worker context for posting messages
 */
export function setWorkerContext(workerCtx: DedicatedWorkerGlobalScope): void {
  ctx = workerCtx
}

/**
 * Function type for posting state updates
 */
export type PostStateFn = (session: WorkerSession, status: UploadStatus, options?: PostStateOptions) => void

/**
 * Build simple progress snapshot - just bytes uploaded
 */
function buildProgress(session: WorkerSession, uploadedBytes: number): UploadProgressSnapshot {
  return {
    uploadedBytes,
    totalBytes: session.totalSize,
  }
}

/**
 * Determine if a state update should be emitted
 */
export function shouldEmit(session: WorkerSession, status: UploadStatus, uploadedBytes: number): boolean {
  // Always emit on status change
  if (session.status !== status) {
    return true
  }

  // Always emit for non-uploading states
  if (status !== 'uploading') {
    return true
  }

  // Check time-based throttle
  const nowPerf = performance.now()
  const sinceLast = nowPerf - session.throttle.lastEmitTime
  if (sinceLast >= session.throttle.minIntervalMs) {
    return true
  }

  // Check byte-based threshold
  const deltaBytes = Math.abs(uploadedBytes - session.throttle.lastEmittedBytes)
  const byteThreshold = Math.max(128 * 1024, session.chunkSize * 0.05)

  return deltaBytes >= byteThreshold
}

/**
 * Post state update to the main thread
 */
export function postState(session: WorkerSession, status: UploadStatus, options: PostStateOptions = {}): void {
  if (!ctx) {
    console.warn('Worker context not set, cannot post state')
    return
  }

  const uploadedBytes = options.uploadedBytes ?? session.uploadedBytes

  const shouldForce = options.force === true
  const emitAsError = options.asError === true
  const shouldSend = shouldForce || shouldEmit(session, status, uploadedBytes)

  // Update session state
  session.status = status
  session.completedAt = options.completedAt ?? session.completedAt

  updateProgressTimer(session)

  if (!shouldSend) {
    return
  }

  const progress = buildProgress(session, uploadedBytes)

  const snapshot: UploadStateSnapshot = {
    id: session.id,
    status,
    progress,
    completedAt: session.completedAt,
    error: options.error,
    fileUid: session.fileUid || undefined,
  }

  // Update throttle state
  session.throttle.lastEmitTime = performance.now()
  session.throttle.lastEmittedBytes = uploadedBytes

  if (emitAsError) {
    ctx.postMessage({ type: 'error', payload: snapshot } satisfies UploadWorkerEvent)
  } else {
    ctx.postMessage({ type: 'status', payload: snapshot } satisfies UploadWorkerEvent)
  }
}

// Progress timer management
let currentProgressSession: WorkerSession | null = null

/**
 * Update the progress timer based on session state
 */
export function updateProgressTimer(session: WorkerSession): void {
  if (session.status === 'uploading' && !session.cancelled) {
    if (session.progressTimerId == null) {
      currentProgressSession = session
      session.progressTimerId = setInterval(() => {
        if (!currentProgressSession || currentProgressSession.id !== session.id) {
          stopProgressTimer(session)
          return
        }

        if (session.paused || session.cancelled) {
          return
        }

        if (session.status !== 'uploading') {
          return
        }

        postState(session, 'uploading', { force: true })
      }, PROGRESS_EMIT_INTERVAL_MS) as unknown as number
    }
  } else {
    stopProgressTimer(session)
  }
}

/**
 * Stop the progress timer
 */
export function stopProgressTimer(session: WorkerSession): void {
  if (session.progressTimerId != null) {
    clearInterval(session.progressTimerId)
    session.progressTimerId = null
  }
  if (currentProgressSession?.id === session.id) {
    currentProgressSession = null
  }
}
