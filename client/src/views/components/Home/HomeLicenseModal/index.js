import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Button from '../../Button'
import Modal from '../../Modal'
import { fetchAccessibleLicense } from '../../../../actions/home/'
import { homeAccessibleLicenseSelector } from '../../../../reducers/home/page/selectors'


const SwitchFooter = ({ actionType, hideAction, modalAction, actionLink }) => {
  switch (actionType) {
    case 'detach':
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type='danger' onClick={() => modalAction(actionLink)}>Detach</Button>
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

const getMessage = (actionType, title) => {
  let message = ''

  switch (actionType) {
    case 'detach':
      message = 'Are you sure you want to detach the license '
      break
    default:
      break
  }

  return (
    <div>
      {message}
      <span style={{ fontStyle: 'italic' }}>{title}</span>?
    </div>
  )
}

const HomeLicenseModal = (props) => {
  const { isOpen, hideAction, title, modalAction, isLoading, link, actionType, fileLicense, itemUid } = props

  const getActionLink = () => {
    const id = /:id/gi
    const uid = /:item_uid/gi
    const str = link ? link : ''
    return str.replace(id, fileLicense.id).replace(uid, itemUid)
  }

  const actionLink = getActionLink()

  return (
    <div className="objects-actions-modal">
      <Modal
        isOpen={isOpen}
        isLoading={isLoading}
        title={title}
        modalFooterContent={
          <SwitchFooter
            actionType={actionType}
            hideAction={hideAction}
            modalAction={modalAction}
            actionLink={actionLink}
          />
        }
        hideModalHandler={hideAction}
      >
        <div>{getMessage(actionType, fileLicense.title)}</div>
      </Modal>
    </div>
  )
}

HomeLicenseModal.propTypes = {
  modalAction: PropTypes.func,
  title: PropTypes.string,
  isLoading: PropTypes.bool,
  isOpen: PropTypes.bool,
  hideAction: PropTypes.func,
  link: PropTypes.string,
  fileLicense: PropTypes.object,
  itemUid: PropTypes.string,
  actionType: PropTypes.string,
}

HomeLicenseModal.defaultProps = {
  attachAction: () => { },
  title: 'Detach License',
  hideAction: () => { },
  actionType: 'detach',
  fileLicense: {},
}

SwitchFooter.propTypes = {
  hideAction: PropTypes.func,
  isCopyDisabled: PropTypes.bool,
  actionLink: PropTypes.string,
  actionType: PropTypes.string,
  modalAction: PropTypes.func,
}

const mapStateToProps = (state) => ({
  license: homeAccessibleLicenseSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  getAccessibleLicense: () => dispatch(fetchAccessibleLicense()),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeLicenseModal)

export {
  HomeLicenseModal,
}
