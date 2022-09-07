import React, { FunctionComponent, useState } from 'react'

import Modal from '../../Modal'
import Button from '../../Button'


interface IExternalLinkProps {
  to: string,
  className?: string,
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
      <a onClick={() => openModal()} className={className} aria-label={ariaLabel}>{children}</a>
      <Modal
        isOpen={isOpen}
        isLoading={false}
        title="Leaving precisionFDA"
        modalFooterContent={<>
          <Button onClick={closeModal}>Cancel</Button>
          <Button type="primary" onClick={openLink}>Continue</Button>
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
