import React from 'react'
import PropTypes from 'prop-types'

import Modal from '../../../Modal'
import Button from '../../../Button'


const getMessage = (actionType) => {
  switch (actionType) {
    case 'remove_from_comparators':
      return 'Are you sure you want remove this app from comparators?'
    case 'add_to_comparators':
      return 'Are you sure you want add this app to comparators?'
    case 'set_app':
      return 'Are you sure you want to set this app as comparison default?'
    default:
      return ''
  }
}

const SwitchFooter = ({ actionType, hideAction, modalAction }) => {
  switch (actionType) {
    case 'remove_from_comparators':
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type='danger' onClick={modalAction}>Remove from Comparators</Button>
        </>
      )
    case 'add_to_comparators':
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type='primary' onClick={modalAction}>Add to Comparators</Button>
        </>
      )
    case 'set_app':
      return (
        <>
          <Button onClick={hideAction}>No</Button>
          <Button type='primary' onClick={modalAction}>Yes</Button>
        </>
      )
    default:
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
        </>
      )
  }
}

const HomeAppsComparisonModal = ({ modalAction, hideAction, actionType, isOpen, isLoading, title='Attention!' }) => {
  return (
    <Modal
      isOpen={isOpen}
      isLoading={isLoading}
      title={title}
      modalFooterContent={<SwitchFooter actionType={actionType} hideAction={hideAction} modalAction={modalAction} />}
      hideModalHandler={hideAction}
    >
      {getMessage(actionType)}
    </Modal>
  )
}

HomeAppsComparisonModal.propTypes = {
  modalAction: PropTypes.func,
  hideAction: PropTypes.func,
  actionType: PropTypes.string,
  isOpen: PropTypes.bool,
  isLoading: PropTypes.bool,
  title: PropTypes.string,
}

SwitchFooter.propTypes = {
  modalAction: PropTypes.func,
  hideAction: PropTypes.func,
  actionType: PropTypes.string,
}

export default HomeAppsComparisonModal

export {
  HomeAppsComparisonModal,
}
