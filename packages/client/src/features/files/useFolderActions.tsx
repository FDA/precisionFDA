import { ReactNode } from 'react'
import { useCloudResourcesCondition } from '../../hooks/useCloudResourcesCondition'
import { Action } from '../home/action-types'
import { extractModalsFromActions } from '../home/extractModalsFromActions'
import { HomeScope } from '../home/types'
import { useAddFolderModal } from './actionModals/useAddFolderModal'
import { useCopyFilesToSpaceModal } from './actionModals/useCopyFilesToSpaceModal'
import { useFileUploadModal } from './actionModals/useFileUploadModal'
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
): UseFolderActionsResult => {
  const { isAllowed, onViolation } = useCloudResourcesCondition('totalLimitCheck')
  
  const { modalComp: AddFolderModal, setShowModal: setShowAddFolderModal } = useAddFolderModal({
    homeScope,
    folderId,
    spaceId,
    isAllowed,
    onViolation,
  })
  
  const { modalComp: FileUploadModal, setShowModal: setShowFileUploadModal } = useFileUploadModal({
    homeScope,
    folderId,
    spaceId,
    isAllowed,
    onViolation,
    onUpload: () => {
      if (resetSelected) resetSelected()
    },
  })
  
  const { modalComp: CopyFilesModal, setShowModal: setShowCopyFilesModal } = useCopyFilesToSpaceModal({ spaceId })
  
  const { modalComp: OptionAddFileModal, setShowModal: setShowOptionAddFileModal } = useOptionAddFileModal({
    setShowFileUploadModal,
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
      func: () => setShowFileUploadModal(true),
      isDisabled: false,
      modal: FileUploadModal,
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
