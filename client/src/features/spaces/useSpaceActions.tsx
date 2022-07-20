import { useQueryClient } from 'react-query'
import { ActionFunctionsType } from '../home/types'
import { ISpace } from './spaces.types'
import { useUnlockSpaceModal } from './useUnlockSpaceModal'

export enum SpaceActions {
  'Lock/Unlock' = 'Lock/Unlock',
  'Edit Space' = 'Edit Space',
  'Duplicate Space' = 'Duplicate Space',
  'Delete' = 'Delete',
}

export const useSpaceActions = ({ space }: { space: ISpace }) => {
  const queryClient = useQueryClient()

  const modal = useUnlockSpaceModal({
    space,
    onSuccess: () => {
      queryClient.invalidateQueries(['space', `${space.id}`])
    },
  })

  const actions: ActionFunctionsType<SpaceActions> = {
    'Lock/Unlock': {
      func: () => {
        modal.setShowModal(true)
      },
      hide: !(space.links.lock || space.links.unlock),
      modal: modal.modalComp,
      showModal: modal.isShown,
    },
    'Edit Space': {
      func: () => {},
      isDisabled: false,
      hide: !space.links.update,
    },
    'Duplicate Space': {
      func: () => {},
      isDisabled: false,
      hide: !space.can_duplicate,
    },
    Delete: {
      func: () => {},
      isDisabled: false,
      hide: !!space.links.delete,
    },
  }

  return actions
}
