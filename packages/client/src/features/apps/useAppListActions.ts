import { AxiosError } from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { addDataRequest } from '../spaces/spaces.api'
import { useAddResourceToModal } from '../actionModals/useAddResourceToSpace'
import { ActionFunctionsType } from '../home/types'

export enum AppListActions {
  'Add App' = 'Add App',
}

export const useAppListActions = ({
  spaceId,
  resourceKeys,
}: {
  spaceId: string,
  resourceKeys: string[],
}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationKey: ['add-resource-to-space', 'apps'],
    mutationFn: addDataRequest,
    onError: (e: AxiosError) => {
      toast.error(`Error adding resource to space. ${e.message}`)
    },
  })

  const { modalComp: AddAppModal, setShowModal: setShowAddAppModal } = useAddResourceToModal({
    spaceId,
    resource: 'apps',
    onSuccess: () => {
      toast.success('Successfully added app resource(s) to space.')
      queryClient.invalidateQueries({
        queryKey: ['space', spaceId.toString()]
      })
      queryClient.invalidateQueries({
        queryKey: ['apps'],
      })
      setShowAddAppModal(false)
    },
    mutation,
  })

  const actions: ActionFunctionsType<AppListActions> = {
    'Add App': {
      type: 'modal',
      func: ({ showModal = false } = {}) => setShowAddAppModal(showModal),
      isDisabled: false,
      modal: AddAppModal,
    },
  }

  return actions
}
