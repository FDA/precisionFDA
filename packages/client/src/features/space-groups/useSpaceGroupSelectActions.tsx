import { Action } from '../home/action-types'
import { extractModalsFromActions } from '../home/extractModalsFromActions'
import { useDeleteSpaceGroupModal } from './modals/useDeleteSpaceGroupModal'
import { useEditSpaceGroupModal } from './modals/useEditSpaceGroupModal'
import { ISpaceGroup } from './types'

export const useSpaceGroupSelectActions = ({
  spaceGroup,
}: {
  spaceGroup?: ISpaceGroup
}): { actions: Action[]; modals: Record<string, React.ReactNode | null> } => {
  if (!spaceGroup) {
    return { actions: [], modals: {} }
  }

  const {
    modalComp: editSpaceGroupModal,
    setShowModal: setEditSpaceGroupModal,
    isShown: isShownEditSpaceGroupModal,
  } = useEditSpaceGroupModal({ spaceGroup: spaceGroup! })
  const {
    modalComp: deleteSpaceGroupModal,
    setShowModal: setDeleteSpaceGroupModal,
    isShown: isShownDeleteSpaceGroupModal,
  } = useDeleteSpaceGroupModal({ spaceGroup: spaceGroup! })

  const spaceGroupActions: Action[] = [
    {
      name: 'Edit space group',
      func: () => {
        setEditSpaceGroupModal(true)
      },
      modal: editSpaceGroupModal,
      showModal: isShownEditSpaceGroupModal,
    },
    {
      name: 'Delete space group',
      func: () => {
        setDeleteSpaceGroupModal(true)
      },
      modal: deleteSpaceGroupModal,
      showModal: isShownDeleteSpaceGroupModal,
    },
  ]
  const modals = extractModalsFromActions(spaceGroupActions)
  return { actions: spaceGroupActions, modals }
}
