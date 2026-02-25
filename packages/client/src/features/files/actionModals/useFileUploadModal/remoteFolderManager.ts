/**
 * Remote Folder Manager
 *
 * Encapsulates the logic for discovering, caching, and creating remote folder
 * structures needed for multi-file uploads. It keeps track of which folders
 * have already been created remotely so file uploads can reuse the resolved
 * folder identifiers without repeating API calls.
 */

import type { HomeScope } from '@/features/home/types'
import { addFolderRequest } from '../../files.api'

type FolderId = string | null
type PendingFolder = Promise<FolderId>
type DirectoryCacheEntry = readonly [string, FolderId]

export interface RemoteFolderManagerConfig {
  readonly rootFolderId?: string | null
  readonly spaceId?: string
  readonly homeScope?: HomeScope
  readonly initialDirectoryCache?: ReadonlyArray<DirectoryCacheEntry>
  readonly onDirectoryCached?: (path: string, folderId: FolderId) => void
}

export class RemoteRootFolderExistsError extends Error {
  constructor(
    public readonly folderName: string,
    public readonly directoryPath: string,
    message?: string,
  ) {
    super(message ?? `Folder "${folderName}" already exists remotely. Upload cancelled.`)
    this.name = 'RemoteRootFolderExistsError'
  }
}

/**
 * Handles remote folder bookkeeping and creation.
 */
export class RemoteFolderManager {
  private readonly folderCache = new Map<string, FolderId>()
  private readonly pendingFolders = new Map<string, PendingFolder>()
  private readonly registeredDirectories = new Set<string>()
  private readonly directoryQueue: string[] = []
  private readonly rootDirectories = new Set<string>()

  private readonly onDirectoryCached?: (path: string, folderId: FolderId) => void

  constructor(private readonly config: RemoteFolderManagerConfig) {
    this.onDirectoryCached = config.onDirectoryCached
    this.storeInCache('', config.rootFolderId ?? null, false)

    const initialCache = config.initialDirectoryCache ?? []
    for (const [path, folderId] of initialCache) {
      this.storeInCache(path, folderId)
    }
  }

  /**
   * Records a directory (and its parent chain) as part of the upload plan.
   */
  registerDirectory(rawPath: string): void {
    const normalized = normalizeDirectoryPath(rawPath)
    if (!normalized) return

    const segments = normalized.split('/')
    let current = ''

    for (const [index, segment] of segments.entries()) {
      current = current ? `${current}/${segment}` : segment
      if (this.registeredDirectories.has(current)) continue
      this.registeredDirectories.add(current)
      this.directoryQueue.push(current)

      if (index === 0) {
        this.rootDirectories.add(current)
      }
    }
  }

  /**
   * Returns the cached folder id for a directory if known.
   */
  getCachedFolderId(rawPath: string): FolderId | undefined {
    const normalized = normalizeDirectoryPath(rawPath)
    if (!normalized) {
      return this.folderCache.get('') ?? null
    }

    if (!this.folderCache.has(normalized)) {
      return undefined
    }

    return this.folderCache.get(normalized) ?? null
  }

  /**
   * Ensures the folder structure for the provided directory exists remotely.
   */
  async ensureDirectory(rawPath: string): Promise<FolderId> {
    const normalized = normalizeDirectoryPath(rawPath)
    if (!normalized) {
      return this.folderCache.get('') ?? null
    }

    if (this.folderCache.has(normalized)) {
      return this.folderCache.get(normalized) ?? null
    }

    if (this.pendingFolders.has(normalized)) {
      return this.pendingFolders.get(normalized)!
    }

    const creation = this.createDirectory(normalized)
      .catch(error => {
        // Remove stale cache entries so subsequent attempts can retry creation.
        this.folderCache.delete(normalized)
        throw error
      })
      .finally(() => {
        this.pendingFolders.delete(normalized)
      })

    this.pendingFolders.set(normalized, creation)
    return creation
  }

