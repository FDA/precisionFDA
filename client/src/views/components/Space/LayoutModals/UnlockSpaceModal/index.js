import React from 'react'
import PropTypes from 'prop-types'
import { shallowEqual, useSelector, useDispatch } from 'react-redux'

import Modal from '../../../Modal'
import Button from '../../../Button'
import { spaceLayoutUnlockModalSelector } from '../../../../../reducers/spaces/space/selectors'
import { hideLayoutUnlockModal, unlockSpace } from '../../../../../actions/spaces'


const Footer = ({ hideAction, unlockAction }) => (
  <>
    <Button onClick={hideAction}>Cancel</Button>
    <Button type="success" onClick={unlockAction}>Unlock Space</Button>
  </>
)

const UnlockSpaceModal = ({ unlockLink }) => {
  const modal = useSelector(spaceLayoutUnlockModalSelector, shallowEqual)
  const dispatch = useDispatch()
  const hideAction = () => dispatch(hideLayoutUnlockModal())
  const unlockAction = () => dispatch(unlockSpace(unlockLink))

  return (
    <Modal
      isOpen={modal.isOpen}
      isLoading={modal.isLoading}
      title="Unlock Space"
      modalFooterContent={<Footer hideAction={hideAction} unlockAction={unlockAction} />}
      hideModalHandler={hideAction}
    >
      Are you sure you want to unlock this space?
    </Modal>
  )
}

export default UnlockSpaceModal

UnlockSpaceModal.propTypes = {
  unlockLink: PropTypes.string,
}

Footer.propTypes = {
  hideAction: PropTypes.func,
  unlockAction: PropTypes.func,
}
