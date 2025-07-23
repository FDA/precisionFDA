import { RowSelectionState } from '@tanstack/react-table'
import React from 'react'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { Invitation } from '../admin.api'
import { useEditInvitationModal } from './modals/useEditInvitationModal'
import { useProvisioningModal } from './modals/useProvisioningModal'
import { useProvisionMutation } from '../../../api/mutations/invitations'

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
}): React.JSX.Element {
  const { setShowModal: showEditInvitationModal, modalComp: editInvitationModal } = useEditInvitationModal(selectedInvitations[0])
  const { setShowModal: showProvisioningModal, modalComp: provisioningModal } = useProvisioningModal(
    selectedInvitations,
    setSelectedIndexes,
  )

  const provisionMutation = useProvisionMutation({
    invitations: selectedInvitations,
    selectedSpaces: new Set(),
    onSuccess: () => setSelectedIndexes({}),
  })

  const handleProvisioning = () => {
    const allowPortalsSelection = selectedInvitations.some(invitation => {
      const emailDomain = invitation.email.split('@').pop()?.toLowerCase() ?? ''
      return ['fda.hhs.gov', 'fda.gov'].includes(emailDomain)
    })
    if (allowPortalsSelection) {
      showProvisioningModal(true)
    } else {
      provisionMutation.mutate()
    }
  }

  return (
    <>
      <ButtonsRow>
        <Button
          data-variant="primary"
          data-testid="admin-invitations-edit-invitation-button"
          disabled={selectedInvitations.length !== 1 || selectedInvitations[0].provisioningState !== 'pending'}
          onClick={() => showEditInvitationModal(true)}
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
      {editInvitationModal}
      {provisioningModal}
    </>
  )
}
