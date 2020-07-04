import React from 'react'
import PropTypes from 'prop-types'
import { shallowEqual, useSelector, useDispatch } from 'react-redux'

import Modal from '../../../Modal'
import Button from '../../../Button'
import { spaceLayoutDeleteModalSelector } from '../../../../../reducers/spaces/space/selectors'
import { hideLayoutDeleteModal, deleteSpace } from '../../../../../actions/spaces'


const Footer = ({ hideAction, deleteAction }) => (
  <>
    <Button onClick={hideAction}>Cancel</Button>
    <Button type="danger" onClick={deleteAction}>Delete Space</Button>
  </>
)

const DeleteSpaceModal = ({ deleteLink }) => {
  const modal = useSelector(spaceLayoutDeleteModalSelector, shallowEqual)
  const dispatch = useDispatch()
  const hideAction = () => dispatch(hideLayoutDeleteModal())
  const deleteAction = () => dispatch(deleteSpace(deleteLink))

  return (
    <Modal
      isOpen={modal.isOpen}
      isLoading={modal.isLoading}
      title="Delete Space"
      modalFooterContent={<Footer hideAction={hideAction} deleteAction={deleteAction} />}
      hideModalHandler={hideAction}
    >
      Are you sure you want to delete this space?
    </Modal>
  )
}

export default DeleteSpaceModal

DeleteSpaceModal.propTypes = {
  deleteLink: PropTypes.string,
}

Footer.propTypes = {
  hideAction: PropTypes.func,
  deleteAction: PropTypes.func,
}
