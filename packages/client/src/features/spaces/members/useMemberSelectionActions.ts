import { useAuthUser } from '../../auth/useAuthUser'
import { ActionFunctionsType } from '../../home/types'
import { useChangeMemberRoleModal } from './useChangeMemberRoleModal'
import { SpaceMembership } from './members.types'
import { ISpace } from '../spaces.types'

export type MemberActions = 'Edit Role' | 'Remove' | 'JSON Export'

export const useMemberSelectionActions = ({
  space,
  selectedItems,
}: {
  space: ISpace
  selectedItems: SpaceMembership[]
  resourceKeys: string[]
  resetSelected?: () => void
}) => {
  const selected = selectedItems.filter(x => x !== undefined)
  const user = useAuthUser()
  const isAdmin = user?.admin

  const currentUserMembership = space.current_user_membership
  const canManageMembers = isAdmin || 
    currentUserMembership?.role === 'admin' || 
    currentUserMembership?.role === 'lead'

  const {
    modalComp: changeMemberRoleModal,
    setShowModal: setChangeMemberRoleModal,
    isShown: isShownChangeMemberRoleModal,
  } = useChangeMemberRoleModal({
    spaceId: space.id,
    member: selected?.[0],
  })

  const actions: ActionFunctionsType<MemberActions> = {
    'Edit Role': {
      type: 'modal',
      func: () => setChangeMemberRoleModal(true),
      modal: changeMemberRoleModal,
      showModal: isShownChangeMemberRoleModal,
      isDisabled: selected.length !== 1 || !canManageMembers,
    },
    'JSON Export': {
      type: 'modal',
      func: () => {
        const exportData = selected.map(member => ({
          user_name: member.user_name,
          title: member.title,
          active: member.active,
          role: member.role,
          side: member.side,
          org: member.org,
          domain: member.domain,
          created_at: member.created_at,
        }))

        const jsonContent = JSON.stringify(exportData, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `space-${space.id}-members-export.json`
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      },
      isDisabled: selected.length === 0,
    },
  }

  return actions
}
