import React, { FunctionComponent, useState } from 'react'
import styled from 'styled-components'

import Modal from '../../Modal'
import { Button, ButtonSolidBlue } from '../../../../components/Button/index';

const StyledLink = styled.a`
  cursor: pointer;
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
        isOpen={isOpen}
        isLoading={false}
        title="Leaving precisionFDA"
        modalFooterContent={<>
          <Button onClick={closeModal}>Cancel</Button>
          <ButtonSolidBlue onClick={openLink}>Continue</ButtonSolidBlue>
        </>}
        hideModalHandler={closeModal}
      >
        <p>You are leaving the precisionFDA website.</p>
        <p>Continue with {to}?</p>
      </Modal>
    </>
  )
}

export default ExternalLink
