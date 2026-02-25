import { useEffect, useEffectEvent, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { HomeScope, Notification, NOTIFICATION_ACTION, ServerScope } from '../home/types'
import { CompletedFileInfo, useFileUploadModalContext } from './actionModals/useFileUploadModal/FileUploadModalProvider'
import { FetchFilesQuery } from './files.api'
import { IFile } from './files.types'
import { useLastWSNotification } from '../../hooks/useLastWSNotification'

/**
 * Convert HomeScope to ServerScope for file creation
 */
function getServerScope(homeScope: HomeScope | undefined, spaceId: string | undefined): ServerScope {
  if (spaceId) {
    return `space-${spaceId}`
  }
  if (homeScope) {
    switch (homeScope) {
      case 'me':
        return 'private'
      case 'everybody':
      case 'featured':
        return 'public'
      default:
        return 'private'
    }
  }
  return 'private'
}

/**
 * Convert completed file info from upload store to IFile format for optimistic cache updates.
 * Creates a minimal IFile with the data we have from the upload.
 */
function completedFileToIFile(file: CompletedFileInfo, scope: ServerScope): IFile {
  return {
    id: 0, // Will be updated on full refresh
    uid: file.uid,
    name: file.name,
    type: 'UserFile',
    state: 'closed',
    scope,
    file_size: file.size.toString(),
    size: file.size.toString(),
    created_at: new Date().toISOString(),
    created_at_date_time: new Date().toISOString(),
    added_by: '', // Will be updated on full refresh
    locked: false,
    resource: false,
    location: scope === 'private' ? 'Private' : 'Public',
    featured: false,
    space_id: null,
    origin: 'Uploaded',
    tags: [],
    properties: {},
    description: null,
    links: {},
    show_license_pending: false,
    path: [],
  }
}

/**
 * Extract folderId from a query key.
 * Query keys include params like 'folderId=123' as string elements.
 * Returns undefined if the query is for root (no folder).
 */
function getFolderIdFromQueryKey(queryKey: readonly unknown[]): string | undefined {
  for (const part of queryKey) {
    if (typeof part === 'string' && part.startsWith('folderId=')) {
      return part.replace('folderId=', '')
    }
  }
  return undefined
}

/**
 * Check if a file should be added to a query based on folder matching.
 * Files should only appear in queries for their specific folder.
 */
function shouldAddFileToQuery(
  queryFolderId: string | undefined,
  fileFolderId: string | null | undefined,
): boolean {
  // Normalize: treat null, undefined, and empty string as "root"
  const normalizedQueryFolder = queryFolderId || null
  const normalizedFileFolder = fileFolderId || null
  
  return normalizedQueryFolder === normalizedFileFolder
}

interface UseFilesWebSocketUpdatesOptions {
  spaceId?: number
}

/**
 * Hook to handle WebSocket notifications for the files list.
 * 
 * During file uploads, when a FILE_CLOSED notification arrives, it constructs
 * file objects from the upload store data and optimistically adds them to the cache.
 * 
 * For other notification types (NODES_REMOVED, NODES_COPIED), it triggers a full
 * query invalidation to refresh the file list.
 */
export function useFilesWebSocketUpdates({ spaceId }: UseFilesWebSocketUpdatesOptions = {}) {
  const queryClient = useQueryClient()
  const { uploadInProgress, getCompletedFiles, currentOptions } = useFileUploadModalContext()
  
  // Track UIDs that have been optimistically added to avoid duplicates
  const addedUidsRef = useRef<Set<string>>(new Set())

  const lastJsonMessage = useLastWSNotification([
    NOTIFICATION_ACTION.NODES_REMOVED,
    NOTIFICATION_ACTION.NODES_COPIED,
    NOTIFICATION_ACTION.FILE_CLOSED,
  ])

  // Helper to optimistically add a file to the cache
  const addFileToCache = useEffectEvent((file: IFile, remoteFolderId: string | null | undefined) => {
    const fileUid = file.uid
    
    // Skip if we've already added this file
    if (addedUidsRef.current.has(fileUid)) {
      return
    }
    
    // Mark as added before updating cache to prevent race conditions
    addedUidsRef.current.add(fileUid)
    
    // Get all file queries and update only those matching the file's folder
    const queries = queryClient.getQueriesData<FetchFilesQuery>({ queryKey: ['files'], exact: false })
    
    for (const [queryKey, oldData] of queries) {
      if (!oldData) continue
      
      // Check if this query's folder matches the file's folder
      const queryFolderId = getFolderIdFromQueryKey(queryKey)
      if (!shouldAddFileToQuery(queryFolderId, remoteFolderId)) {
        continue
      }
      
      // Check if file already exists in the list (by uid)
      const existingIndex = oldData.files.findIndex(f => 
        'uid' in f && f.uid === fileUid,
      )
      if (existingIndex >= 0) {
        continue
      }
      
      // Prepend the new file to this matching query
      queryClient.setQueryData<FetchFilesQuery>(queryKey, {
        ...oldData,
        files: [file, ...oldData.files],
      })
    }
  })

  // Handle FILE_CLOSED notifications - add files optimistically during upload
  const handleFileClosed = useEffectEvent(() => {
    if (!uploadInProgress) return
    
    // Get completed files from the upload store
    const completedFiles = getCompletedFiles()
    // Get scope from the current upload options
    const scope = getServerScope(currentOptions.homeScope, currentOptions.spaceId)
    
    // Add any files we haven't added yet
    completedFiles.forEach(fileInfo => {
      if (!addedUidsRef.current.has(fileInfo.uid)) {
        const file = completedFileToIFile(fileInfo, scope)
        addFileToCache(file, fileInfo.remoteFolderId)
      }
    })
  })

  // Handle other notifications - do full invalidation
  const handleOtherNotification = useEffectEvent(() => {
    addedUidsRef.current.clear()
    queryClient.invalidateQueries({ queryKey: ['files'] })
    queryClient.invalidateQueries({ queryKey: ['space', String(spaceId)] })
    queryClient.invalidateQueries({ queryKey: ['counters'] })
  })

  // Handle WebSocket notifications
  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    
    const notification = lastJsonMessage.data as Notification
    
    if (notification.action === NOTIFICATION_ACTION.FILE_CLOSED) {
      handleFileClosed()
    } else {
      handleOtherNotification()
    }
  }, [lastJsonMessage])
  
  // Clear tracked UIDs when upload completes (the provider will trigger full invalidation)
  useEffect(() => {
    if (!uploadInProgress) {
      addedUidsRef.current.clear()
    }
  }, [uploadInProgress])
}
