import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type React from 'react'
import type { BackendError } from '@/api/types'
import { Checkbox } from '@/components/Checkbox'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { useConfirm } from '@/features/modal/useConfirm'
import { createAdminMembership, deleteAdminMembership } from './api'
import { ADMIN_GROUP_ROLES, type AdminRole, type UserWithAdminRoles } from './types'

interface AdminRoleBadgeProps {
  user: UserWithAdminRoles
  role: AdminRole
  isRootAdmin: boolean
}

export function AdminRoleBadge({ user, role, isRootAdmin }: AdminRoleBadgeProps) {
  const queryClient = useQueryClient()
  const membershipId = user.adminMembershipIds[role]
  const hasRole = membershipId !== null
  const isProtected = isRootAdmin && role === ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN
  const isSiteAdminRole = role === ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN

  const createMutation = useMutation({
    mutationFn: () => createAdminMembership(user.id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-memberships'] })
      toastSuccess('Role assigned successfully')
    },
    onError: (error: AxiosError<BackendError>) => {
      toastError(error.response?.data?.error?.message ?? 'Failed to assign role')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdminMembership(membershipId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-memberships'] })
      toastSuccess('Role removed successfully')
    },
    onError: (error: AxiosError<BackendError>) => {
      toastError(error.response?.data?.error?.message ?? 'Failed to remove role')
    },
  })

  const isPending = createMutation.isPending || deleteMutation.isPending
  const { open: openSiteAdminConfirmation, Confirm: SiteAdminConfirm } = useConfirm({
    onOk: createMutation.mutate,
    headerText: 'Grant Site Admin role',
    body: <p>This user will be added to all admin spaces.</p>,
    okText: 'Grant role',
    dataVariant: 'primary',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      if (isSiteAdminRole) {
        openSiteAdminConfirmation()
        return
      }
      createMutation.mutate()
    } else {
      deleteMutation.mutate()
    }
  }

  return (
    <>
      <Checkbox
        checked={hasRole}
        disabled={isPending || isProtected}
        onChange={handleChange}
        title={isProtected ? 'Cannot remove site admin from root admin user' : undefined}
      />
      <SiteAdminConfirm />
    </>
  )
}
