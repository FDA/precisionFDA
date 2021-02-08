import React from 'react'
import PropTypes from 'prop-types'

import HomeAssetShape from '../../../../shapes/HomeAssetShape'
import Modal from '../../../Modal'
import Button from '../../../Button'
import { HOME_FILES_ACTIONS } from '../../../../../constants'
import AssetsList from './AssetsList'


const switchTitle = (action) => {
  switch (action) {
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

const AssetsActionModal = ({ modalAction, hideAction, action, assets = [], isOpen, isLoading }) => {
  const title = switchTitle(action)
  
  return (
    <div className="objects-actions-modal">
      <Modal
        isOpen={isOpen}
        isLoading={isLoading}
        title={`${title} ${assets.length} Item(s)?`}
        modalFooterContent={<SwitchFooter action={action} hideAction={hideAction} modalAction={modalAction} />}
        hideModalHandler={hideAction}
        noPadding
      >
        <AssetsList assets={assets} action={action} />
      </Modal>
    </div>
  )
}

AssetsActionModal.propTypes = {
  assets: PropTypes.arrayOf(PropTypes.exact(HomeAssetShape)),
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

export default AssetsActionModal

export {
  AssetsActionModal,
}
