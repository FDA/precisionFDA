import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { DropEvent } from 'react-dropzone'
import { toast } from 'react-toastify'
import type { HomeScope } from '@/features/home/types'
import { createSequenceGenerator } from '@/utils/index'
import { useOnlineStatus } from '@/utils/OnlineStatusContext'
import { FilesMeta, MAX_FILES_PER_SELECTION, MAX_UPLOADABLE_FILES } from './constants'
import type { UploadState } from './fileUpload'
import { FileUploadStore } from './FileUploadStore'
import {
  createMultiFileUploadCoordinator,
  MultiFileUploadCoordinator,
  type UploadFileDescriptor,
} from './multiFileUploadCoordinator'
import { collectDroppedFiles, deriveRelativePath, isActiveUploadStatus, TooManyFilesError } from './utils'

const idGenerator = createSequenceGenerator()

// Module-level selector for allActiveArePaused to avoid recreating in useMemo
const selectAllActiveArePaused = (store: FileUploadStore): boolean => {
  const files = store.getFiles()
  const activeFiles = files.filter(file => isActiveUploadStatus(file.status))
  return activeFiles.length > 0 && activeFiles.every(file => file.status === 'paused')
}

export interface UseMultiFileUploadProps {
  homeScope?: HomeScope
  folderId?: string
  spaceId?: string
  onUploadStart?: () => void
  onUploadFinished?: () => void
}

export type UseMultiFileUploadResult = ReturnType<typeof useMultiFileUpload>

