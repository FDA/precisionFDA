import React from 'react'
import PropTypes from 'prop-types'

import Modal from '../../Modal'
import Button from '../../Button'
import { SPACE_FILES_ACTIONS } from '../../../../constants'
import FilesList from './FilesList'
import HomeFileShape from '../../../shapes/HomeFileShape'


const switchTitle = (action) => {
  switch (action) {
    case SPACE_FILES_ACTIONS.PUBLISH:
      return 'Publish'
    case SPACE_FILES_ACTIONS.DOWNLOAD:
      return 'Download'
    case SPACE_FILES_ACTIONS.OPEN:
      return 'Open'
    case SPACE_FILES_ACTIONS.DELETE:
      return 'Delete'
    case SPACE_FILES_ACTIONS.COPY_TO_PRIVATE:
      return 'Copy To Private'
    default:
      return 'Some Action'
  }
}

const SwitchFooter = ({ action, hideAction, modalAction }) => {
  switch (action) {
    case SPACE_FILES_ACTIONS.PUBLISH:
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type="success" onClick={modalAction}>Publish</Button>
        </>
      )
    case SPACE_FILES_ACTIONS.DELETE:
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type="danger" onClick={modalAction}>Delete</Button>
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

// This component logic - is for Everybody, Featured page
const FilesActionModal = ({ modalAction, hideAction, action, files, isOpen, isLoading }) => {
  const title = switchTitle(action)
  return (
    <div className="objects-actions-modal">
      <Modal
        isOpen={isOpen}
        isLoading={isLoading}
        title={`${title} ${files.length} Item(s)`}
        modalFooterContent={<SwitchFooter action={action} hideAction={hideAction} modalAction={modalAction} />}
        hideModalHandler={hideAction}
        noPadding
      >
        <FilesList files={files} action={action} />
      </Modal>
    </div>
  )
}

export default FilesActionModal

FilesActionModal.propTypes = {
  modalAction: PropTypes.func,
  hideAction: PropTypes.func,
  action: PropTypes.string,
  files: PropTypes.arrayOf(PropTypes.exact(HomeFileShape)),
  isOpen: PropTypes.bool,
  isLoading: PropTypes.bool,
}

SwitchFooter.propTypes = {
  modalAction: PropTypes.func,
  hideAction: PropTypes.func,
  action: PropTypes.string,
}
