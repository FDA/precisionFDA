import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { Invitation, provisionUsers } from '@/features/admin/users/api'
import { pluralize } from '@/utils/formatting'

interface UseProvisionMutationProps {
  invitations: Invitation[]
  selectedSpaces: Set<number>
  onSuccess?: () => void
}

export const useProvisionMutation = ({ invitations, selectedSpaces, onSuccess }: UseProvisionMutationProps) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationKey: ['bulk-provision'],
    mutationFn: () =>
      provisionUsers(
        invitations.map(({ id }) => id),
        Array.from(selectedSpaces),
      ),
    onSuccess: () => {
      const userCount = invitations.length
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] })
      toastSuccess(`Started provisioning ${userCount} ${pluralize('user', userCount)}`)
      navigate(`/account/admin/users/invitations/provisioning?invitations=${invitations.map(({ id }) => id).join(',')}`)
      onSuccess?.()
    },
    onError: () => toastError('Error provisioning users'),
  })
}