export const useMultiFileUpload = ({
  homeScope,
  folderId,
  spaceId,
  onUploadStart,
  onUploadFinished,
}: UseMultiFileUploadProps) => {
  const [store] = useState(() => new FileUploadStore())
  const directoryCacheRef = useRef<Map<string, string | null>>(new Map())
  const uploadCoordinatorRef = useRef<MultiFileUploadCoordinator | null>(null)
  const { isOnline } = useOnlineStatus()
  const previousOnlineStateRef = useRef<boolean>(isOnline)

  // Subscribe to store state using bound methods for stable references
  const fileIds = useSyncExternalStore(store.subscribe, store.getFileIds)
  const uploadInProgress = useSyncExternalStore(store.subscribe, store.getUploadInProgress)
  const uploadFinished = useSyncExternalStore(store.subscribe, store.getUploadFinished)
  const counts = useSyncExternalStore(store.subscribe, store.getCounts)

  // Computed values
  const filesCount = fileIds.length
  const exceedsMax = filesCount > MAX_UPLOADABLE_FILES
  const noneSelected = filesCount === 0

  const {
    active: activeUploadsCount,
    paused: pausedUploadsCount,
    stopped: stoppedUploadsCount,
    failed: failedUploadsCount,
    completed: completedUploadsCount,
  } = counts

  // Use module-level selector with counts as dependency for memo invalidation
  const allActiveArePaused = useMemo(() => selectAllActiveArePaused(store), [counts, store])

  const uploadSessionStartedRef = useRef(false)
  const canResume = stoppedUploadsCount > 0

  // Effect Events for callbacks that should access latest values without being dependencies
  const onUploadStartEvent = useEffectEvent(() => {
    onUploadStart?.()
  })

  const onUploadFinishedEvent = useEffectEvent(() => {
    onUploadFinished?.()
  })

  const updateFilesStatus = useCallback(
    (fileId: string, state: UploadState) => {
      store.updateFileStatus(fileId, state)
    },
    [store],
  )

  const handleRemoteFolderResolved = useCallback(
    (fileId: string, folderId: string | null) => {
      store.updateFileRemoteFolder(fileId, folderId)
    },
    [store],
  )

  // Helper: Create coordinator config from current files
  const createCoordinatorConfig = useEffectEvent(() => {
    const filesMeta = store.getFiles()
    const files: UploadFileDescriptor[] = filesMeta
      .filter(f => f.status !== 'completed') // Don't re-upload completed files
      .map(meta => {
        const file = store.getFileObject(meta.id)
        if (!file) {
          throw new Error(`File object not found for ${meta.id}`)
        }
        return {
          id: meta.id,
          file,
          relativePath: meta.relativePath,
          remoteFolderId: meta.remoteFolderId ?? undefined,
        }
      })

    const knownDirectories = Array.from(directoryCacheRef.current.entries()) as ReadonlyArray<
      readonly [string, string | null]
    >

    // Determine scope: space scope takes priority over home scope
    const scope = spaceId
      ? `space-${spaceId}`
      : homeScope === 'me'
        ? 'private'
        : homeScope === 'everybody'
          ? 'public'
          : homeScope

    return {
      files,
      scope,
      spaceId,
      folderId,
      homeScope,
      onFileStatusChange: updateFilesStatus,
      onRemoteFolderResolved: handleRemoteFolderResolved,
      knownDirectories,
      onDirectoryResolved: (directory: string, folderId: string | null) => {
        directoryCacheRef.current.set(directory, folderId)
      },
      onError: (fileId: string, error: Error) => {
        console.error(`Upload error for file ${fileId}:`, error)
        toast.error(error.message)
      },
    }
  })

  const handleFilesAdded = useCallback(
    async (accepted: File[], event?: DropEvent) => {
      try {
        const filesWithPaths = await collectDroppedFiles(accepted, event, { maxFiles: MAX_FILES_PER_SELECTION })
        if (filesWithPaths.length === 0) return

        const currentFiles = store.getFiles()
        const newFiles: { file: File; meta: FilesMeta }[] = []

        filesWithPaths.forEach(({ file, relativePath: providedPath }) => {
          const fileWithOptionalPath = file as File & { path?: string }
          const relativePath = deriveRelativePath(file, fileWithOptionalPath.path ?? providedPath)

          // Check for duplicates
          const isDuplicate = currentFiles.some(
            existing =>
              existing.relativePath === relativePath && existing.name === file.name && existing.size === file.size,
          )

          if (isDuplicate) return

          const id = idGenerator.next().value!.toString()

          newFiles.push({
            file,
            meta: {
              id,
              name: file.name,
              size: file.size,
              status: 'pending',
              uploadedSize: 0,
              relativePath,
              remoteFolderId: undefined,
            },
          })
        })

        if (newFiles.length > 0) {
          store.addFiles(newFiles)
        }
      } catch (error) {
        if (error instanceof TooManyFilesError) {
          toast.error(error.message)
          return
        }
        console.error('Failed to collect dropped files', error)
        toast.error('We could not process the selected files. Please try again.')
      }
    },
    [store],
  )

  const handleRemoveFile = useCallback(
    (id: string) => {
      // Cancel and remove from coordinator if upload session is active
      uploadCoordinatorRef.current?.removeFile(id)
      store.removeFile(id)
    },
    [store],
  )

  const handleRemoveAll = useCallback(() => {
    uploadCoordinatorRef.current?.cancelAll()
    uploadCoordinatorRef.current?.dispose()
    uploadCoordinatorRef.current = null
    uploadSessionStartedRef.current = false
    store.setUploadSessionStarted(false)
    directoryCacheRef.current.clear()
    store.removeAll()
  }, [store])

  const pauseFile = useCallback((id: string) => {
    uploadCoordinatorRef.current?.pauseFile(id)
  }, [])

  const resumeFile = useCallback((id: string) => {
    uploadCoordinatorRef.current?.resumeFile(id)
  }, [])

  const cancelFile = useCallback((id: string) => {
    uploadCoordinatorRef.current?.cancelFile(id)
  }, [])

  const retryFile = useCallback(async (id: string) => {
    if (!uploadCoordinatorRef.current) {
      uploadCoordinatorRef.current = createMultiFileUploadCoordinator(createCoordinatorConfig())
    }
    await uploadCoordinatorRef.current.retryFile(id)
  }, [])

  const pauseAll = useCallback(() => {
    uploadCoordinatorRef.current?.pauseAll('user')
  }, [])

  const resumeAll = useCallback(() => {
    uploadCoordinatorRef.current?.resumeAll()
  }, [])

  const cancelAll = useCallback(() => {
    uploadCoordinatorRef.current?.cancelAll()
    store.setAllFilesStatus('pending', 'cancelled')
  }, [store])

  // Shared helper to start a coordinator and handle errors/cleanup
  const startCoordinator = useEffectEvent(() => {
    uploadCoordinatorRef.current?.cancelAll()
    uploadCoordinatorRef.current?.dispose()

    const coordinator = createMultiFileUploadCoordinator(createCoordinatorConfig())
    uploadCoordinatorRef.current = coordinator

    coordinator
      .start()
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'An error occurred during upload'
        toast.error(message)
      })
      .finally(() => {
        if (uploadCoordinatorRef.current === coordinator) {
          uploadCoordinatorRef.current = null
        }
        uploadSessionStartedRef.current = false
        store.setUploadSessionStarted(false)
      })
  })

  const handleUpload = useCallback(() => {
    if (noneSelected || exceedsMax) return

    onUploadStartEvent()
    uploadSessionStartedRef.current = true
    store.setUploadSessionStarted(true)
    startCoordinator()
  }, [noneSelected, exceedsMax, store])

  const handleResume = useCallback(() => {
    store.setAllFilesStatus('cancelled', 'pending')
    uploadSessionStartedRef.current = true
    store.setUploadSessionStarted(true)
    startCoordinator()
  }, [store])

  // Effect Event for handling online state changes with access to latest filesMeta
  const handleGoingOffline = useEffectEvent(() => {
    if (!uploadCoordinatorRef.current) return
    uploadCoordinatorRef.current.pauseAll('offline')
  })

  const handleComingOnline = useEffectEvent(() => {
    if (!uploadCoordinatorRef.current) return

    // Resume paused files when coming back online
    const files = store.getFiles()
    const pausedFiles = files.filter(file => file.status === 'paused')

    pausedFiles.forEach(file => {
      uploadCoordinatorRef.current?.resumeFile(file.id)
    })
  })

  // Handle online/offline state
  useEffect(() => {
    const wasOffline = !previousOnlineStateRef.current
    const isNowOnline = isOnline

    // Update the ref for next time
    previousOnlineStateRef.current = isOnline

    if (wasOffline && isNowOnline) {
      // Coming back online
      handleComingOnline()
    } else if (!wasOffline && !isNowOnline) {
      // Going offline
      handleGoingOffline()
    }
  }, [isOnline])

  // Handle upload completion — reset session so new files can be added and uploaded
  useEffect(() => {
    if (!uploadFinished) return
    uploadSessionStartedRef.current = false
    store.setUploadSessionStarted(false)
    onUploadFinishedEvent()
  }, [uploadFinished, store])

  // Cleanup on unmount
  useEffect(
    () => () => {
      uploadCoordinatorRef.current?.cancelAll()
      uploadCoordinatorRef.current?.dispose()
      uploadCoordinatorRef.current = null
    },
    [],
  )

  return {
    store,
    fileIds,
    filesCount,
    uploadInProgress,
    uploadFinished,
    exceedsMax,
    noneSelected,
    activeUploadsCount,
    pausedUploadsCount,
    stoppedUploadsCount,
    failedUploadsCount,
    completedUploadsCount,
    allActiveArePaused,
    canResume,
    handleFilesAdded,
    handleRemoveFile,
    handleRemoveAll,
    handleUpload,
    handleResume,
    pauseFile,
    resumeFile,
    cancelFile,
    retryFile,
    pauseAll,
    resumeAll,
    cancelAll,
  }
}
