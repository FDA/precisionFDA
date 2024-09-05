import React from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Modal } from '../modal'
import { ButtonRow } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { unlockSpaceRequest } from './spaces.api'
import { ISpace } from './spaces.types'
import { Button } from '../../components/Button'

export const useUnlockSpaceModal = ({
  space,
  onSuccess,
}: {
  space: ISpace
  onSuccess?: () => void
}) => {
  const { isShown, setShowModal } = useModal()
  const unlockSpaceMutation = useMutation({
    mutationKey: ['lock-unlock-space'],
    mutationFn: (payload: {
      id: string
      op: 'lock' | 'unlock'
      link?: string
    }) => unlockSpaceRequest(payload),
    onSuccess: () => {
      if(onSuccess) onSuccess()
      setShowModal(false)
    },
    onError: (err) => {
      toast.error(`Failed to unlock space: ${err}`)
    },
  })
  const handleClose = () => {
    setShowModal(false)
  }

  const isLocked = space.links.unlock
  const modalComp = (
    <Modal
      data-testid="modal-unlock-lock-space"
      headerText={`${isLocked ? 'Unlock' : 'Lock'} space`}
      isShown={isShown}
      hide={handleClose}
    >
      Are you sure you want to {isLocked ? 'unlock' : 'lock'} this space?
      <ButtonRow>
        <Button type="button" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          data-variant="primary"
          type="button"
          onClick={() =>
            unlockSpaceMutation.mutateAsync({
              id: space.id,
              op: isLocked ? 'lock' : 'unlock',
              link: space.links.lock ? space.links.lock : space.links.unlock,
            })
          }
        >
          {isLocked ? 'Unlock' : 'Lock'}
        </Button>
      </ButtonRow>
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
