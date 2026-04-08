import { AxiosError } from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addDataRequest } from '../spaces/spaces.api'
import { useAddResourceToModal } from '../actionModals/useAddResourceToSpace'
import { Action } from '../home/action-types'
import { useCreateWorkflowModal } from './useCreateWorkflowModal'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'

export const useWorkflowListActions = ({ spaceId }: { spaceId: string }) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationKey: ['add-resource-to-space', 'workflows'],
    mutationFn: addDataRequest,
    onError: (e: AxiosError<{ error?: { message?: string } }>) => {
      const msg = e.response?.data?.error?.message || e.message
      toastError(`Error adding resource to space: ${msg}`)
    },
  })

  const { modalComp: CreateAppModal, setShowModal: setShowCreateAppModal } = useCreateWorkflowModal()
  const { modalComp: AddWorkflowModal, setShowModal: setShowAddWorkflowModal } = useAddResourceToModal({
    spaceId,
    resource: 'workflows',
    onSuccess: () => {
      toastSuccess('Successfully added workflow resource(s) to space')
      queryClient.invalidateQueries({
        queryKey: ['space', spaceId?.toString()],
      })
      queryClient.invalidateQueries({
        queryKey: ['workflows'],
      })
      setShowAddWorkflowModal(false)
    },
    mutation,
  })

  const actions: Action[] = [
    {
      name: 'Create Workflow',
      type: 'modal',
      func: ({ showModal = false } = {}) => setShowCreateAppModal(showModal),
      isDisabled: false,
    },
    {
      name: 'Add Workflow',
      type: 'modal',
      func: ({ showModal = false } = {}) => setShowAddWorkflowModal(showModal),
      isDisabled: false,
    },
  ]

  const modals = {
    'Create Workflow': CreateAppModal,
    'Add Workflow': AddWorkflowModal,
  }

  return { actions, modals }
}
