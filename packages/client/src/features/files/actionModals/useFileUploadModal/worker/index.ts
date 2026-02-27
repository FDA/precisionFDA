/// <reference lib="webworker" />
/**
 * Upload Worker Entry Point
 *
 * This is the main entry point for the file upload web worker.
 * It handles command messages from the main thread and coordinates
 * the upload process through the modular components.
 */

import type { UploadWorkerCommand } from '../fileUpload.shared'
import { closeFileRequest, createFileRequest } from './api'
import {
  finalizeChunk,
  prepareChunk,
  uploadChunksConcurrently,
  uploadChunksSequentially,
  uploadChunkWithRetry,
} from './chunks'
import { postState, setWorkerContext, stopProgressTimer } from './progress'
import { ensureActive, flushWaiters, initializeSession } from './session'
import type { WorkerSession } from './types'
import { toError } from './utils'

// Re-export errors for backward compatibility
export { CreateFileError, ChunkUploadError } from './errors'

// Worker context
const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope

// Initialize worker context for progress module
setWorkerContext(ctx)

// Current active session
let session: WorkerSession | null = null

// Listen for commands from main thread
ctx.addEventListener('message', event => {
  const command = event.data as UploadWorkerCommand
  void handleCommand(command)
})

/**
 * Handle incoming commands from main thread
 */
async function handleCommand(command: UploadWorkerCommand): Promise<void> {
  switch (command.type) {
    case 'start': {
      if (session) {
        return
      }
      session = initializeSession(command.payload)
      postState(session, 'preparing', { force: true })
      try {
        await processFile(session)
      } catch (error) {
        const normalizedError = toError(error)
        const message = session?.cancelled ? (session.cancelMessage ?? 'Upload cancelled') : normalizedError.message
        if (session) {
          postState(session, 'failed', {
            error: message,
            force: true,
            asError: true,
          })
        }
      } finally {
        cleanup()
      }
      break
    }
    case 'pause': {
      if (!session) return
      if (session.paused) return
      if (command.sessionId && command.sessionId !== session.id) return
      session.paused = true
      session.pauseReason = command.reason ?? 'user'
      session.currentControllers.forEach(controller => controller.abort())
      postState(session, 'paused', { force: true })
      break
    }
    case 'resume': {
      if (!session) return
      if (!session.paused) return
      if (command.sessionId && command.sessionId !== session.id) return
      session.paused = false
      session.pauseReason = undefined
      flushWaiters(session)
      postState(session, 'uploading', { force: true })
      break
    }
    case 'cancel': {
      if (!session) return
      if (command.sessionId && command.sessionId !== session.id) return
      session.cancelled = true
      session.cancelMessage = 'Upload cancelled by user'
      session.currentControllers.forEach(controller => controller.abort())
      flushWaiters(session)
      postState(session, 'cancelled', { force: true, error: session.cancelMessage, asError: true })
      cleanup()
      break
    }
    case 'shutdown': {
      // Reset worker state for reuse (called when released back to pool)
      // Don't close the worker - just clean up the session
      cleanup()
      break
    }
    default:
      break
  }
}

/**
 * Process the file upload
 */
async function processFile(activeSession: WorkerSession): Promise<void> {
  // Handle empty files
  if (activeSession.totalSize === 0) {
    postState(activeSession, 'completed', {
      uploadedBytes: 0,
      completedAt: Date.now(),
      force: true,
    })
    return
  }

  // Create file on server if not resuming
  if (!activeSession.fileUid) {
    postState(activeSession, 'creating', { force: true })
    await createFileRequest(activeSession)
  }
  await ensureActive(activeSession)

  postState(activeSession, 'hashing', { force: true })

  const totalChunks = Math.ceil(activeSession.totalSize / activeSession.chunkSize)

  postState(activeSession, 'uploading', { force: true })

  // Upload chunks based on concurrency setting
  if (activeSession.concurrency > 1) {
    // When concurrency > 1, we upload chunk 0 first (unless already done) before spinning up
    // the concurrent workers; the concurrent loop accepts a starting index so the warm-up upload
    // isn't repeated.
    if (totalChunks > 0 && !activeSession.uploadedChunks.has(0)) {
      await ensureActive(activeSession)
      const { chunkBuffer, chunkHash, context } = await prepareChunk(activeSession, 0, postState)
      await uploadChunkWithRetry(activeSession, chunkBuffer, chunkHash, 0, postState)
      finalizeChunk(activeSession, context, postState)
    }

    const startIndex = totalChunks > 0 ? 1 : 0
    await uploadChunksConcurrently(activeSession, totalChunks, startIndex, postState)
  } else {
    await uploadChunksSequentially(activeSession, totalChunks, postState)
  }

  await ensureActive(activeSession)
  postState(activeSession, 'finalizing', { force: true })
  await closeFileRequest(activeSession.fileUid, activeSession.csrfToken)

  activeSession.completedAt = Date.now()
  postState(activeSession, 'completed', {
    uploadedBytes: activeSession.totalSize,
    completedAt: activeSession.completedAt,
    force: true,
  })
}

/**
 * Clean up session state
 */
function cleanup(): void {
  if (!session) return
  const activeSession = session
  stopProgressTimer(activeSession)
  activeSession.resumeWaiters.length = 0
  activeSession.currentControllers.clear()
  session = null
}

export {}
