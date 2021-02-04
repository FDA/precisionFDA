import React, { useEffect } from 'react'
import PropTypes from 'prop-types'

import Modal from '../../../Modal'
import Button from '../../../Button'
import { HOME_FILES_ACTIONS } from '../../../../../constants'
import FilesList from './FilesList'


const switchTitle = (action) => {
  switch (action) {
    case HOME_FILES_ACTIONS.MAKE_PUBLIC:
      return 'Make Public'
    case HOME_FILES_ACTIONS.DELETE:
      return 'Delete'
    case HOME_FILES_ACTIONS.DOWNLOAD:
      return 'Download'
    default:
      return 'Some Action'
  }
}

const SwitchFooter = ({ action, hideAction, modalAction }) => {
  switch (action) {
    case HOME_FILES_ACTIONS.MAKE_PUBLIC:
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type="success" onClick={modalAction}>Publish</Button>
        </>
      )
    case HOME_FILES_ACTIONS.DELETE:
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type="danger" onClick={modalAction}>Delete</Button>
        </>
      )
    default:
      return (
        <Button onClick={hideAction}>Close</Button>
      )
  }
}

const FilesActionModal = ({ modalAction, hideAction, action, files = [], isOpen, isLoading, fetchFilesByAction, modal = {}}) => {
  const title = switchTitle(action)
  const getFilesAction = () => fetchFilesByAction()
  useEffect(() => {
    if (isOpen) getFilesAction()
  }, [isOpen, files])
  return (
    <div className="objects-actions-modal">
      <Modal
        isOpen={isOpen}
        isLoading={isLoading}
        title={`${title} ${modal.files && modal.files.length} Item(s)?`}
        modalFooterContent={<SwitchFooter action={action} hideAction={hideAction} modalAction={modalAction} />}
        hideModalHandler={hideAction}
        noPadding
      >
        <FilesList files={modal.files} action={action} />
      </Modal>
    </div>
  )
}

FilesActionModal.propTypes = {
  files: PropTypes.array,
  modalAction: PropTypes.func,
  hideAction: PropTypes.func,
  action: PropTypes.string,
  isOpen: PropTypes.bool,
  isLoading: PropTypes.bool,
  modal: PropTypes.object,
  fetchFilesByAction: PropTypes.func,
}

SwitchFooter.propTypes = {
  modalAction: PropTypes.func,
  hideAction: PropTypes.func,
  action: PropTypes.string,
}

export default FilesActionModal

export {
  FilesActionModal,
}
