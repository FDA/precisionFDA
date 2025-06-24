import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RowSelectionState } from '@tanstack/react-table'
import React from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { pluralize } from '../../../utils/formatting'
import { Invitation, provisionUsers } from '../admin.api'
import { useEditInvitationModal } from './modals/useEditInvitationModal'

const ButtonsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 16px 0;
  gap: 8px;
`

export default function InvitationActionRow({
  selectedInvitations,
  setSelectedIndexes,
}: {
  selectedInvitations: Invitation[]
  setSelectedIndexes: React.Dispatch<React.SetStateAction<RowSelectionState>>
}): JSX.Element {
  const selectedIds = selectedInvitations.map(({ id }) => id)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const provisionMutation = useMutation({
    mutationKey: ['bulk-provision'],
    mutationFn: () => provisionUsers(selectedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-invitations'],
      })
      toast.success(`Started provisioning ${selectedIds.length} ${pluralize('user', selectedIds.length)}`)
      navigate(`/admin/invitations/provisioning?invitations=${selectedIds.join(',')}`)
      setSelectedIndexes({})
    },
    onError: () => {
      toast.error('Error provisioning users')
    },
  })

  const { setShowModal, modalComp } = useEditInvitationModal(selectedInvitations[0])

  const handleProvisioning = () => {
    provisionMutation.mutateAsync()
  }

  const openEditInvitationModal = () => {
    setShowModal(true)
  }

  return (
    <>
      <ButtonsRow>
        <Button
          data-variant="primary"
          data-testid="admin-invitations-edit-invitation-button"
          disabled={selectedInvitations.length !== 1 || selectedInvitations[0].provisioningState !== 'pending'}
          onClick={openEditInvitationModal}
        >
          Edit invitation
        </Button>
        <Button
          data-variant="primary"
          data-testid="admin-invitations-provision-button"
          disabled={selectedInvitations.length === 0 || selectedInvitations.some(o => o.provisioningState !== 'pending')}
          onClick={handleProvisioning}
        >
          Provision
        </Button>
      </ButtonsRow>
      {modalComp}
    </>
  )
}
