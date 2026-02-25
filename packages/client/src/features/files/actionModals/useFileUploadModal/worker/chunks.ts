/**
 * Chunk preparation and upload operations
 */

import sparkMD5 from 'spark-md5'
import { requestUploadUrl } from './api'
import { CONCURRENT_START_STAGGER_MS } from './constants'
import { ChunkUploadError } from './errors'
import type { PostStateFn } from './progress'
import { ensureActive, waitWhilePaused } from './session'
import type { ChunkContext, PreparedChunk, WorkerSession } from './types'
import { calculateBackoff, isPauseAbort, sleep, toError } from './utils'

/**
 * Prepare a chunk for upload (read from file, compute hash)
 */
export async function prepareChunk(
  session: WorkerSession,
  chunkIndex: number,
  postState: PostStateFn,
): Promise<PreparedChunk> {
  const startByte = chunkIndex * session.chunkSize
  const end = Math.min(session.totalSize, startByte + session.chunkSize)
  const chunkSize = end - startByte

  const chunkArrayBuffer = await session.file.slice(startByte, end).arrayBuffer()
  await ensureActive(session)

  const chunkHash = sparkMD5.ArrayBuffer.hash(chunkArrayBuffer)
  await ensureActive(session)

  const context: ChunkContext = {
    index: chunkIndex,
    startByte,
    size: chunkSize,
    startedAt: Date.now(),
    perfStartedAt: performance.now(),
  }

  postState(session, 'uploading', { force: false })

  return {
    chunkBuffer: chunkArrayBuffer,
    chunkHash,
    context,
  }
}

/**
 * Finalize a chunk after successful upload
 */
export function finalizeChunk(session: WorkerSession, context: ChunkContext, postState: PostStateFn): void {
  session.uploadedChunks.add(context.index)
  session.uploadedBytes = Math.min(session.totalSize, session.uploadedBytes + context.size)

  postState(session, 'uploading', {
    uploadedBytes: session.uploadedBytes,
    force: true,
  })
}

/**
 * Upload a single chunk with retry logic
 */
export async function uploadChunkWithRetry(
  session: WorkerSession,
  chunk: ArrayBuffer,
  hash: string,
  chunkIndex: number,
  postState: PostStateFn,
): Promise<void> {
  const { maxAttempts, baseDelayMs, maxJitterMs } = session.retry
  let attempt = 0

  while (attempt < maxAttempts) {
    await ensureActive(session)
    const controller = new AbortController()
    session.currentControllers.add(controller)

    try {
      const uploadInfo = await requestUploadUrl(session, chunkIndex, chunk.byteLength, hash, controller.signal)
      await ensureActive(session)

      const response = await fetch(uploadInfo.url, {
        method: 'PUT',
        body: chunk,
        headers: uploadInfo.headers,
        signal: controller.signal,
      })

      session.currentControllers.delete(controller)

      if (!response.ok) {
        throw new Error(`Chunk upload failed with status ${response.status}`)
      }

      return
    } catch (error) {
      session.currentControllers.delete(controller)

      if (session.cancelled) {
        throw error
      }

      if (isPauseAbort(error) && session.paused) {
        await waitWhilePaused(session)
        attempt = 0
        continue
      }

      attempt += 1
      const normalized = toError(error)

      if (attempt >= maxAttempts) {
        throw new ChunkUploadError(
          `Chunk ${chunkIndex} upload failed after ${maxAttempts} attempts: ${normalized.message}`,
          chunkIndex,
        )
      }

      const delay = calculateBackoff(baseDelayMs, attempt, maxJitterMs)
      postState(session, 'retrying', {
        error: normalized.message,
        force: true,
      })

      await sleep(delay)
    }
  }
}

/**
 * Upload all chunks sequentially (concurrency = 1)
 */
export async function uploadChunksSequentially(
  session: WorkerSession,
  totalChunks: number,
  postState: PostStateFn,
): Promise<void> {
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
    if (session.uploadedChunks.has(chunkIndex)) {
      continue
    }

    await ensureActive(session)

    const { chunkBuffer, chunkHash, context } = await prepareChunk(session, chunkIndex, postState)

    await uploadChunkWithRetry(session, chunkBuffer, chunkHash, chunkIndex, postState)

    finalizeChunk(session, context, postState)
  }
}

/**
 * Upload chunks concurrently using multiple worker loops
 */
export async function uploadChunksConcurrently(
  session: WorkerSession,
  totalChunks: number,
  startIndex: number,
  postState: PostStateFn,
): Promise<void> {
  let nextChunkIndex = startIndex
  const totalUploads = Array.from({ length: session.concurrency }, (_, index) => workerLoop(index))

  await Promise.all(totalUploads)

  async function workerLoop(workerIndex: number): Promise<void> {
    // Stagger the start of each worker to reduce initial load spikes.
    if (workerIndex > 0) {
      if (nextChunkIndex >= totalChunks) {
        return
      }
      await ensureActive(session)
      await sleep(workerIndex * CONCURRENT_START_STAGGER_MS)
      await ensureActive(session)
    }

    while (true) {
      let chunkIndex: number
      if (nextChunkIndex >= totalChunks) {
        return
      }
      chunkIndex = nextChunkIndex
      nextChunkIndex += 1

      if (session.uploadedChunks.has(chunkIndex)) {
        continue
      }

      await ensureActive(session)

      const { chunkBuffer, chunkHash, context } = await prepareChunk(session, chunkIndex, postState)

      await uploadChunkWithRetry(session, chunkBuffer, chunkHash, chunkIndex, postState)

      finalizeChunk(session, context, postState)
    }
  }
}
