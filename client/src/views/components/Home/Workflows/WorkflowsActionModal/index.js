import React from 'react'
import PropTypes from 'prop-types'

import Modal from '../../../Modal'
import Button from '../../../Button'
import { HOME_WORKFLOWS_ACTIONS } from '../../../../../constants'
import WorkflowsList from './WorkflowsList'


const switchTitle = (action) => {
  switch (action) {
    case HOME_WORKFLOWS_ACTIONS.MAKE_PUBLIC:
      return 'Make Public'
    case HOME_WORKFLOWS_ACTIONS.DELETE:
      return 'Delete'
    default:
      return 'Some Action'
  }
}

const SwitchFooter = ({ action, hideAction, modalAction }) => {
  switch (action) {
    case HOME_WORKFLOWS_ACTIONS.DELETE:
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type="danger" onClick={modalAction}>Delete</Button>
        </>
      )
    case HOME_WORKFLOWS_ACTIONS.MAKE_PUBLIC:
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type="success" onClick={modalAction}>Publish</Button>
        </>
      )
    default:
      return (
        <Button onClick={hideAction}>Close</Button>
      )
  }
}

const WorkflowsActionModal = ({ modalAction, hideAction, action, workflows = [], isOpen, isLoading }) => {
  const title = switchTitle(action)

  return (
    <div className="objects-actions-modal">
      <Modal
        isOpen={isOpen}
        isLoading={isLoading}
        title={`${title} ${workflows.length} Item(s)?`}
        modalFooterContent={<SwitchFooter action={action} hideAction={hideAction} modalAction={modalAction} />}
        hideModalHandler={hideAction}
        noPadding
      >
        <WorkflowsList workflows={workflows} />
      </Modal>
    </div>
  )
}

WorkflowsActionModal.propTypes = {
  workflows: PropTypes.array,
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

export default WorkflowsActionModal

export {
  WorkflowsActionModal,
}
