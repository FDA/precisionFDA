import { ActionFunctionsType, ResourceScope } from '../types'
import { useCreateDatabaseModal } from './useCreateDatabaseModal'



export const useDatabaseListActions = (scope: ResourceScope) => {
  const { modalComp: CreateAppModal, setShowModal: setShowCreateAppModal } = useCreateDatabaseModal()

  const actionsFunctions: ActionFunctionsType<any> = {
    'Create Database': {
      type: 'modal',
      func: ({ showModal = false } = {}) => setShowCreateAppModal(showModal),
      isDisabled: false,
      modal: CreateAppModal,
    },
  }

  return actionsFunctions
}
