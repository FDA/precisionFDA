import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { HomeScope, MetaPath } from '@/features/home/types'
import { useConditionalModal } from '@/features/modal/useModal'
import { spaceRequest } from '@/features/spaces/spaces.api'
import { useCloudResourcesCondition } from '@/hooks/useCloudResourcesCondition'
import { useFileUploadModal as useFileUploadModalLegacy } from '../useFileUploadModalLegacy'
import type { FilesMeta } from './constants'
import { FileUploadModal } from './FileUploadModal'
import { UploadConflictModal } from './UploadConflictModal'
import { useMultiFileUpload } from './useMultiFileUpload'

export interface CompletedFileInfo {
  uid: string
  name: string
  size: number
  /** The remote folder ID this file was uploaded to (null/undefined = root) */
  remoteFolderId?: string | null
}

export interface FileUploadModalOpenOptions {
  homeScope?: HomeScope
  folderId?: string
  folderPath?: MetaPath[]
  spaceId?: string
  onUpload?: () => void
  onUploadStart?: () => void
  onUploadFinished?: () => void
}

interface FileUploadModalContextValue {
  openModal: (options?: FileUploadModalOpenOptions) => void
  closeModal: () => void
  setModalVisibility: (visible: boolean) => void
  isModalShown: boolean
  currentOptions: FileUploadModalOpenOptions
  /** Whether an upload is currently in progress - used to suppress websocket-triggered refreshes */
  uploadInProgress: boolean
  /** Get info about files that have completed uploading (for optimistic updates) */
  getCompletedFiles: () => CompletedFileInfo[]
}

const FileUploadModalContext = createContext<FileUploadModalContextValue | undefined>(undefined)

