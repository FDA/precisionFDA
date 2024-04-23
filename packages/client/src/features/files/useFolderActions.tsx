import { useCloudResourcesCondition } from '../../hooks/useCloudResourcesCondition'
import { ActionFunctionsType, HomeScope } from '../home/types'
import { useAddFolderModal } from './actionModals/useAddFolderModal'
import { useCopyFilesToSpaceModal } from './actionModals/useCopyFilesToSpaceModal'
import { useFileUploadModal } from './actionModals/useFileUploadModal'
import { useOptionAddFileModal } from './actionModals/useOptionAddFileModal'
import { FolderActions } from './files.types'

export const useFolderActions = (homeScope?: HomeScope, folderId?: string, spaceId?: string) => {
  const { isAllowed, onViolation } = useCloudResourcesCondition('totalLimitCheck')
  const { modalComp: AddFolderModal, setShowModal: setShowAddFolderModal } =
    useAddFolderModal({ homeScope, folderId, spaceId, isAllowed, onViolation })
  const { modalComp: FileUploadModal, setShowModal: setShowFileUploadModal } =
    useFileUploadModal({ homeScope, folderId, spaceId, isAllowed, onViolation })
  const { modalComp: CopyFilesModal, setShowModal: setShowCopyFilesModal } =
    useCopyFilesToSpaceModal({ spaceId })
  const {
    modalComp: OptionAddFileModal,
    setShowModal: setShowOptionAddFileModal,
  } = useOptionAddFileModal({ setShowFileUploadModal, setShowCopyFilesModal })

  const listActionsFunctions: ActionFunctionsType<FolderActions> = {
    'Add Folder': {
      type: 'modal',
      func: ({ showModal = false } = {}) => setShowAddFolderModal(showModal),
      isDisabled: false,
      modal: AddFolderModal,
    },
    'Add Files': {
      type: 'modal',
      func: ({ showModal = false } = {}) => setShowFileUploadModal(showModal),
      isDisabled: false,
      modal: FileUploadModal,
    },
    'Copy Files': {
      type: 'modal',
      func: ({ showModal = false } = {}) => setShowCopyFilesModal(showModal),
      isDisabled: false,
      modal: CopyFilesModal,
    },
    'Choose Add Option': {
      type: 'modal',
      func: ({ showModal = false } = {}) =>
        setShowOptionAddFileModal(showModal),
      isDisabled: false,
      modal: OptionAddFileModal,
    },
  }

  return listActionsFunctions
}
