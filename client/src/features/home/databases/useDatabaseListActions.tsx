import { ActionFunctionsType, ResourceScope } from "../types";
import { useCreateDatabaseModal } from './useCreateDatabaseModal';
import { DatabaseListActions } from "./databases.types";



export const useDatabaseListActions = (scope: ResourceScope) => {
  const {modalComp: CreateAppModal, setShowModal: setShowCreateAppModal } = useCreateDatabaseModal()

  let actionsFunctions: ActionFunctionsType<any> = {
    'Create Database': {
      func: ({ showModal = false } = {}) => setShowCreateAppModal(showModal),
      isDisabled: false,
      modal: CreateAppModal
    }
  }

  return actionsFunctions
}
