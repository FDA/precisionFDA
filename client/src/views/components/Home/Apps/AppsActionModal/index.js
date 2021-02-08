import React from 'react'
import PropTypes from 'prop-types'

import Modal from '../../../Modal'
import Button from '../../../Button'
import { HOME_APPS_ACTIONS } from '../../../../../constants'
import AppsList from './AppsList'


const switchTitle = (action) => {
  switch (action) {
    case HOME_APPS_ACTIONS.MAKE_PUBLIC:
      return 'Make Public'
    case HOME_APPS_ACTIONS.DELETE:
      return 'Delete'
    default:
      return 'Some Action'
  }
}

const SwitchFooter = ({ action, hideAction, modalAction }) => {
  switch (action) {
    case HOME_APPS_ACTIONS.MAKE_PUBLIC:
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type="success" onClick={modalAction}>Publish</Button>
        </>
      )
    case HOME_APPS_ACTIONS.DELETE:
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

const AppsActionModal = ({ modalAction, hideAction, action, apps = [], isOpen, isLoading }) => {
  const title = switchTitle(action)

  return (
    <div className="objects-actions-modal">
      <Modal
        isOpen={isOpen}
        isLoading={isLoading}
        title={`${title} ${apps.length} Item(s)?`}
        modalFooterContent={<SwitchFooter action={action} hideAction={hideAction} modalAction={modalAction} />}
        hideModalHandler={hideAction}
        noPadding
      >
        <AppsList apps={apps} />
      </Modal>
    </div>
  )
}

AppsActionModal.propTypes = {
  apps: PropTypes.array,
  modalAction: PropTypes.func,
  hideAction: PropTypes.func,
  action: PropTypes.string,
  isOpen: PropTypes.bool,
  isLoading: PropTypes.bool,
}

SwitchFooter.propTypes = {
  modalAction: PropTypes.func,
  hideAction: PropTypes.func,
  action: PropTypes.string,
}

export default AppsActionModal

export {
  AppsActionModal,
}
