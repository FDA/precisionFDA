import { useMutation } from '@tanstack/react-query'
import React from 'react'
import { toast } from 'react-toastify'
import { styled } from 'styled-components'
import { Button } from '../../components/Button'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { Footer } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { unlockSpaceRequest } from './spaces.api'
import { ISpace } from './spaces.types'

const StyledBody = styled.div`
  padding: 20px;
`

export const useUnlockSpaceModal = ({
  space,
  onSuccess,
}: {
  space: ISpace
  onSuccess?: (isLocked: boolean) => void
}) => {
  const isLocked = space.links.unlock

  const { isShown, setShowModal } = useModal()
  const unlockSpaceMutation = useMutation({
    mutationKey: ['lock-unlock-space'],
    mutationFn: (payload: {
      id: string
      op: 'lock' | 'unlock'
      link?: string
    }) => unlockSpaceRequest(payload),
    onSuccess: () => {
      if(onSuccess) onSuccess(!!isLocked)
      setShowModal(false)
    },
    onError: (err) => {
      toast.error(`Failed to unlock space: ${err}`)
    },
  })
  const handleClose = () => {
    setShowModal(false)
  }

  const modalComp = (
    <ModalNext
      id="unlock-lock-space-modal"
      data-testid="modal-unlock-lock-space"
      headerText={`${isLocked ? 'Unlock' : 'Lock'} space`}
      isShown={isShown}
      hide={handleClose}
    >
      <ModalHeaderTop headerText={`${isLocked ? 'Unlock' : 'Lock'} space`} hide={handleClose} />
      <StyledBody>
        Are you sure you want to {isLocked ? 'unlock' : 'lock'} this space?
      </StyledBody>
      <Footer>
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
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
