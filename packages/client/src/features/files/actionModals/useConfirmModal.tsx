import React from 'react'
import styled from 'styled-components'
import { useModal } from '../../modal/useModal'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer } from '../../modal/styles'
import { Button } from '../../../components/Button'

const StyledMessage = styled.div`
  padding: 1rem;
`

export const useConfirmModal = (title: string, message: React.ReactNode, onConfirm: () => void) => {
  const { isShown, setShowModal } = useModal()

  const handleClose = () => {
    setShowModal(false)
  }

  const modalComp = (
    <ModalNext
      id="modal-confirm"
      data-testid="modal-confirm"
      headerText={title}
      isShown={isShown}
      hide={handleClose}
      variant="medium"
    >
      <ModalHeaderTop headerText={title} hide={handleClose} />
      <StyledMessage>
        {message}
      </StyledMessage>
      <Footer>
        <ButtonRow>
          <Button type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" onClick={onConfirm}>
            Confirm
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
