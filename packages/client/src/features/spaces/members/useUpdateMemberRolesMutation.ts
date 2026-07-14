import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import type { BackendError } from '@/api/types'
import { capitalize, pluralize } from '../../../utils/formatting'
import { useAuthUser } from '../../auth/useAuthUser'
import { changeMembershipRolesRequest, type MembershipRolesChangePayload } from './members.api'
import { MEMBER_ROLE, type MemberRole, type SpaceMembership, type UpdateRolesFormValues } from './members.types'

type ErrorResponse = { response?: { data?: { errors?: string } } }

const changeMembershipRoles = (spaceId: number, memberIds: number[], role: MemberRole | 'enable' | 'disable') => {
  const payload: MembershipRolesChangePayload = {
    membershipIds: memberIds,
  }
  if (['enable', 'disable'].includes(role)) {
    payload['enabled'] = role === 'enable'
  } else {
    payload['targetRole'] = MEMBER_ROLE[role.toUpperCase() as keyof typeof MEMBER_ROLE]
  }
  return changeMembershipRolesRequest(spaceId, payload)
}

export const useUpdateMemberRolesMutation = (spaceId: number, members: SpaceMembership[], onSuccess: () => void) => {
  const authUser = useAuthUser()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const memberIds = members.map(m => m.shared_membership_id ?? m.id)

  return useMutation({
    mutationFn: ({ role }: UpdateRolesFormValues) => changeMembershipRoles(spaceId, memberIds, role.value),
    onSuccess: (_, variables) => {
      const role = variables.role.value
      if (authUser && members.map(m => m.user_name).includes(authUser.dxuser) && role === 'disable') {
        navigate('/spaces')
        toast.success('Disabled yourself from the space')
      } else {
        queryClient.invalidateQueries({ queryKey: ['space-members'] })
        onSuccess()
        const msg = ['enable', 'disable'].includes(role)
          ? `${capitalize(role)}d ${pluralize('member', memberIds.length)} in the space`
          : `Changed member roles to ${role}`
        toast.success(msg)
      }
    },
    onError: (error: AxiosError<BackendError>) => {
      if (error.response?.data?.error?.message) {
        toast.error(`Change member roles failed. ${error.response?.data?.error?.message}`)
      } else {
        toast.error('Change member roles failed. Unknown error')
      }
    },
  })
}
