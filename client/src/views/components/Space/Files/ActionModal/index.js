import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { shallowEqual, useSelector, useDispatch } from 'react-redux'

import FileShape from '../../../../shapes/FileShape'
import {
  spaceFilesActionModalSelector,
  spaceFilesLinksSelector,
} from '../../../../../reducers/spaces/files/selectors'
import {
  hideFilesActionModal,
  fetchFilesByAction,
  deleteFiles,
  publishFiles,
} from '../../../../../actions/spaces'
import FilesActionModal from '../../../Files/FilesActionModal'
import { SPACE_FILES_ACTIONS } from '../../../../../constants'


const ActionModal = ({ files, loadFilesHandler }) => {
  const modal = useSelector(spaceFilesActionModalSelector, shallowEqual)
  const links = useSelector(spaceFilesLinksSelector, shallowEqual)
  const ids = files.map((file) => file.id)

  const dispatch = useDispatch()
  const hideAction = () => dispatch(hideFilesActionModal())
  const getFilesAction = () => dispatch(fetchFilesByAction(ids, modal.action, 'private'))

  const modalAction = () => {
    switch (modal.action) {
      case SPACE_FILES_ACTIONS.DELETE:
        return dispatch(deleteFiles(links.remove, modal.files)).then((statusIsOK) => {
          if (statusIsOK) loadFilesHandler()
        })
      case SPACE_FILES_ACTIONS.PUBLISH:
        return dispatch(publishFiles(links.publish, modal.files)).then((statusIsOK) => {
          if (statusIsOK) loadFilesHandler()
        })
      default:
        return false
    }
  }

  useEffect(() => {
    if (modal.isOpen) getFilesAction()
  }, [modal.isOpen, files])

  return (
    <FilesActionModal
      modalAction={modalAction}
      hideAction={hideAction}
      action={modal.action}
      files={modal.files}
      isOpen={modal.isOpen}
      isLoading={modal.isLoading}
    />
  )
}

export default ActionModal

ActionModal.propTypes = {
  files: PropTypes.arrayOf(PropTypes.exact(FileShape)),
  loadFilesHandler: PropTypes.func,
}
