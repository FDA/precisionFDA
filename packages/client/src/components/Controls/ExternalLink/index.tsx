import React, { FunctionComponent, useState } from 'react'
import styled from 'styled-components'
import { ModalHeaderTop, ModalNext } from '../../../features/modal/ModalNext'
import { ButtonRow, Footer } from '../../../features/modal/styles'
import { Button } from '../../Button'

const StyledLink = styled.a`
  cursor: pointer;
`
const StyledBody = styled.div`
  margin: 12px;
`

interface IExternalLinkProps {
  to: string
  className?: string
  ariaLabel?: string
  children?: React.ReactNode
}

const ExternalLink: FunctionComponent<IExternalLinkProps> = ({
  to,
  className,
  children,
  ariaLabel,
}) => {
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
      <StyledLink
        onClick={() => openModal()}
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </StyledLink>

      <ModalNext
        id="external-link"
        data-test-id="external-link"
        isShown={isOpen}
        hide={closeModal}
      >
        <ModalHeaderTop
          disableClose={false}
          headerText="Leaving precisionFDA"
          hide={closeModal}
        />
        <StyledBody>
          <p>You are leaving the precisionFDA website. Continue going to?</p>
          <p><b>{to}</b></p>
        </StyledBody>
        <Footer>
          <ButtonRow>
            <Button onClick={closeModal}>Cancel</Button>
            <Button data-variant='primary' onClick={openLink}>Continue</Button>
          </ButtonRow>
        </Footer>
      </ModalNext>
    </>
  )
}

export default ExternalLink
