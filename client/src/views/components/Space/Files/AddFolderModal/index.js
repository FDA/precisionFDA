import React from 'react'
import PropTypes from 'prop-types'
import { shallowEqual, useSelector, useDispatch } from 'react-redux'

import Button from '../../../Button'
import { spaceFilesAddFolderModalSelector, spaceFilesLinksSelector } from '../../../../../reducers/spaces/files/selectors'
import { hideFilesAddFolderModal, createFolder } from '../../../../../actions/spaces/files'
import FilesAddFolderModal from '../../../Files/AddFolderModal'


const Footer = ({ hideAction }) => (
  <>
    <Button onClick={hideAction}>Cancel</Button>
    <Button type="primary">Save Settings</Button>
  </>
)

const AddFolderModal = ({ loadFilesHandler, folderId }) => {
  const modal = useSelector(spaceFilesAddFolderModalSelector, shallowEqual)
  const links = useSelector(spaceFilesLinksSelector, shallowEqual)
  const dispatch = useDispatch()
  const hideAction = () => dispatch(hideFilesAddFolderModal())

  const addFolderAction = (folderName) => {
    if (folderName && folderName.length) {
      return dispatch(createFolder(links.create_folder, folderName, folderId)).then((statusIsOk) => {
        if (statusIsOk) loadFilesHandler()
      })
    }
  }

  return (
    <FilesAddFolderModal
      isOpen={modal.isOpen}
      isLoading={modal.isLoading}
      addFolderAction={addFolderAction}
      hideAction={hideAction}
    />
  )
}

export default AddFolderModal

AddFolderModal.propTypes = {
  loadFilesHandler: PropTypes.func,
  folderId: PropTypes.number,
}

Footer.propTypes = {
  hideAction: PropTypes.func,
}
