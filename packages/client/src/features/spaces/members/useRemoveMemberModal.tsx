import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { Button } from '../../../components/Button'
import { Callout } from '../../../components/Callout'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { useModal } from '../../modal/useModal'
import { changeMembershipRolesRequest } from './members.api'
import { StyledFooter } from './members.styles'
import { SpaceMembership } from './members.types'

export const useRemoveMemberModal = ({
  spaceId,
  members,
  onSuccess,
}: {
  spaceId: number
  members: SpaceMembership[]
  onSuccess?: () => void
}) => {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()

  const mutation = useMutation({
    mutationKey: ['remove-members'],
    mutationFn: async () => {
      const promises = members.map(member =>
        changeMembershipRolesRequest(spaceId, {
          membershipIds: [member.id],
          enabled: false,
        }),
      )
      return Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['space-members'],
      })
      setShowModal(false)
      toastSuccess(`Successfully removed ${members.length} member${members.length > 1 ? 's' : ''} from the space`)
      if (onSuccess) onSuccess()
    },
    onError: () => {
      toastError('Error: Failed to remove members. Please try again later.')
    },
  })

  const onRemove = () => {
    mutation.mutateAsync()
  }

  const modalComp = isShown ? (
    <ModalNext isShown={isShown} hide={() => setShowModal(false)} id="remove-member-modal">
      <ModalHeaderTop headerText="Remove Members" hide={() => setShowModal(false)} />
      <div>
        <Callout data-variant="warning">
          <p>Are you sure you want to remove {members.length > 1 ? 'these members' : 'this member'} from the space?</p>
          {members.length > 0 && (
            <ul>
              {members.map(member => (
                <li key={member.id}>{member.user_name}</li>
              ))}
            </ul>
          )}
          <p>This action cannot be undone.</p>
        </Callout>
        <StyledFooter>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={onRemove} data-variant="primary" disabled={mutation.isPending}>
            Remove
          </Button>
        </StyledFooter>
      </div>
    </ModalNext>
  ) : null

  return { modalComp, setShowModal, isShown }
}
