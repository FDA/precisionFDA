/**
 * Multi-File Upload Coordinator (2025)
 *
 * Coordinates multiple single-file uploads using the FileUploadController.
 * Uses Effect Micro for efficient concurrency management with minimal bundle overhead.
 *
 */

import { Micro } from 'effect'
import type { HomeScope } from '@/features/home/types'
import { MAX_UPLOAD_WORKER_CONCURRENCY, type PauseReason } from './constants'
import { createFileUpload, FileUploadController, type FileUploadConfig, type UploadState } from './fileUpload'
import { extractDirectory, RemoteFolderManager, RemoteRootFolderExistsError } from './remoteFolderManager'

export interface UploadFileDescriptor {
  readonly id: string
  readonly file: File
  readonly relativePath: string
  readonly remoteFolderId?: string | null
}

export interface MultiFileUploadConfig {
  readonly files: ReadonlyArray<UploadFileDescriptor>
  readonly scope?: string
  readonly spaceId?: string
  readonly folderId?: string
  readonly homeScope?: HomeScope
  readonly maxConcurrency?: number
  readonly onFileStatusChange: (fileId: string, state: UploadState) => void
  readonly onError?: (fileId: string, error: Error) => void
  readonly onRemoteFolderResolved?: (fileId: string, folderId: string | null) => void
  readonly knownDirectories?: ReadonlyArray<readonly [string, string | null]>
  readonly onDirectoryResolved?: (directory: string, folderId: string | null) => void
}

// ============================================================================
// Multi-File Upload Coordinator
// ============================================================================

export class MultiFileUploadCoordinator {
  private readonly controllers = new Map<string, FileUploadController>()
  private readonly folderManager: RemoteFolderManager
  private readonly fileDirectories = new Map<string, string>()
  private readonly fileRemoteFolders = new Map<string, string | null>()
  private readonly fileDescriptors = new Map<string, UploadFileDescriptor>()
  private aborted = false
  private abortedError: Error | null = null
  private disposed = false
  private readonly maxConcurrency: number
  private readonly isSingleFileUpload: boolean
  private uploadEffect: Micro.Micro<void, unknown, never> | null = null
  private uploadAbortController: AbortController | null = null

  constructor(private readonly config: MultiFileUploadConfig) {
    const initialDirectoryCache = MultiFileUploadCoordinator.buildInitialDirectoryCache(config)

    this.maxConcurrency = config.maxConcurrency ?? MAX_UPLOAD_WORKER_CONCURRENCY
    this.isSingleFileUpload = config.files.length === 1
    this.folderManager = new RemoteFolderManager({
      rootFolderId: config.folderId ?? null,
      spaceId: config.spaceId,
      homeScope: config.homeScope,
      initialDirectoryCache,
      onDirectoryCached: (directory, folderId) => {
        this.config.onDirectoryResolved?.(directory, folderId)
      },
    })

    for (const file of config.files) {
      this.fileDescriptors.set(file.id, file)
      const directory = extractDirectory(file.relativePath)
      this.fileDirectories.set(file.id, directory)
      if (file.remoteFolderId !== undefined) {
        this.fileRemoteFolders.set(file.id, file.remoteFolderId ?? null)
      }
      this.folderManager.registerDirectory(directory)
    }
  }

  async start(): Promise<void> {
    if (this.disposed) {
      throw new Error('Coordinator has been disposed')
    }

    let rootSetupFailed = false

    const self = this

    // Create abort controller for this upload session
    this.uploadAbortController = new AbortController()
    const signal = this.uploadAbortController.signal

    const uploadProgram = Micro.gen(function* () {
      yield* Micro.tryPromise({
        try: () => self.folderManager.ensureRootDirectories(),
        catch: error => {
          rootSetupFailed = true
          return self.handleRootDirectoryError(error)
        },
      })

      yield* Micro.forEach(
        self.config.files,
        ({ id }) =>
          Micro.gen(function* () {
            // Check if aborted before starting each upload
            if (signal.aborted) {
              return
            }

            yield* Micro.tryPromise({
              try: () => self.startFileUpload(id),
              catch: error => {
                const normalizedError = self.toError(error)

                // If this is a CreateFileError or ChunkUploadError, abort all uploads immediately
                if (normalizedError.name === 'CreateFileError' || normalizedError.name === 'ChunkUploadError') {
                  self.abortUploads(normalizedError)
                  throw normalizedError
                }

                return self.handleUploadStartError(id, error)
              },
            })
          }),
        {
          concurrency: self.maxConcurrency,
          discard: true,
        },
      )
    })

    this.uploadEffect = uploadProgram

    let caughtError: unknown = null

    try {
      await Micro.runPromise(uploadProgram)
    } catch (error) {
      caughtError = error
      console.error('Coordinator encountered an error:', error)
    } finally {
      this.uploadEffect = null
      this.uploadAbortController = null
    }

    if (caughtError && rootSetupFailed) {
      throw caughtError
    }

    const abortError = this.abortedError
    if (abortError) {
      this.resetAbortState()
      throw abortError
    }
  }

  pauseAll(reason: PauseReason = 'user'): void {
    this.controllers.forEach(controller => controller.pause(reason))
  }

  resumeAll(): void {
    this.controllers.forEach(controller => controller.resume())
  }

  pauseFile(fileId: string, reason: PauseReason = 'user'): void {
    this.controllers.get(fileId)?.pause(reason)
  }

