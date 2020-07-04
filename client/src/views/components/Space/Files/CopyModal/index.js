import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { shallowEqual, useSelector, useDispatch } from 'react-redux'

import FileShape from '../../../../shapes/FileShape'
import Button from '../../../Button'
import Modal from '../../../Modal'
import {
  spaceFilesCopyModalSelector,
  spaceFilesLinksSelector,
} from '../../../../../reducers/spaces/files/selectors'
import { spaceAccessibleSpacesSelector } from '../../../../../reducers/spaces/space/selectors'
import {
  hideFilesCopyModal,
  fetchFilesByAction,
  fetchAccessibleSpaces,
  copyToSpace,
} from '../../../../../actions/spaces'
import { SPACE_FILES_ACTIONS } from '../../../../../constants'
import FilesList from './FilesList'
import SpacesList from './SpacesList'
import './style.sass'


const getSelectedSpace = (spaces = []) => {
  const filtered = spaces.filter((space) => space.isSelected)
  return (filtered.length) ? filtered[0] : null
}

const SwitchFooter = ({ step, hideAction, copyAction, getSpacesAction, isCopyDisabled }) => {
  switch (step) {
    case 1:
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type="primary" onClick={getSpacesAction}>Select Space</Button>
        </>
      )
    case 2:
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type="primary" onClick={copyAction} disabled={isCopyDisabled}>Copy</Button>
        </>
      )
    default:
      return (
        <Button onClick={hideAction}>Close</Button>
      )
  }
}

const CopyModal = ({ files, loadFilesHandler }) => {
  const modal = useSelector(spaceFilesCopyModalSelector, shallowEqual)
  const spaces = useSelector(spaceAccessibleSpacesSelector)
  const filesLinks = useSelector(spaceFilesLinksSelector, shallowEqual)
  const ids = files.map((file) => file.id)
  const selectedSpace = getSelectedSpace(spaces)

  const dispatch = useDispatch()
  const hideAction = () => dispatch(hideFilesCopyModal())
  const getFilesAction = () => dispatch(fetchFilesByAction(ids, SPACE_FILES_ACTIONS.COPY))
  const getSpacesAction = () => dispatch(fetchAccessibleSpaces())

  const copyAction = () => {
    if (selectedSpace) {
      return dispatch(copyToSpace(filesLinks.copy, selectedSpace.scope, ids)).then((statusIsOk) => {
        if (statusIsOk) loadFilesHandler()
      })
    }
  }

  useEffect(() => {
    if (modal.isOpen) getFilesAction()
  }, [modal.isOpen, files])

  const title = (modal.step === 1) ? 'Files To Copy' : 'Select Space'

  return (
    <div className="objects-actions-modal">
      <Modal
        isOpen={modal.isOpen}
        isLoading={modal.isLoading}
        title={title}
        modalFooterContent={
          <SwitchFooter
            step={modal.step}
            hideAction={hideAction}
            getSpacesAction={getSpacesAction}
            copyAction={copyAction}
            isCopyDisabled={!selectedSpace}
          />}
        hideModalHandler={hideAction}
        noPadding
      >
        <div>
          {(modal.step === 1) && <FilesList files={modal.files} />}
          {(modal.step === 2) && <SpacesList spaces={spaces} />}
        </div>
      </Modal>
    </div>
  )
}

export default CopyModal

CopyModal.propTypes = {
  files: PropTypes.arrayOf(PropTypes.exact(FileShape)),
  loadFilesHandler: PropTypes.func,
}

SwitchFooter.propTypes = {
  step: PropTypes.number,
  hideAction: PropTypes.func,
  copyAction: PropTypes.func,
  getSpacesAction: PropTypes.func,
  isCopyDisabled: PropTypes.bool,
}
