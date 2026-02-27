/**
 * Session initialization and management
 */

import type { UploadWorkerStartPayload } from '../fileUpload.shared'
import {
  DEFAULT_BASE_DELAY_MS,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_CONCURRENCY,
  DEFAULT_MAX_ATTEMPTS,
  DEFAULT_MAX_JITTER_MS,
  PROGRESS_EMIT_INTERVAL_MS,
} from './constants'
import type { WorkerRetryConfig, WorkerSession } from './types'

/**
 * Initialize a new worker session from the start payload
 */
export function initializeSession(payload: UploadWorkerStartPayload): WorkerSession {
  const now = Date.now()
  const chunkSize = payload.chunkSize ?? DEFAULT_CHUNK_SIZE

  const retryConfig: WorkerRetryConfig = {
    maxAttempts: Math.max(1, payload.retry?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS),
    baseDelayMs: Math.max(100, payload.retry?.baseDelayMs ?? DEFAULT_BASE_DELAY_MS),
    maxJitterMs: Math.max(0, payload.retry?.maxJitterMs ?? DEFAULT_MAX_JITTER_MS),
  }

  const resume = payload.resumeFrom
  const sessionId = resume?.sessionId ?? crypto.randomUUID()
  const totalSize = resume?.totalSize ?? payload.file.size

  // Reconstruct uploaded chunks set from resume data
  const uploadedChunks = new Set<number>(resume?.uploadedChunks ?? [])

  // If we have uploadedBytes but no chunk list, estimate which chunks are done
  if (!resume?.uploadedChunks && resume?.uploadedBytes) {
    const fullChunks = Math.floor(resume.uploadedBytes / chunkSize)
    for (let index = 0; index < fullChunks; index += 1) {
      uploadedChunks.add(index)
    }
  }

  const initialUploadedBytes = resume?.uploadedBytes
    ? Math.min(resume.uploadedBytes, totalSize)
    : uploadedChunks.size * chunkSize

  const sessionStart = resume?.startedAt ?? now

  return {
    id: sessionId,
    fileUid: resume?.fileUid ?? '',
    fileName: resume?.fileName ?? payload.file.name,
    file: payload.file,
    relativePath: payload.relativePath,
    scope: payload.scope,
    spaceId: payload.spaceId,
    folderId: payload.folderId,
    homeScope: payload.homeScope,
    totalSize,
    chunkSize,
    concurrency: Math.max(1, payload.concurrency ?? DEFAULT_CONCURRENCY),
    retry: retryConfig,
    uploadedBytes: initialUploadedBytes,
    uploadedChunks,
    paused: false,
    pauseReason: undefined,
    cancelled: false,
    cancelMessage: undefined,
    resumeWaiters: [],
    currentControllers: new Set(),
    startedAt: sessionStart,
    completedAt: undefined,
    status: 'pending',
    throttle: {
      lastEmitTime: 0,
      minIntervalMs: PROGRESS_EMIT_INTERVAL_MS,
      lastEmittedBytes: initialUploadedBytes,
    },
    progressTimerId: null,
    csrfToken: payload.csrfToken,
  }
}

/**
 * Ensure the session is still active (not cancelled or paused)
 * Throws if cancelled, waits if paused
 */
export async function ensureActive(session: WorkerSession): Promise<void> {
  if (session.cancelled) {
    throw new Error(session.cancelMessage ?? 'Upload cancelled')
  }
  await waitWhilePaused(session)
  if (session.cancelled) {
    throw new Error(session.cancelMessage ?? 'Upload cancelled')
  }
}

/**
 * Wait while the session is paused
 */
export async function waitWhilePaused(session: WorkerSession): Promise<void> {
  while (session.paused && !session.cancelled) {
    await new Promise<void>(resolve => {
      session.resumeWaiters.push(resolve)
    })
  }
}

/**
 * Flush all resume waiters (called when resuming or cancelling)
 */
export function flushWaiters(session: WorkerSession): void {
  while (session.resumeWaiters.length > 0) {
    const resolver = session.resumeWaiters.pop()
    resolver?.()
  }
}
