import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { pluralize } from '../../utils/formatting'
import { Invitation, provisionUsers } from '../../features/admin/users/api'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'

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
      navigate(`/admin/invitations/provisioning?invitations=${invitations.map(({ id }) => id).join(',')}`)
      onSuccess?.()
    },
    onError: () => toastError('Error provisioning users'),
  })
}
