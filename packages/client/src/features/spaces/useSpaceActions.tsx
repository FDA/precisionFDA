import { useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { ActionFunctionsType } from '../home/types'
import { ISpace } from './spaces.types'
import { useUnlockSpaceModal } from './useUnlockSpaceModal'

export enum SpaceActions {
  'Lock/Unlock' = 'Lock/Unlock',
  'Edit Space' = 'Edit Space',
  'Delete' = 'Delete',
  'Fix Permissions' = 'Fix Permissions'
}

export const useSpaceActions = ({ space }: { space: ISpace }) => {
  const queryClient = useQueryClient()
  const { search } = useLocation()

  const modal = useUnlockSpaceModal({
    space,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['space', `${space.id}`],
      })
    },
  })

  const actions: ActionFunctionsType<SpaceActions> = {
    'Lock/Unlock': {
      type: 'modal',
      func: () => {
        modal.setShowModal(true)
      },
      shouldHide: !(space.links.lock || space.links.unlock),
      modal: modal.modalComp,
      showModal: modal.isShown,
    },
    'Edit Space': {
      type: 'modal',
      func: () => {},
      isDisabled: false,
      shouldHide: !space.links.update,
    },
    Delete: {
      type: 'modal',
      func: () => {},
      isDisabled: false,
      shouldHide: !!space.links.delete,
    },
    'Fix Permissions': {
      type: 'modal',
      func: () => {},
      isDisabled: false,
      shouldHide: !(space.type === 'groups' && search === '?permissionsDebug=true'),
    },
  }

  return actions
}
