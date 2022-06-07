import React from 'react'
import PropTypes from 'prop-types'

import Modal from '../../../Modal'
import Button from '../../../Button'
import { HOME_DATABASES_ACTIONS } from '../../../../../constants'
import DatabasesList from './DatabasesList'


const switchTitle = (action) => {
  switch (action) {
    case HOME_DATABASES_ACTIONS.START:
      return 'Start'
    case HOME_DATABASES_ACTIONS.STOP:
      return 'Stop'
    case HOME_DATABASES_ACTIONS.TERMINATE:
      return 'Terminate'
    default:
      return 'Some Action'
  }
}

const SwitchFooter = ({ action, hideAction, modalAction }) => {
  switch (action) {
    case HOME_DATABASES_ACTIONS.START:
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type="success" onClick={modalAction}>Start</Button>
        </>
      )
    case HOME_DATABASES_ACTIONS.STOP:
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type="danger" onClick={modalAction}>Stop</Button>
        </>
      )
    case HOME_DATABASES_ACTIONS.TERMINATE:
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type="danger" onClick={modalAction}>Terminate</Button>
        </>
      )
    default:
      return (
        <Button onClick={hideAction}>Close</Button>
      )
  }
}

const DatabasesActionModal = ({ modalAction, hideAction, action, databases = [], isOpen, isLoading }) => {
  const title = switchTitle(action)

  return (
    <div className="objects-actions-modal">
      <Modal
        isOpen={isOpen}
        isLoading={isLoading}
        title={`${title} ${databases.length} Item(s)?`}
        modalFooterContent={<SwitchFooter action={action} hideAction={hideAction} modalAction={modalAction} />}
        hideModalHandler={hideAction}
        noPadding
      >
        <DatabasesList databases={databases} />
      </Modal>
    </div>
  )
}

DatabasesActionModal.propTypes = {
  databases: PropTypes.array,
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

export default DatabasesActionModal

export {
  DatabasesActionModal,
}