  /**
   * Ensures the directory portion of a file's relative path exists remotely.
   */
  async ensureRelativePath(relativePath: string): Promise<FolderId> {
    const directory = extractDirectory(relativePath)
    return this.ensureDirectory(directory)
  }

  /**
   * Exposes the registered directory queue for diagnostics/testing.
   */
  getQueuedDirectories(): readonly string[] {
    return this.directoryQueue
  }

  /**
   * Ensures all registered root directories exist before uploads begin.
   */
  async ensureRootDirectories(): Promise<void> {
    const tasks = Array.from(this.rootDirectories).map(async rootDirectory => {
      if (!rootDirectory) return
      await this.ensureDirectory(rootDirectory)
    })

    if (tasks.length === 0) return

    await Promise.all(tasks)
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  private async createDirectory(path: string): Promise<FolderId> {
    const parentPath = getParentDirectory(path)
    const parentId = await this.ensureDirectory(parentPath)

    // Directory may have been created by another pending request.
    if (this.folderCache.has(path)) {
      return this.folderCache.get(path) ?? null
    }

    const folderName = getFolderName(path)
    if (!folderName) {
      this.storeInCache(path, parentId ?? null)
      return parentId ?? null
    }

    try {
      const response = await addFolderRequest(
        { name: folderName },
        parentId ?? undefined,
        this.config.spaceId,
        this.config.homeScope,
      )

      if (response?.message?.type === 'error') {
        throw new Error(response.message?.text ?? `Unable to create folder ${folderName}`)
      }

      const newId = pickFolderId(response)
      if (!newId) {
        throw new Error(`Unable to determine remote folder id for ${folderName}`)
      }

      this.storeInCache(path, newId)
      return newId
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error))

      if (this.isRootDirectory(path) && isFolderAlreadyExistsError(normalizedError)) {
        throw new RemoteRootFolderExistsError(folderName, path, normalizedError.message)
      }

      console.error(`Failed to create folder ${folderName}:`, normalizedError)
      throw normalizedError
    }
  }

  private isRootDirectory(path: string): boolean {
    if (!path) return false
    if (path.includes('/')) return false
    return this.rootDirectories.has(path)
  }

  private storeInCache(path: string, folderId: FolderId, notify = true): void {
    const normalized = normalizeDirectoryPath(path)
    const cacheKey = normalized
    const target = folderId ?? null

    if (this.folderCache.get(cacheKey) === target) {
      return
    }

    this.folderCache.set(cacheKey, target)

    if (!notify) return
    if (!cacheKey) return
    this.onDirectoryCached?.(cacheKey, target)
  }
}

// -----------------------------------------------------------------------------
// Utility functions
// -----------------------------------------------------------------------------

export function extractDirectory(relativePath: string): string {
  const normalized = normalizeDirectoryPath(relativePath)
  if (!normalized.includes('/')) return ''

  const parts = normalized.split('/')
  parts.pop()
  return parts.join('/')
}

function normalizeDirectoryPath(path: string): string {
  if (!path) return ''

  return path
    .replace(/\\/g, '/')
    .split('/')
    .filter(segment => segment && segment !== '.')
    .join('/')
}

function getParentDirectory(path: string): string {
  if (!path.includes('/')) return ''
  const parts = path.split('/')
  parts.pop()
  return parts.join('/')
}

function getFolderName(path: string): string {
  if (!path) return ''
  const parts = path.split('/')
  return parts.pop() ?? ''
}

function pickFolderId(response: any): string | null {
  const candidates = [response?.folder?.id, response?.folder_id, response?.id, response?.payload?.id]

  const value = candidates.find(candidate => candidate !== undefined && candidate !== null)
  return value != null ? String(value) : null
}

function isFolderAlreadyExistsError(error: Error): boolean {
  const message = error.message.toLowerCase()
  if (!message) return false

  return (
    message.includes('already exist') || message.includes('already been taken') || message.includes('already taken')
  )
}
