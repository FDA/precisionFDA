import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { pluralize } from '../../utils/formatting'
import { Invitation, provisionUsers } from '../../features/admin/users/api'

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
      toast.success(`Started provisioning ${userCount} ${pluralize('user', userCount)}`)
      navigate(`/admin/invitations/provisioning?invitations=${invitations.map(({ id }) => id).join(',')}`)
      onSuccess?.()
    },
    onError: () => toast.error('Error provisioning users'),
  })
}