  resumeFile(fileId: string): void {
    this.controllers.get(fileId)?.resume()
  }

  cancelFile(fileId: string): void {
    const controller = this.controllers.get(fileId)
    if (!controller) return

    controller.cancel()
    this.controllers.delete(fileId)
  }

  removeFile(fileId: string): void {
    // Cancel the file if it's currently uploading
    this.cancelFile(fileId)

    // Remove from internal tracking to prevent future upload attempts
    this.fileDescriptors.delete(fileId)
    this.fileDirectories.delete(fileId)
    this.fileRemoteFolders.delete(fileId)
  }

  cancelAll(): void {
    // Abort the upload queue to stop new uploads from starting
    if (this.uploadAbortController) {
      this.uploadAbortController.abort()
    }

    // Cancel all currently running uploads
    this.controllers.forEach((controller, fileId) => {
      controller.cancel()
    })
    this.controllers.clear()
  }

  async retryFile(fileId: string): Promise<void> {
    // Cancel existing controller if any
    this.cancelFile(fileId)

    // Start new upload
    await this.startFileUpload(fileId)
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true

    this.controllers.forEach((controller, fileId) => {
      controller.dispose()
    })
    this.controllers.clear()
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async startFileUpload(fileId: string): Promise<void> {
    if (this.aborted || this.uploadAbortController?.signal.aborted) {
      throw this.abortedError ?? new Error('Upload aborted')
    }

    const fileDescriptor = this.fileDescriptors.get(fileId)
    if (!fileDescriptor) {
      // File was removed from the queue, skip it silently
      return
    }

    const directory = this.fileDirectories.get(fileId) ?? ''

    let remoteFolderId: string | null
    try {
      if (this.fileRemoteFolders.has(fileId)) {
        remoteFolderId = this.fileRemoteFolders.get(fileId) ?? null
      } else {
        remoteFolderId = await this.folderManager.ensureDirectory(directory)
      }
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error))

      if (error instanceof RemoteRootFolderExistsError) {
        this.abortUploads(normalizedError)
        throw normalizedError
      }

      this.config.onError?.(fileId, normalizedError)
      throw normalizedError
    }

    const effectiveFolderId = remoteFolderId ?? this.config.folderId ?? undefined
    this.persistRemoteFolder(fileId, effectiveFolderId ?? null)

    // Create upload configuration
    const uploadConfig: FileUploadConfig = {
      file: fileDescriptor.file,
      relativePath: fileDescriptor.relativePath,
      scope: this.config.scope,
      spaceId: this.config.spaceId,
      folderId: effectiveFolderId,
      homeScope: this.config.homeScope,
      // if single file upload, allow higher chunk upload concurrency
      concurrency: this.isSingleFileUpload ? 4 : 2,
    }

    // Create and start controller
    const controller = createFileUpload(
      uploadConfig,
      state => this.config.onFileStatusChange(fileId, state),
      error => this.handleFileError(fileId, error),
    )

    this.controllers.set(fileId, controller)

    try {
      await controller.start()
    } catch (error) {
      // Error already handled by error callback
      this.controllers.delete(fileId)
    }
  }

  private handleFileError(fileId: string, error: Error): void {
    // Check if this is a CreateFileError or ChunkUploadError - if so, abort all uploads
    if (error.name === 'CreateFileError' || error.name === 'ChunkUploadError') {
      this.abortUploads(error)
    }

    this.config.onError?.(fileId, error)
    this.controllers.delete(fileId)
  }

  private handleRootDirectoryError(error: unknown): Error {
    const normalizedError = this.toError(error)

    if (error instanceof RemoteRootFolderExistsError) {
      this.abortUploads(normalizedError)
      this.resetAbortState()
    }

    return normalizedError
  }

  private handleUploadStartError(fileId: string, error: unknown): Error {
    const normalizedError = this.toError(error)
    console.error(`Upload failed for file ${fileId}:`, error)
    return normalizedError
  }

  private persistRemoteFolder(fileId: string, folderId: string | null): void {
    const current = this.fileRemoteFolders.get(fileId)
    if (current === folderId) return

    this.fileRemoteFolders.set(fileId, folderId)
    this.config.onRemoteFolderResolved?.(fileId, folderId)
  }

  private abortUploads(error: Error): void {
    if (this.aborted) return
    this.aborted = true
    this.abortedError = error
    this.cancelAll()
  }

  private resetAbortState(): void {
    this.aborted = false
    this.abortedError = null
  }

  private toError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error))
  }

  private static buildInitialDirectoryCache(config: MultiFileUploadConfig): Array<readonly [string, string | null]> {
    const cache = new Map<string, string | null>()

    if (config.knownDirectories) {
      for (const [path, folderId] of config.knownDirectories) {
        if (!path) continue
        const existing = cache.get(path)
        const normalizedId = folderId ?? null
        if (existing === normalizedId) continue
        cache.set(path, normalizedId)
      }
    }

    for (const file of config.files) {
      if (file.remoteFolderId === undefined) continue
      const directory = extractDirectory(file.relativePath)
      if (!directory) continue
      cache.set(directory, file.remoteFolderId ?? null)
    }

    return Array.from(cache.entries())
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createMultiFileUploadCoordinator(config: MultiFileUploadConfig): MultiFileUploadCoordinator {
  return new MultiFileUploadCoordinator(config)
}
