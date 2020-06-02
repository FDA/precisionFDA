import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { shallowEqual, useSelector, useDispatch } from 'react-redux'

import AppShape from '../../../../shapes/AppShape'
import Button from '../../../Button'
import Modal from '../../../Modal'
import {
  spaceAppsCopyModalSelector,
  spaceAppsLinksSelector,
} from '../../../../../reducers/spaces/apps/selectors'
import { spaceAccessibleSpacesSelector } from '../../../../../reducers/spaces/space/selectors'
import {
  hideAppsCopyModal,
  fetchAccessibleSpaces,
  copyToSpace,
} from '../../../../../actions/spaces'
import SpacesList from './SpacesList'
import './style.sass'


const getSelectedSpace = (spaces = []) => {
  const filtered = spaces.filter((space) => space.isSelected)
  return (filtered.length) ? filtered[0] : null
}

const Footer = ({ hideAction, copyAction, isCopyDisabled }) => (
  <>
    <Button onClick={hideAction}>Cancel</Button>
    <Button type="primary" onClick={copyAction} disabled={isCopyDisabled}>Copy</Button>
  </>
)

const CopyModal = ({ apps, loadAppsHandler }) => {
  const modal = useSelector(spaceAppsCopyModalSelector, shallowEqual)
  const spaces = useSelector(spaceAccessibleSpacesSelector)
  const appsLinks = useSelector(spaceAppsLinksSelector, shallowEqual)
  const ids = apps.map((app) => app.id)
  const selectedSpace = getSelectedSpace(spaces)

  const dispatch = useDispatch()
  const hideAction = () => dispatch(hideAppsCopyModal())
  const getSpacesAction = () => dispatch(fetchAccessibleSpaces())

  const copyAction = () => {
    if (selectedSpace) {
      return dispatch(copyToSpace(appsLinks.copy, selectedSpace.scope, ids)).then((statusIsOk) => {
        if (statusIsOk) loadAppsHandler()
      })
    }
  }

  useEffect(() => {
    if (modal.isOpen) getSpacesAction()
  }, [modal.isOpen, apps])

  return (
    <div className="objects-actions-modal">
      <Modal
        isOpen={modal.isOpen}
        isLoading={modal.isLoading}
        title="Select Space"
        modalFooterContent={
          <Footer
            hideAction={hideAction}
            copyAction={copyAction}
            isCopyDisabled={!selectedSpace}
          />}
        hideModalHandler={hideAction}
        noPadding
      >
        <div>
          <SpacesList spaces={spaces} />
        </div>
      </Modal>
    </div>
  )
}

export default CopyModal

CopyModal.propTypes = {
  loadAppsHandler: PropTypes.func,
  apps: PropTypes.arrayOf(PropTypes.exact(AppShape)),
}

Footer.propTypes = {
  step: PropTypes.number,
  hideAction: PropTypes.func,
  copyAction: PropTypes.func,
  getSpacesAction: PropTypes.func,
  isCopyDisabled: PropTypes.bool,
}
