import { DropEvent } from 'react-dropzone'
import type { FilesMeta } from './constants'
import type { UploadStatus } from './fileUpload.shared'

export interface UploadSourceFile {
  id: string
  file: File
  relativePath: string
}

/**
 * Check if a status represents an active upload (not pending, completed, failed, or cancelled)
 */
export const isActiveUploadStatus = (status: UploadStatus): boolean =>
  status === 'queued' ||
  status === 'preparing' ||
  status === 'creating' ||
  status === 'hashing' ||
  status === 'uploading' ||
  status === 'paused' ||
  status === 'retrying' ||
  status === 'finalizing'

/**
 * Check if a file in this status can be cancelled.
 * Excludes 'finalizing' since the close request is not interruptible
 * and cancelling would leave orphaned data on the server.
 */
export const isCancellableStatus = (status: UploadStatus): boolean =>
  status === 'queued' ||
  status === 'preparing' ||
  status === 'creating' ||
  status === 'hashing' ||
  status === 'uploading' ||
  status === 'paused' ||
  status === 'retrying'

/**
 * Calculate upload speed from file state
 * Returns bytes per second, or undefined if not applicable
 *
 * Uses lastProgressAt instead of current time so speed stays stable
 * between chunk completions (doesn't decrease as time passes)
 */
export const calculateSpeed = (file: FilesMeta): number | undefined => {
  // Only calculate speed for actively uploading files
  if (file.status !== 'uploading' || !file.uploadStartedAt) {
    return undefined
  }

  // Use lastProgressAt (when bytes last changed) instead of now
  // This keeps speed stable between chunk completions
  const endTime = file.lastProgressAt ?? file.uploadStartedAt
  const elapsed = endTime - file.uploadStartedAt

  if (elapsed <= 0 || file.uploadedSize <= 0) {
    return undefined
  }

  return (file.uploadedSize / elapsed) * 1000
}

/**
 * Calculate ETA in seconds
 */
export const calculateEta = (file: FilesMeta): number | undefined => {
  const speed = calculateSpeed(file)
  if (!speed || speed <= 0) return undefined

  const remaining = file.size - file.uploadedSize
  if (remaining <= 0) return 0

  return remaining / speed
}

export const formatSpeed = (speedBps?: number) => {
  if (!speedBps || speedBps <= 0) return null
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s']
  let value = speedBps
  let idx = 0
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024
    idx += 1
  }
  const formatted = value >= 10 ? value.toFixed(0) : value.toFixed(1)
  return `${formatted} ${units[idx]}`
}

export const formatFileSize = (bytes?: number) => {
  if (bytes == null || !Number.isFinite(bytes)) return '--'
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let value = Math.max(bytes, 0)
  let idx = 0

  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024
    idx += 1
  }

  const precision = value >= 10 || idx === 0 ? 0 : 1
  return `${value.toFixed(precision)} ${units[idx]}`
}

export const formatDuration = (ms?: number) => {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return '--'
  if (ms < 1000) return '<1s'

  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    const parts = [`${hours}h`]
    if (minutes > 0) parts.push(`${minutes}m`)
    if (seconds > 0) parts.push(`${seconds}s`)
    return parts.join(' ')
  }

  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
  }

  return `${seconds}s`
}

