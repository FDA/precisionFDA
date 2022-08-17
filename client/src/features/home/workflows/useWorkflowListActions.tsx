import { AxiosError } from 'axios'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { addDataRequest } from '../../spaces/spaces.api'
import { useAddResourceToModal } from '../actionModals/useAddResourceToSpace'
import { ActionFunctionsType } from '../types'
import { useCreateWorkflowModal } from './useCreateWorkflowModal'


export const useWorkflowListActions = ({ spaceId }: { spaceId: string }) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: addDataRequest,
    onError: (e: AxiosError) => {
      toast.error(`Error adding resource to space. ${e.message}`)
    },
  })

  const { modalComp: CreateAppModal, setShowModal: setShowCreateAppModal } = useCreateWorkflowModal()
  const { modalComp: AddWorkflowModal, setShowModal: setShowAddWorkflowModal } = useAddResourceToModal({
    spaceId,
    resource: 'workflows',
    onSuccess: () => {
      toast.success('Successfully added workflow resource(s) to space.')
      queryClient.invalidateQueries(['workflows'])
      setShowAddWorkflowModal(false)
    },
    mutation,
  })

  const actionsFunctions: ActionFunctionsType<any> = {
    'Create Workflow': {
      type: 'modal',
      func: ({ showModal = false } = {}) => setShowCreateAppModal(showModal),
      isDisabled: false,
      modal: CreateAppModal,
    },
    'Add Workflow': {
      type: 'modal',
      func: ({ showModal = false } = {}) => setShowAddWorkflowModal(showModal),
      isDisabled: false,
      modal: AddWorkflowModal,
    },
  }

  return actionsFunctions
}
