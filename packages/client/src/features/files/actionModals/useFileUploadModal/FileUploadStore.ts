import { FilesMeta } from './constants'
import { UploadState } from './fileUpload'
import { isActiveUploadStatus } from './utils'

type Listener = () => void

export interface FileUploadStoreSnapshot {
  files: FilesMeta[]
  uploadInProgress: boolean
  uploadFinished: boolean
  counts: {
    pending: number
    active: number
    paused: number
    stopped: number
    failed: number
    completed: number
  }
}

export class FileUploadStore {
  private files = new Map<string, FilesMeta>()
  private fileObjects = new Map<string, File>()
  private listeners = new Set<Listener>()
  private fileListeners = new Map<string, Set<Listener>>()

  // Cache derived state to avoid re-calculation if nothing changed
  private cachedFileIds: string[] = []
  private cachedFilesArray: FilesMeta[] = []
  private cachedUploadInProgress = false
  private cachedUploadFinished = false
  private cachedCounts = {
    pending: 0,
    active: 0,
    paused: 0,
    stopped: 0,
    failed: 0,
    completed: 0,
  }
  private cachedSnapshot: FileUploadStoreSnapshot | null = null

  private _uploadSessionStarted = false

  // Use arrow functions for stable references (no binding needed)
  subscribe = (listener: Listener) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  subscribeToFile = (fileId: string, listener: Listener) => {
    if (!this.fileListeners.has(fileId)) {
      this.fileListeners.set(fileId, new Set())
    }
    this.fileListeners.get(fileId)!.add(listener)
    return () => {
      const set = this.fileListeners.get(fileId)
      if (set) {
        set.delete(listener)
        if (set.size === 0) {
          this.fileListeners.delete(fileId)
        }
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach(l => l())
  }

  private notifyFileListeners(fileId: string) {
    this.fileListeners.get(fileId)?.forEach(l => l())
  }

  getFileIds = () => this.cachedFileIds

  getFiles = () => this.cachedFilesArray

  getFile = (id: string) => this.files.get(id)

  getFileObject = (id: string) => this.fileObjects.get(id)

  getCounts = () => this.cachedCounts

  getUploadInProgress = () => this.cachedUploadInProgress

  getUploadFinished = () => this.cachedUploadFinished

  getSnapshot = () => {
    if (!this.cachedSnapshot) {
      this.cachedSnapshot = {
        files: this.cachedFilesArray,
        uploadInProgress: this.cachedUploadInProgress,
        uploadFinished: this.cachedUploadFinished,
        counts: this.cachedCounts,
      }
    }
    return this.cachedSnapshot
  }

  addFiles(newFiles: { file: File; meta: FilesMeta }[]) {
    let changed = false
    for (const { file, meta } of newFiles) {
      if (!this.files.has(meta.id)) {
        this.files.set(meta.id, meta)
        this.fileObjects.set(meta.id, file)
        changed = true
      }
    }

    if (changed) {
      this.updateDerivedState()
      this.notifyListeners()
    }
  }

  removeFile(id: string) {
    this.fileObjects.delete(id)
    this.fileListeners.delete(id) // Clean up listeners for removed file
    if (this.files.delete(id)) {
      this.updateDerivedState()
      this.notifyListeners()
    }
  }

  removeAll() {
    if (this.files.size > 0) {
      this.files.clear()
      this.fileObjects.clear()
      this.fileListeners.clear() // Clean up all file listeners
      this.updateDerivedState()
      this.notifyListeners()
    }
  }

  updateFileStatus(fileId: string, state: UploadState) {
    const file = this.files.get(fileId)
    if (!file) return

    const previousStatus = file.status
    const newStatus = state.status
    const now = Date.now()

    // Create a new object for the file to ensure immutability for the row
    const updatedFile: FilesMeta = {
      ...file,
      status: newStatus,
      uploadedSize: state.progress.uploadedBytes,
      size: state.progress.totalBytes,
      error: state.error,
      completedAt: state.completedAt ?? file.completedAt,
    }

    // Track when uploading actually starts (for speed calculation)
    if (newStatus === 'uploading' && !file.uploadStartedAt) {
      updatedFile.uploadStartedAt = now
      updatedFile.lastProgressAt = now
    }

    // Track when bytes actually change (for stable speed that doesn't decrease between chunks)
    if (state.progress.uploadedBytes > file.uploadedSize) {
      updatedFile.lastProgressAt = now
    }

    // Reset timing when upload is cancelled or failed (so duration shows --)
    if (newStatus === 'cancelled' || newStatus === 'failed') {
      updatedFile.uploadStartedAt = undefined
      updatedFile.lastProgressAt = undefined
      updatedFile.completedAt = undefined
    }

    if (state.fileUid) {
      updatedFile.fileUid = state.fileUid
    }

    this.files.set(fileId, updatedFile)

    // Only update derived state (and notify global listeners) if status changed
    const statusChanged = previousStatus !== newStatus

    if (statusChanged) {
      this.updateDerivedState()
      this.notifyListeners()
    }

    this.notifyFileListeners(fileId)
  }

  updateFileRemoteFolder(fileId: string, folderId: string | null) {
    const file = this.files.get(fileId)
    if (!file) return

    const updatedFile = { ...file, remoteFolderId: folderId }
    this.files.set(fileId, updatedFile)

    // Folder changes don't affect counts/progress, but we need to update the array
    this.cachedSnapshot = null
    this.cachedFilesArray = Array.from(this.files.values())

    this.notifyListeners()
    this.notifyFileListeners(fileId)
  }

  setAllFilesStatus(fromStatus: FilesMeta['status'], toStatus: FilesMeta['status']) {
    let changed = false
    this.files.forEach((file, id) => {
      if (file.status === fromStatus) {
        const updatedFile: FilesMeta = { ...file, status: toStatus }

        // Reset progress when going back to pending (for retry)
        if (toStatus === 'pending') {
          updatedFile.uploadedSize = 0
          updatedFile.uploadStartedAt = undefined
          updatedFile.lastProgressAt = undefined
          updatedFile.completedAt = undefined
          updatedFile.error = undefined
        }

        this.files.set(id, updatedFile)
        changed = true
        this.notifyFileListeners(id)
      }
    })

    if (changed) {
      this.updateDerivedState()
      this.notifyListeners()
    }
  }

  setUploadSessionStarted(started: boolean) {
    if (this._uploadSessionStarted !== started) {
      this._uploadSessionStarted = started
      this.updateDerivedState()
      this.notifyListeners()
    }
  }

  /**
   * Update all derived state in a single pass over the files
   */
  private updateDerivedState() {
    this.cachedSnapshot = null
    this.cachedFilesArray = Array.from(this.files.values())

    // Single pass to calculate all derived values
    const counts = {
      pending: 0,
      active: 0,
      paused: 0,
      stopped: 0,
      failed: 0,
      completed: 0,
    }

    let hasActiveUpload = false
    let allCompleted = this.cachedFilesArray.length > 0
    const ids: string[] = []

    for (const file of this.cachedFilesArray) {
      ids.push(file.id)

      // Count by status
      switch (file.status) {
        case 'pending':
          counts.pending++
          if (this._uploadSessionStarted) {
            hasActiveUpload = true
          }
          allCompleted = false
          break
        case 'paused':
          counts.paused++
          counts.active++ // paused is still considered "active"
          hasActiveUpload = true
          allCompleted = false
          break
        case 'cancelled':
          counts.stopped++
          allCompleted = false
          break
        case 'failed':
          counts.failed++
          allCompleted = false
          break
        case 'completed':
          counts.completed++
          break
        default:
          // All other statuses are active (queued, preparing, creating, hashing, uploading, retrying, finalizing)
          if (isActiveUploadStatus(file.status)) {
            counts.active++
            hasActiveUpload = true
          }
          allCompleted = false
      }
    }

    // Update cached values
    this.cachedFileIds = ids
    this.cachedUploadInProgress = hasActiveUpload
    this.cachedUploadFinished = allCompleted
    this.cachedCounts = counts
  }
}
