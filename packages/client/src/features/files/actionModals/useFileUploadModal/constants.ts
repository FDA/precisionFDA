import type { UploadStatus } from './fileUpload.shared'

export { type UploadStatus, type PauseReason } from './fileUpload.shared'

export const RESOURCE_TYPE = {
  COPY: 'copy',
  UPLOAD: 'upload',
}

export const MAX_UPLOADABLE_FILES = 200
export const MAX_FILES_PER_SELECTION = 1000

export const DEFAULT_CHUNK_SIZE = 20 * 1024 ** 2 // 20MB
export const DEFAULT_MAX_RETRY_ATTEMPTS = 5
export const DEFAULT_RETRY_BACKOFF_MS = 500
export const DEFAULT_CHUNK_CONCURRENCY = 2
export const MAX_UPLOAD_WORKER_CONCURRENCY = 4

/**
 * Simplified file metadata for upload tracking
 */
export interface FilesMeta {
  id: string
  name: string
  relativePath: string
  remoteFolderId?: string | null
  size: number
  uploadedSize: number
  status: UploadStatus
  error?: string
  // Timing - only essential fields
  uploadStartedAt?: number // When 'uploading' status began
  lastProgressAt?: number // When uploadedSize last changed (for stable speed calculation)
  completedAt?: number
  fileUid?: string
}

export interface IUploadFile {
  generatedId: string
  name: string
  size: number
  lastModified: number
  type: string
  path?: string
  relativePath?: string
}
