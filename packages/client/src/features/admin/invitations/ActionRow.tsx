import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { pluralize } from '../../../utils/formatting'
import { provisionUsers } from '../admin.api'
import { Invitation } from './types'

const ButtonsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 16px 0;
  gap: 8px;
`

export default function InvitationActionRow({ selectedInvitations }: { selectedInvitations: Invitation[] }): JSX.Element {
  const selectedIds = selectedInvitations.map(({ id }) => id)
  const queryClient = useQueryClient()
  const provisionMutation = useMutation({
    mutationKey: ['bulk-provision'],
    mutationFn: () => provisionUsers(selectedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-invitations'],
      })
      toast.success(`Started provisioning ${selectedIds.length} ${pluralize('user', selectedIds.length)}`)
    },
    onError: () => {
      toast.error('Error provisioning users')
    },
  })

  const handleProvisioning = () => {
    provisionMutation.mutateAsync()
  }

  return (
    <ButtonsRow>
      <Button
        data-variant="primary"
        data-testid="admin-invitations-provision-button"
        disabled={selectedInvitations.some(o => o.provisioningState !== 'pending')}
        onClick={handleProvisioning}
      >
        Provision
      </Button>
    </ButtonsRow>
  )
}