const normalizePath = (value: string) => value.replace(/\\/g, '/').replace(/^\//, '')

export const deriveRelativePath = (file: File, provided?: string) => {
  if (provided && provided.trim().length > 0) {
    return normalizePath(provided)
  }

  const withExtras = file as File & { webkitRelativePath?: string; path?: string; relativePath?: string }
  const candidate = withExtras.webkitRelativePath ?? withExtras.path ?? withExtras.relativePath
  if (!candidate || candidate.trim().length === 0) {
    return file.name
  }

  return normalizePath(candidate)
}

export const isUniqFile = (entries: UploadSourceFile[], file: File, relativePath: string): boolean =>
  !entries.some(entry => {
    const existing = entry.file
    return (
      entry.relativePath === relativePath &&
      existing.name === file.name &&
      existing.lastModified === file.lastModified &&
      existing.size === file.size &&
      existing.type === file.type
    )
  })

export type DroppedFileDescriptor = {
  file: File
  relativePath?: string
}

export class TooManyFilesError extends Error {
  constructor(limit: number) {
    super(`You can only select up to ${limit} files at a time. Please choose a smaller set and try again.`)
    this.name = 'TooManyFilesError'
  }
}

export interface CollectDroppedFilesOptions {
  maxFiles?: number
}

type CollectionContext = {
  count: number
  maxFiles?: number
}

type WebkitDataTransferItem = DataTransferItem & {
  webkitGetAsEntry?: () => FileSystemEntry | null
}

export const splitDisplayPath = (value: string) => {
  const normalized = value.replace(/^\/+/g, '')
  const index = normalized.lastIndexOf('/')
  if (index === -1) {
    return { directory: '', fileName: normalized }
  }

  const directory = normalized.slice(0, index)
  const fileName = normalized.slice(index + 1)

  // Hide the directory path if it's "./" or "."
  if (directory === '.' || directory === './') {
    return { directory: '', fileName }
  }

  return {
    directory,
    fileName,
  }
}

export const collectDroppedFiles = async (
  accepted: File[],
  event?: DropEvent,
  options: CollectDroppedFilesOptions = {},
): Promise<DroppedFileDescriptor[]> => {
  if (event && 'persist' in event && typeof event.persist === 'function') {
    event.persist()
  }

  const context: CollectionContext = {
    count: 0,
    maxFiles: options.maxFiles,
  }

  if (context.maxFiles != null && accepted.length > context.maxFiles) {
    throw new TooManyFilesError(context.maxFiles)
  }

  const items = getDataTransferItems(event)
  if (!items || items.length === 0) {
    return accepted.map(file => createDescriptor(file, context))
  }

  const entries = Array.from(items)
    .filter(item => item.kind === 'file')
    .map(item => (item as WebkitDataTransferItem).webkitGetAsEntry?.())
    .filter((entry): entry is FileSystemEntry => Boolean(entry))

  if (entries.length === 0) {
    return accepted.map(file => createDescriptor(file, context))
  }

  try {
    const descriptors: DroppedFileDescriptor[] = []
    for (const entry of entries) {
      const nested = await readEntryRecursively(entry, context)
      descriptors.push(...nested)
    }
    if (descriptors.length > 0) {
      return descriptors
    }
  } catch (error) {
    if (error instanceof TooManyFilesError) {
      throw error
    }
    // ignore and fall back to accepted files
  }

  return accepted.map(file => createDescriptor(file, context))
}

const getDataTransferItems = (event?: DropEvent) => {
  if (!event) return null
  if ('dataTransfer' in event && event.dataTransfer) {
    return event.dataTransfer.items
  }

  const nativeEvent = 'nativeEvent' in event ? (event.nativeEvent as unknown) : undefined
  if (nativeEvent && typeof nativeEvent === 'object' && nativeEvent !== null && 'dataTransfer' in nativeEvent) {
    const dataTransfer = (nativeEvent as DragEvent).dataTransfer
    return dataTransfer?.items ?? null
  }

  return null
}

const readEntryRecursively = async (
  entry: FileSystemEntry,
  context: CollectionContext,
): Promise<DroppedFileDescriptor[]> => {
  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry
    const file = await readFileFromEntry(fileEntry)
    const normalizedPath = normalizePath(entry.fullPath || entry.name || file.name)
    const relativePath = normalizedPath.length > 0 ? normalizedPath : file.name
    const fileWithPath = file as File & { relativePath?: string }
    fileWithPath.relativePath = relativePath
    return [createDescriptor(fileWithPath, context, relativePath)]
  }

  if (entry.isDirectory) {
    const directoryEntry = entry as FileSystemDirectoryEntry
    const reader = directoryEntry.createReader()
    const children = await readAllDirectoryEntries(reader, context)
    const nested: DroppedFileDescriptor[] = []
    for (const child of children) {
      const descriptors = await readEntryRecursively(child, context)
      nested.push(...descriptors)
    }
    return nested
  }

  return []
}

const readAllDirectoryEntries = (reader: FileSystemDirectoryReader, context: CollectionContext) =>
  new Promise<FileSystemEntry[]>((resolve, reject) => {
    const entries: FileSystemEntry[] = []

    const readBatch = () => {
      if (context.maxFiles != null && context.count >= context.maxFiles) {
        resolve(entries)
        return
      }

      reader.readEntries(
        batch => {
          if (batch.length === 0) {
            resolve(entries)
            return
          }
          entries.push(...batch)

          if (context.maxFiles != null && context.count >= context.maxFiles) {
            resolve(entries)
            return
          }

          readBatch()
        },
        error => {
          reject(error)
        },
      )
    }

    readBatch()
  })

const readFileFromEntry = (entry: FileSystemFileEntry) =>
  new Promise<File>((resolve, reject) => {
    entry.file(resolve, reject)
  })

function createDescriptor(file: File, context: CollectionContext, relativePath?: string): DroppedFileDescriptor {
  enforceLimit(context)
  return relativePath ? { file, relativePath } : { file }
}

function enforceLimit(context: CollectionContext) {
  context.count += 1
  if (context.maxFiles != null && context.count > context.maxFiles) {
    throw new TooManyFilesError(context.maxFiles)
  }
}