export const FileUploadModalProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<FileUploadModalOpenOptions>({})
  const [isMinimized, setIsMinimized] = useState(false)
  const [showConflictModal, setShowConflictModal] = useState(false)

  const { isAllowed, onViolation } = useCloudResourcesCondition('totalLimitCheck')
  const { isShown, setShowModal } = useConditionalModal(isAllowed, onViolation)

  // Legacy modal support
  const { modalComp: legacyModalComp, setShowModal: setShowLegacyModal } = useFileUploadModalLegacy({
    homeScope: options.homeScope,
    folderId: options.folderId,
    spaceId: options.spaceId,
    isAllowed,
    onViolation,
    onUpload: options.onUpload,
  })

  const queryClient = useQueryClient()

  // Fetch space data if spaceId is provided
  const { data: spaceData } = useQuery({
    queryKey: ['space', options.spaceId],
    queryFn: () => spaceRequest({ id: options.spaceId! }),
    enabled: !!options.spaceId,
  })

  const handleUploadFinished = useEffectEvent(() => {
    toast.success('Successfully uploaded files')
    // Wait 3 seconds before invalidating to allow backend to fully process the files
    setTimeout(() => {
      const keysToInvalidate = [
        ['files'],
        ['counters'],
        ...(options.spaceId ? [['space', options.spaceId.toString()]] : []),
      ]
      keysToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey })
      })
    }, 3000)
    options.onUploadFinished?.()
  })

  const uploadState = useMultiFileUpload({
    ...options,
    onUploadStart: () => {
      options.onUploadStart?.()
      options.onUpload?.()
    },
    onUploadFinished: handleUploadFinished,
  })

  const { uploadInProgress, handleRemoveAll, store } = uploadState

  // Warn user if they try to leave while uploading
  useEffect(() => {
    if (!uploadInProgress) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // Modern browsers ignore custom messages, but returnValue is needed for the dialog
      e.returnValue = 'You have active uploads in progress. Are you sure you want to leave?'
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [uploadInProgress])

  // Get info about files that have completed uploading (for optimistic updates)
  const getCompletedFiles = useCallback((): CompletedFileInfo[] => {
    const files = store.getFiles()
    return files
      .filter((f): f is FilesMeta & { fileUid: string } => f.status === 'completed' && !!f.fileUid)
      .map(f => ({
        uid: f.fileUid,
        name: f.name,
        size: f.size,
        remoteFolderId: f.remoteFolderId,
      }))
  }, [store])

  const checkConflict = useEffectEvent((nextOptions?: FileUploadModalOpenOptions) => {
    if (uploadInProgress && nextOptions) {
      const currentFolderId = options.folderId
      const currentSpaceId = options.spaceId
      const newFolderId = nextOptions.folderId
      const newSpaceId = nextOptions.spaceId

      if (currentFolderId !== newFolderId || currentSpaceId !== newSpaceId) {
        setShowConflictModal(true)
        return true
      }
    }
    return false
  })

  const openModal = useCallback(
    (nextOptions?: FileUploadModalOpenOptions) => {
      if (checkConflict(nextOptions)) {
        return
      }

      if (nextOptions) {
        const currentFolderId = options.folderId
        const currentSpaceId = options.spaceId
        const newFolderId = nextOptions.folderId
        const newSpaceId = nextOptions.spaceId

        // If changing location and not uploading, clear previous files
        if ((currentFolderId !== newFolderId || currentSpaceId !== newSpaceId) && !uploadInProgress) {
          handleRemoveAll()
        }

        setOptions(prev => ({
          ...prev,
          ...nextOptions,
        }))
      }
      setIsMinimized(false)
      setShowModal(true)
    },
    [setShowModal, checkConflict, options, uploadInProgress, handleRemoveAll],
  )

  const closeModal = useCallback(() => {
    if (uploadInProgress) {
      setIsMinimized(true)
      setShowModal(false)
    } else {
      setShowModal(false)
    }
  }, [setShowModal, uploadInProgress])

  const handleOpenExisting = useCallback(() => {
    setShowConflictModal(false)
    setIsMinimized(false)
    setShowModal(true)
  }, [setShowModal])

  const handleCancelConflict = useCallback(() => {
    setShowConflictModal(false)
  }, [])

  const handleSwitchToLegacy = useCallback(() => {
    setShowModal(false)
    setShowLegacyModal(true)
  }, [setShowModal, setShowLegacyModal])

  // Memoized handlers for minimize/restore to prevent child re-renders
  const handleMinimize = useCallback(() => {
    setIsMinimized(true)
    setShowModal(false)
  }, [setShowModal])

  const handleRestore = useCallback(() => {
    setIsMinimized(false)
    setShowModal(true)
  }, [setShowModal])

  const contextValue = useMemo<FileUploadModalContextValue>(
    () => ({
      openModal,
      closeModal,
      setModalVisibility: setShowModal,
      isModalShown: Boolean(isShown),
      currentOptions: options,
      uploadInProgress,
      getCompletedFiles,
    }),
    [closeModal, isShown, openModal, options, setShowModal, uploadInProgress, getCompletedFiles],
  )

  return (
    <FileUploadModalContext.Provider value={contextValue}>
      {children}
      <FileUploadModal
        isShown={Boolean(isShown)}
        onClose={() => setShowModal(false)}
        uploadState={uploadState}
        spaceId={options.spaceId}
        spaceName={spaceData?.space?.name}
        homeScope={options.homeScope}
        folderPath={options.folderPath}
        isMinimized={isMinimized}
        onMinimize={handleMinimize}
        onRestore={handleRestore}
        onSwitchToLegacy={handleSwitchToLegacy}
      />
      {legacyModalComp}
      <UploadConflictModal
        isShown={showConflictModal}
        onCancel={handleCancelConflict}
        onOpenExisting={handleOpenExisting}
      />
    </FileUploadModalContext.Provider>
  )
}

export const useFileUploadModalContext = () => {
  const ctx = useContext(FileUploadModalContext)
  if (!ctx) {
    throw new Error('useFileUploadModalContext must be used within a FileUploadModalProvider')
  }
  return ctx
}
