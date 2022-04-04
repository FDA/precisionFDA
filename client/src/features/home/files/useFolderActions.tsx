import { ActionFunctionsType, ResourceScope } from "../types";
import { useAddFolderModal } from './actionModals/useAddFolderModal';
import { useFileUploadModal } from "./actionModals/useFileUploadModal";
import { FolderActions } from "./files.types";


export const useFolderActions = (scope?: ResourceScope, folderId?: string) => {
  const {modalComp: AddFolderModal, setShowModal: setShowAddFolderModal } = useAddFolderModal({ scope, folderId })
  const {modalComp: FileUploadModal, setShowModal: setShowFileUploadModal } = useFileUploadModal({ scope, folderId })

  let listActionsFunctions: ActionFunctionsType<FolderActions> = {
    'Add Folder': {
      func: ({ showModal = false } = {}) => setShowAddFolderModal(showModal),
      isDisabled: false,
      modal: AddFolderModal
    },
    "Add Files": {
      func: ({ showModal = false } = {}) => setShowFileUploadModal(showModal),
      isDisabled: false,
      modal: FileUploadModal
    },
  }

  return listActionsFunctions
}
