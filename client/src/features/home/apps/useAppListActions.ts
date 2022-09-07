import { AxiosError } from 'axios'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { addDataRequest } from '../../spaces/spaces.api'
import { useAddResourceToModal } from '../actionModals/useAddResourceToSpace'
import { ActionFunctionsType, ResourceScope } from '../types'

export enum AppListActions {
  'Add App' = 'Add App',
}

export const useAppListActions = ({
  scope,
  spaceId,
  resourceKeys,
}: {
  scope?: ResourceScope,
  spaceId: string,
  resourceKeys: string[],
}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
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
      queryClient.invalidateQueries(['apps'])
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
