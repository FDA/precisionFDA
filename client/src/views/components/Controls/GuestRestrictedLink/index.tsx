import React, { FunctionComponent, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { contextUserSelector } from '../../../../reducers/context/selectors'
import Modal from '../../Modal'
import Button from '../../Button'


interface IGuestRestrictedLinkProps {
	to: string,
  children: React.ReactNode,
  className?: string,
}


const GuestRestrictedLink : FunctionComponent<IGuestRestrictedLinkProps> = ({ to, children, className }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => {
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const user = useSelector(contextUserSelector)
  const isLoggedIn = user && Object.keys(user).length > 0
  const userHasAccess = isLoggedIn && !user.is_guest

  return (
    <>
      {userHasAccess ? 
      <Link to={to} className={className}>{children}</Link>
      : 
      <a className={className} onClick={() => openModal()}>{children}</a>
      }
      <Modal
        isOpen={isOpen}
        isLoading={false}
        title="Account Being Reviewed"
        modalFooterContent={<Button onClick={closeModal}>Close</Button>}
        hideModalHandler={closeModal}
      >
        <p>You are currently browsing precisionFDA as a guest. To log in and complete this action, your user account must be provisioned. Your account is currently being reviewed by an FDA administrator for provisioning.</p>
        <p>If you do not receive full access within 14 days, please contact <a href="mailto:precisionfda@fda.hhs.gov">precisionfda@fda.hhs.gov</a> to request an upgraded account with end-level access.</p>
      </Modal>
    </>
  )
}

export default GuestRestrictedLink
