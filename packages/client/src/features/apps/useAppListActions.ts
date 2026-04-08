import { ReactNode } from 'react'
import { AxiosError } from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addDataRequest } from '../spaces/spaces.api'
import { useAddResourceToModal } from '../actionModals/useAddResourceToSpace'
import { Action } from '../home/action-types'
import { extractModalsFromActions } from '../home/extractModalsFromActions'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'

export interface UseAppListActionsResult {
  actions: Action[]
  modals: Record<string, ReactNode>
}

export const useAppListActions = ({ spaceId }: { spaceId: string }): UseAppListActionsResult => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationKey: ['add-resource-to-space', 'apps'],
    mutationFn: addDataRequest,
    onError: (e: AxiosError<{ error?: { message?: string } }>) => {
      const msg = e.response?.data?.error?.message || e.message
      toastError(`Error adding resource to space: ${msg}`)
    },
  })

  const { modalComp: AddAppModal, setShowModal: setShowAddAppModal } = useAddResourceToModal({
    spaceId,
    resource: 'apps',
    onSuccess: () => {
      toastSuccess('Successfully added app resource(s) to space.', {})
      queryClient.invalidateQueries({
        queryKey: ['space', spaceId?.toString()],
      })
      queryClient.invalidateQueries({
        queryKey: ['apps'],
      })
      setShowAddAppModal(false)
    },
    mutation,
  })

  const actions: Action[] = [
    {
      name: 'Add App',
      type: 'modal',
      func: () => setShowAddAppModal(true),
      isDisabled: false,
      modal: AddAppModal,
    },
  ]

  const modals = extractModalsFromActions(actions)

  return { actions, modals }
}
