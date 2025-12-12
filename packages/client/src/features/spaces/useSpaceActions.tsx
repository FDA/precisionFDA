import { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router'
import { Action } from '../home/action-types'
import { extractModalsFromActions } from '../home/extractModalsFromActions'
import { ISpace } from './spaces.types'
import { useUnlockSpaceModal } from './useUnlockSpaceModal'
import { toastSuccess } from '../../components/NotificationCenter/ToastHelper'

export interface UseSpaceActionsResult {
  actions: Action[]
  modals: Record<string, ReactNode>
}

export const useSpaceActions = ({ space }: { space: ISpace }): UseSpaceActionsResult => {
  const queryClient = useQueryClient()
  const { search } = useLocation()

  const modal = useUnlockSpaceModal({
    space,
    onSuccess: isLocked => {
      toastSuccess(`Space ${isLocked ? 'unlocked' : 'locked'} successfully`)
      queryClient.invalidateQueries({
        queryKey: ['space', `${space.id}`],
      })
    },
  })

  const actions: Action[] = [
    {
      name: 'Lock/Unlock',
      type: 'modal',
      func: () => {
        modal.setShowModal(true)
      },
      shouldHide: !(space.links.lock || space.links.unlock),
      modal: modal.modalComp,
      showModal: modal.isShown,
    },
    {
      name: 'Edit Space',
      type: 'modal',
      func: () => {},
      isDisabled: false,
      shouldHide: !space.links.update,
    },
    {
      name: 'Delete',
      type: 'modal',
      func: () => {},
      isDisabled: false,
      shouldHide: !!space.links.delete,
    },
    {
      name: 'Fix Permissions',
      type: 'modal',
      func: () => {},
      isDisabled: false,
      shouldHide: !(space.type === 'groups' && search === '?permissionsDebug=true'),
    },
  ]

  const modals = extractModalsFromActions(actions)

  return { actions, modals }
}
