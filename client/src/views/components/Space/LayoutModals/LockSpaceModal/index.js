import React from 'react'
import PropTypes from 'prop-types'
import { shallowEqual, useSelector, useDispatch } from 'react-redux'

import Modal from '../../../Modal'
import Button from '../../../Button'
import { spaceLayoutLockModalSelector } from '../../../../../reducers/spaces/space/selectors'
import { hideLayoutLockModal, lockSpace } from '../../../../../actions/spaces'


const Footer = ({ hideAction, lockAction }) => (
  <>
    <Button onClick={hideAction}>Cancel</Button>
    <Button type="warning" onClick={lockAction}>Lock Space</Button>
  </>
)

const LockSpaceModal = ({ lockLink }) => {
  const modal = useSelector(spaceLayoutLockModalSelector, shallowEqual)
  const dispatch = useDispatch()
  const hideAction = () => dispatch(hideLayoutLockModal())
  const lockAction = () => dispatch(lockSpace(lockLink))

  return (
    <Modal
      isOpen={modal.isOpen}
      isLoading={modal.isLoading}
      title="Lock Space"
      modalFooterContent={<Footer hideAction={hideAction} lockAction={lockAction} />}
      hideModalHandler={hideAction}
    >
      Are you sure you want to lock this space?
    </Modal>
  )
}

export default LockSpaceModal

LockSpaceModal.propTypes = {
  lockLink: PropTypes.string,
}

Footer.propTypes = {
  hideAction: PropTypes.func,
  lockAction: PropTypes.func,
}
