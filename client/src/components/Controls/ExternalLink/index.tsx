import React, { FunctionComponent, useState } from 'react'
import styled from 'styled-components'
import { Button, ButtonSolidBlue } from '../../Button'
import { Modal } from '../../../features/modal'

const StyledLink = styled.a`
  cursor: pointer;
`
const StyledBody = styled.div`
  margin: 12px;
`

interface IExternalLinkProps {
  to: string,
  className?: string,
  ariaLabel?: string,
  children?: React.ReactNode,
}

const ExternalLink : FunctionComponent<IExternalLinkProps> = ({ to, className, children, ariaLabel }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => {
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const openLink = () => {
    closeModal()
    window.open(to, '_blank')
  }

  return (
    <>
      <StyledLink onClick={() => openModal()} className={className} aria-label={ariaLabel}>{children}</StyledLink>
      <Modal
        id='external-link'
        isShown={isOpen}
        headerText="Leaving precisionFDA"
        footer={<>
          <Button onClick={closeModal}>Cancel</Button>
          <ButtonSolidBlue onClick={openLink}>Continue</ButtonSolidBlue>
        </>}
        hide={closeModal}
      >
        <StyledBody>
          <p>You are leaving the precisionFDA website.</p>
          <p>Continue going to: {to}?</p>
        </StyledBody>
      </Modal>
    </>
  )
}

export default ExternalLink
