import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Button from '../../Button'
import Modal from '../../Modal'
import LicenseList from './LicenseList'
import { AccessibleLicenseShape } from '../../../shapes/AccessibleObjectsShape'
import { fetchAccessibleLicense } from '../../../../actions/home/'
import { homeAccessibleLicenseSelector } from '../../../../reducers/home/page/selectors'


const Footer = ({ hideAction, attachAction, isCopyDisabled }) => (
  <>
    <Button onClick={hideAction}>Cancel</Button>
    <Button type="primary" onClick={attachAction} disabled={isCopyDisabled}>Attach</Button>
  </>
)

const AttachLicenseModal = (props) => {
  const { isOpen, hideAction, getAccessibleLicense, title, license, ids, attachAction, isLoading, link, objectLicense } = props
  useEffect(() => {
    if (isOpen) getAccessibleLicense()
  }, [isOpen])
  const selectedLicense = license.find((license) => license.isSelected)
  const selectedLicenseScope = selectedLicense ? selectedLicense.id : null

  const newstr = () => {
    const licenseId = /:id/gi
    const itemsToLicense = /:item_uid/gi
    const str = link ? link : ''
    let newstr = str.replace(licenseId, selectedLicense ? selectedLicense.id : '')
    newstr = newstr.replace(itemsToLicense, ids ? ids : '')
    return newstr
  }
  const attachLink = newstr()

  return (
    <div className="objects-actions-modal">
      <Modal
        isOpen={isOpen}
        isLoading={isLoading}
        title={title}
        modalFooterContent={
          <Footer
            hideAction={hideAction}
            attachAction={() => attachAction(attachLink, selectedLicenseScope, ids)}
            isCopyDisabled={!selectedLicenseScope}
          />}
        hideModalHandler={hideAction}
        noPadding
      >
        <div>
          <LicenseList licenses={license} objectLicense={objectLicense}/>
        </div>
      </Modal>
    </div>
  )
}

AttachLicenseModal.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.string),
  attachAction: PropTypes.func,
  getAccessibleLicense: PropTypes.func,
  title: PropTypes.string,
  isLoading: PropTypes.bool,
  license: PropTypes.arrayOf(PropTypes.shape(AccessibleLicenseShape)),
  isOpen: PropTypes.bool,
  hideAction: PropTypes.func,
  link: PropTypes.string,
  objectLicense: PropTypes.object,
}

AttachLicenseModal.defaultProps = {
  ids: [],
  attachAction: () => {},
  getAccessibleLicense: () => {},
  title: 'Select License',
  license: [],
  hideAction: () => {},
  objectLicense: {},
}

Footer.propTypes = {
  hideAction: PropTypes.func,
  attachAction: PropTypes.func,
  isCopyDisabled: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  license: homeAccessibleLicenseSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  getAccessibleLicense: () => dispatch(fetchAccessibleLicense()),
})

export default connect(mapStateToProps, mapDispatchToProps)(AttachLicenseModal)

export {
  AttachLicenseModal,
}
