import React, { useEffect } from 'react'
import PropTypes from 'prop-types'

import HomeFileShape from '../../../../shapes/HomeFileShape'
import Modal from '../../../Modal'
import Button from '../../../Button'
import { HOME_FILES_ACTIONS, SPACE_FILES_ACTIONS } from '../../../../../constants'
import FilesList from './FilesList'


const switchTitle = (action) => {
  switch (action) {
    case HOME_FILES_ACTIONS.MAKE_PUBLIC_FOLDER:
      return 'Make Public'
    case HOME_FILES_ACTIONS.DELETE:
      return 'Delete'
    case HOME_FILES_ACTIONS.OPEN:
      return 'Open'
    case HOME_FILES_ACTIONS.DOWNLOAD:
      return 'Download'
    case SPACE_FILES_ACTIONS.PUBLISH:
      return 'Publish'
    case SPACE_FILES_ACTIONS.COPY_TO_PRIVATE:
      return 'Copy To Private'
    default:
      return 'Some Action'
  }
}

const SwitchFooter = ({ action, hideAction, modalAction }) => {
  switch (action) {
    case HOME_FILES_ACTIONS.MAKE_PUBLIC_FOLDER:
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
    case SPACE_FILES_ACTIONS.PUBLISH:
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type="success" onClick={modalAction}>Publish</Button>
        </>
      )
    case SPACE_FILES_ACTIONS.COPY_TO_PRIVATE:
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type="success" onClick={modalAction}>Copy</Button>
        </>
      )
    default:
      return (
        <Button onClick={hideAction}>Close</Button>
      )
  }
}

// This component logic - is for My page
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
  files: PropTypes.arrayOf(PropTypes.exact(HomeFileShape)),
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
