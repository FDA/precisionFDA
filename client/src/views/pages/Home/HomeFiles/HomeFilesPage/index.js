import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import HomeFileShape from '../../../../shapes/HomeFileShape'
import {
  homeFilesListSelector,
  homeFilesAddFolderModalSelector,
} from '../../../../../reducers/home/files/selectors'
import {
  fetchFiles,
  resetFilesModals,
  resetFilesFiltersValue,
  showFilesAddFolderModal,
  hideFilesAddFolderModal,
  createFolder,
  deleteObjects,
  copyToSpaceFiles,
  filesAttachTo,
  attachLicenseFiles,
  setFileFilterValue,
  renameFile,
  filesMove,
  makePublicFolder,
  filesLicenseAction,
} from '../../../../../actions/home'
import { showUploadModal } from '../../../../../features/space/fileUpload/actions'
import { OBJECT_TYPES } from '../../../../../constants'
import Icon from '../../../../components/Icon'
import Button from '../../../../components/Button'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeFilesTable from '../../../../components/Home/Files/HomeFilesTable'
import ActionsDropdown from '../../../../components/Home/Files/ActionsDropdown'
import { getFolderId } from '../../../../../helpers/home'
import FilesAddFolderModal from '../../../../components/Files/AddFolderModal'
import UploadModal from '../../../../../features/space/fileUpload/UploadModal'


const HomeFilesPage = ({ files = [], fetchFiles, resetFilesModals, resetFilesFiltersValue, location, showAddFolderModal, folderModal, createFolder, hideAddFolderModal, deleteFiles, copyToSpace, filesAttachTo, attachLicense, setFileFilterValue, renameFile, filesMove, filesLicenseAction, makePublicFolder, showUploadModal }) => {
  const folderId = getFolderId(location)
  useLayoutEffect(() => {
    resetFilesModals()
  }, [])

  const handleFilterValue = (value) => {
    setFileFilterValue(value)
    fetchFiles(folderId)
  }
  useLayoutEffect(() => {
    resetFilesFiltersValue()
    fetchFiles(folderId)
  }, [folderId])

  const checkedFiles = files.filter(file => file.isChecked)
  const createFolderLink = '/api/files/create_folder'

  return (
    <HomeLayout>
      <div className='home-page-layout__header-row'>
        <div className="home-page-layout__actions">
          <Button type="primary" onClick={showAddFolderModal}>
            <span>
              <Icon icon="fa-plus" />&nbsp;
              Add Folder
            </span>
          </Button>
          <Button type="primary" onClick={showUploadModal}>
            <span>
              <Icon icon="fa-plus" />&nbsp;
                Add Files
              </span>
          </Button>
        </div>
        <div className='home-page-layout__actions--right'>
          <ActionsDropdown
            files={checkedFiles}
            copyToSpace={copyToSpace}
            filesAttachTo={filesAttachTo}
            attachLicense={attachLicense}
            deleteFiles={(link, ids) => deleteFiles(link, ids)}
            renameFile={renameFile}
            filesMove={filesMove}
            filesLicenseAction={filesLicenseAction}
            makePublicFolder={makePublicFolder}
          />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeFilesTable files={files} handleFilterValue={handleFilterValue} />
      </div>
      {
        folderModal &&
        <FilesAddFolderModal
          isOpen={folderModal.isOpen}
          isLoading={folderModal.isLoading}
          addFolderAction={(folderName) => createFolder(createFolderLink, folderName, folderId)}
          hideAction={() => { hideAddFolderModal() }}
        />
      }
      <div className='home-page-layout__upload-files-modal' >
        <UploadModal
          scope='private'
          onClose={() => fetchFiles(folderId)}
          title='Upload files to Private Area'
        />
      </div>
    </HomeLayout>
  )
}

HomeFilesPage.propTypes = {
  files: PropTypes.arrayOf(PropTypes.exact(HomeFileShape)),
  fetchFiles: PropTypes.func,
  resetFilesModals: PropTypes.func,
  resetFilesFiltersValue: PropTypes.func,
  location: PropTypes.object,
  showAddFolderModal: PropTypes.func,
  hideAddFolderModal: PropTypes.func,
  showAddFilesModal: PropTypes.func,
  folderModal: PropTypes.object,
  createFolder: PropTypes.func,
  deleteFiles: PropTypes.func,
  copyToSpace: PropTypes.func,
  filesAttachTo: PropTypes.func,
  attachLicense: PropTypes.func,
  setFileFilterValue: PropTypes.func,
  renameFile: PropTypes.func,
  filesMove: PropTypes.func,
  filesLicenseAction: PropTypes.func,
  makePublicFolder: PropTypes.func,
  showUploadModal: PropTypes.func,
}

HomeFilesPage.defaultProps = {
  showAddFolderModal: () => { },
  showAddFilesModal: () => { },
  hideAddFolderModal: () => { },
}

const mapStateToProps = (state) => ({
  files: homeFilesListSelector(state),
  folderModal: homeFilesAddFolderModalSelector(state),
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchFiles: (folderId) => dispatch(fetchFiles(folderId)),
  resetFilesModals: () => dispatch(resetFilesModals()),
  resetFilesFiltersValue: () => dispatch(resetFilesFiltersValue()),
  setFileFilterValue: (value) => dispatch(setFileFilterValue(value)),
  showAddFolderModal: () => dispatch(showFilesAddFolderModal()),
  hideAddFolderModal: () => dispatch(hideFilesAddFolderModal()),
  createFolder: (link, name, folderId) => dispatch(createFolder(link, name, folderId)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchFiles(folderId))
  }),
  deleteFiles: (link, ids, folderId) => dispatch(deleteObjects(link, OBJECT_TYPES.FILE, ids)).then(({ status }) => {
    if (status) dispatch(fetchFiles(folderId))
  }),
  copyToSpace: (scope, ids, folderId) => dispatch(copyToSpaceFiles(scope, ids)).then(({ status }) => {
    if (status) dispatch(fetchFiles(folderId))
  }),
  filesAttachTo: (items, noteUids) => dispatch(filesAttachTo(items, noteUids)),
  attachLicense: (link, scope, ids, folderId) => dispatch(attachLicenseFiles(link, scope, ids)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchFiles(folderId))
  }),
  renameFile: (link, name, description, type, folder) => dispatch(renameFile(link, name, description, type, folder)).then(({ statusIsOK }) => {
    const folderId = getFolderId(ownProps.location)
    if (statusIsOK) dispatch(fetchFiles(folderId))
  }),
  filesMove: (nodeIds, targetId, link) => dispatch(filesMove(nodeIds, targetId, link)).then(({ statusIsOK }) => {
    const folderId = getFolderId(ownProps.location)
    if (statusIsOK) dispatch(fetchFiles(folderId))
  }),
  filesLicenseAction: (link) => dispatch(filesLicenseAction(link)).then(({ statusIsOK }) => {
    const folderId = getFolderId(ownProps.location)
    if (statusIsOK) dispatch(fetchFiles(folderId))
  }),
  makePublicFolder: (link, ids) => dispatch(makePublicFolder(link, ids)).then(({ statusIsOK }) => {
    const folderId = getFolderId(ownProps.location)
    if (statusIsOK) dispatch(fetchFiles(folderId))
  }),
  showUploadModal: () => dispatch(showUploadModal()),
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomeFilesPage))

export {
  HomeFilesPage,
}
