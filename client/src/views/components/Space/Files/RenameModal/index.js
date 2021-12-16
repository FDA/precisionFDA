import React from 'react'
import PropTypes from 'prop-types'
import { shallowEqual, useSelector, useDispatch } from 'react-redux'

import FileShape from '../../../../shapes/FileShape'
import { spaceFilesRenameModalSelector } from '../../../../../reducers/spaces/files/selectors'
import { hideFilesRenameModal, renameFile } from '../../../../../actions/spaces'
import RenameObjectModal from '../../../RenameObjectModal'


const RenameModal = ({ file, loadFilesHandler }) => {
  const modal = useSelector(spaceFilesRenameModalSelector, shallowEqual)

  const dispatch = useDispatch()
  const hideAction = () => dispatch(hideFilesRenameModal())

  const renameAction = (fileName) => {
    if (fileName && fileName.length) {
      return dispatch(renameFile(file.links.renamePath, fileName)).then((statusIsOk) => {
        if (statusIsOk) loadFilesHandler()
      })
    }
  }

  return (
    <RenameObjectModal
      renameAction={renameAction}
      hideAction={hideAction}
      isOpen={modal.isOpen}
      isLoading={modal.isLoading}
      defaultFileName={file.name}
    />
  )
}

export default RenameModal

RenameModal.propTypes = {
  file: PropTypes.exact(FileShape),
  loadFilesHandler: PropTypes.func,
}
