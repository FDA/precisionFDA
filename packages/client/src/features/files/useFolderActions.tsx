import { ReactNode, useCallback } from 'react'
import { useCloudResourcesCondition } from '../../hooks/useCloudResourcesCondition'
import { Action } from '../home/action-types'
import { extractModalsFromActions } from '../home/extractModalsFromActions'
import { HomeScope, MetaPath } from '../home/types'
import { useAddFolderModal } from './actionModals/useAddFolderModal'
import { useCopyFilesToSpaceModal } from './actionModals/useCopyFilesToSpaceModal'
import { useFileUploadModalContext } from './actionModals/useFileUploadModal/FileUploadModalProvider'
import { useOptionAddFileModal } from './actionModals/useOptionAddFileModal'

export interface UseFolderActionsResult {
  actions: Action[]
  modals: Record<string, ReactNode>
}

export const useFolderActions = (
  homeScope?: HomeScope,
  folderId?: string,
  spaceId?: string,
  resetSelected?: () => void,
  metaPath?: MetaPath[],
): UseFolderActionsResult => {
  const { isAllowed, onViolation } = useCloudResourcesCondition('totalLimitCheck')
  
  const { modalComp: AddFolderModal, setShowModal: setShowAddFolderModal } = useAddFolderModal({
    homeScope,
    folderId,
    spaceId,
    isAllowed,
    onViolation,
  })

  const { openModal: openRootFileUploadModal } = useFileUploadModalContext()

  const handleUploadStart = useCallback(() => {
    if (resetSelected) {
      resetSelected()
    }
  }, [resetSelected])

  const triggerFileUploadModal = useCallback(() => {
    openRootFileUploadModal({
      homeScope,
      folderId,
      folderPath: metaPath,
      spaceId,
      onUpload: handleUploadStart,
    })
  }, [folderId, metaPath, handleUploadStart, homeScope, openRootFileUploadModal, spaceId])
  
  const { modalComp: CopyFilesModal, setShowModal: setShowCopyFilesModal } = useCopyFilesToSpaceModal({ spaceId })
  
  const { modalComp: OptionAddFileModal, setShowModal: setShowOptionAddFileModal } = useOptionAddFileModal({
    openFileUploadModal: triggerFileUploadModal,
    setShowCopyFilesModal,
  })

  const actions: Action[] = [
    {
      name: 'Add Folder',
      type: 'modal',
      func: () => setShowAddFolderModal(true),
      isDisabled: false,
      modal: AddFolderModal,
    },
    {
      name: 'Add Files',
      type: 'modal',
      func: () => triggerFileUploadModal(),
      isDisabled: false,
      modal: null,
    },
    {
      name: 'Copy Files',
      type: 'modal',
      func: () => setShowCopyFilesModal(true),
      isDisabled: false,
      modal: CopyFilesModal,
    },
    {
      name: 'Choose Add Option',
      type: 'modal',
      func: () => setShowOptionAddFileModal(true),
      isDisabled: false,
      modal: OptionAddFileModal,
    },
  ]

  const modals = extractModalsFromActions(actions)

  return { actions, modals }
}
