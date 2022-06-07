import { ActionFunctionsType } from "../types";
import { useCreateWorkflowModal } from './useCreateWorkflowModal';


export const useWorkflowListActions = () => {
  const {modalComp: CreateAppModal, setShowModal: setShowCreateAppModal } = useCreateWorkflowModal()

  let actionsFunctions: ActionFunctionsType<any> = {
    'Create Workflow': {
      func: ({ showModal = false } = {}) => setShowCreateAppModal(showModal),
      isDisabled: false,
      modal: CreateAppModal
    }
  }

  return actionsFunctions
}
