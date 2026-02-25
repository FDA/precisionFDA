/**
 * Worker Pool for File Uploads
 *
 * Manages a pool of reusable web workers to avoid repeatedly downloading
 * and parsing worker scripts. Workers are created lazily and recycled
 * after each upload completes.
 */

import type { UploadWorkerCommand, UploadWorkerEvent } from './fileUpload.shared'

type MessageHandler = (event: MessageEvent<UploadWorkerEvent>) => void
type ErrorHandler = (event: ErrorEvent) => void

interface PooledWorker {
  worker: Worker
  inUse: boolean
  messageHandler: MessageHandler | null
  errorHandler: ErrorHandler | null
}

/**
 * Create a new worker instance.
 *
 * IMPORTANT: The `new Worker(new URL(...), { type: 'module' })` pattern MUST be
 * in the same expression for Vite to recognize and bundle the worker file.
 * Do not extract the URL to a variable or function.
 */
function createWorker(): Worker {
  // Vite recognizes this pattern and bundles the worker as a separate ES module chunk
  return new Worker(new URL('./worker/index.ts', import.meta.url), { type: 'module' })
}

class WorkerPool {
  private pool: PooledWorker[] = []
  private readonly maxSize: number

  constructor(maxSize = 8) {
    this.maxSize = maxSize
  }

  /**
   * Acquire a worker from the pool. If no idle workers are available and
   * the pool hasn't reached max size, a new worker is created.
   */
  acquire(onMessage: MessageHandler, onError: ErrorHandler): Worker {
    // Try to find an idle worker
    let pooledWorker = this.pool.find(pw => !pw.inUse)

    if (!pooledWorker) {
      // Create new worker if pool not at max size
      if (this.pool.length < this.maxSize) {
        const worker = createWorker()
        pooledWorker = {
          worker,
          inUse: false,
          messageHandler: null,
          errorHandler: null,
        }
        this.pool.push(pooledWorker)
      } else {
        // Pool exhausted - create a temporary worker that won't be pooled
        const worker = createWorker()
        worker.addEventListener('message', onMessage)
        worker.addEventListener('error', onError)
        return worker
      }
    }

    // Remove old handlers if any
    if (pooledWorker.messageHandler) {
      pooledWorker.worker.removeEventListener('message', pooledWorker.messageHandler)
    }
    if (pooledWorker.errorHandler) {
      pooledWorker.worker.removeEventListener('error', pooledWorker.errorHandler)
    }

    // Set up new handlers
    pooledWorker.messageHandler = onMessage
    pooledWorker.errorHandler = onError
    pooledWorker.worker.addEventListener('message', onMessage)
    pooledWorker.worker.addEventListener('error', onError)
    pooledWorker.inUse = true

    return pooledWorker.worker
  }

  /**
   * Release a worker back to the pool for reuse.
   * The worker is sent a 'shutdown' command to clean up its internal state.
   */
  release(worker: Worker): void {
    const pooledWorker = this.pool.find(pw => pw.worker === worker)

    if (pooledWorker) {
      // Remove event handlers
      if (pooledWorker.messageHandler) {
        pooledWorker.worker.removeEventListener('message', pooledWorker.messageHandler)
        pooledWorker.messageHandler = null
      }
      if (pooledWorker.errorHandler) {
        pooledWorker.worker.removeEventListener('error', pooledWorker.errorHandler)
        pooledWorker.errorHandler = null
      }

      // Send shutdown command to reset worker state
      pooledWorker.worker.postMessage({ type: 'shutdown' } satisfies UploadWorkerCommand)
      pooledWorker.inUse = false
    } else {
      // Worker not in pool (overflow worker) - terminate it
      worker.postMessage({ type: 'shutdown' } satisfies UploadWorkerCommand)
      worker.terminate()
    }
  }

  /**
   * Terminate all workers in the pool.
   */
  dispose(): void {
    for (const { worker, messageHandler, errorHandler } of this.pool) {
      if (messageHandler) {
        worker.removeEventListener('message', messageHandler)
      }
      if (errorHandler) {
        worker.removeEventListener('error', errorHandler)
      }
      worker.postMessage({ type: 'shutdown' } satisfies UploadWorkerCommand)
      worker.terminate()
    }
    this.pool = []
  }

  /**
   * Get current pool statistics for debugging.
   */
  getStats(): { total: number; inUse: number; idle: number } {
    const inUse = this.pool.filter(pw => pw.inUse).length
    return {
      total: this.pool.length,
      inUse,
      idle: this.pool.length - inUse,
    }
  }
}

// Singleton instance
export const uploadWorkerPool = new WorkerPool()
