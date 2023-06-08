import React, { FunctionComponent, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Button } from '../../../../components/Button'
import { PFDA_EMAIL } from '../../../../constants'
import { useAuthUser } from '../../../../features/auth/useAuthUser'
import { Modal } from '../../../../features/modal'

const StyledBody = styled.div`
  margin: 12px;
`

interface IGuestRestrictedLinkProps {
	to: string,
  children: React.ReactNode,
  className?: string,
}


const GuestRestrictedLink : FunctionComponent<IGuestRestrictedLinkProps> = ({ to, children, className, ariaLabel }) => {
  const user = useAuthUser()
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => {
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const isLoggedIn = user && Object.keys(user).length > 0
  const userHasAccess = isLoggedIn && !user.is_guest

  return (
    <>
      {userHasAccess ? 
      <Link data-turbolinks="false" to={to} className={className} aria-label={ariaLabel}>{children}</Link>
      : 
      <a data-turbolinks="false" className={className} onClick={() => openModal()} aria-label={ariaLabel}>{children}</a>
      }
      <Modal
        id="guest-restricted"
        isShown={isOpen}
        headerText="Account Being Reviewed"
        footer={<Button onClick={closeModal}>Close</Button>}
        hide={closeModal}
      >
        <StyledBody>
          <p>You are currently browsing precisionFDA as a guest. To log in and complete this action, your user account must be provisioned. Your account is currently being reviewed by an FDA administrator for provisioning.</p>
          <p>If you do not receive full access within 14 days, please contact <a href={`mailto:${PFDA_EMAIL}`}>{PFDA_EMAIL}</a> to request an upgraded account with end-level access.</p>
        </StyledBody>
      </Modal>
    </>
  )
}

export default GuestRestrictedLink
