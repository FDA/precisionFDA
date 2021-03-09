import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import HomeFileShape from '../../../../shapes/HomeFileShape'
import {
  homeFilesEverybodyListSelector,
  homeFilesAddFolderModalSelector,
 } from '../../../../../reducers/home/files/selectors'
import { homePageAdminStatusSelector } from '../../../../../reducers/home/page/selectors'
import {
  fetchFilesEverybody,
  resetFilesModals,
  resetFilesEverybodyFiltersValue,
  deleteObjects,
  copyToSpaceFiles,
  filesAttachTo,
  setFileEverybodyFilterValue,
  makeFeatured,
  renameFile,
  filesMove,
  attachLicenseFiles,
  filesLicenseAction,
  showFilesAddFolderModal,
  createFolder,
  hideFilesAddFolderModal,
} from '../../../../../actions/home'
import Icon from '../../../../components/Icon'
import Button from '../../../../components/Button'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeFilesEverybodyTable from '../../../../components/Home/Files/HomeFilesEverybodyTable'
import ActionsDropdown from '../../../../components/Home/Files/ActionsDropdown'
import { OBJECT_TYPES } from '../../../../../constants'
import { getFolderId } from '../../../../../helpers/home'
import FilesAddFolderModal from '../../../../components/Files/AddFolderModal'


const HomeFilesEverybodyPage = ({ files = [], fetchFilesEverybody, resetFilesModals, resetFilesEverybodyFiltersValue, isAdmin, location, deleteFiles, copyToSpace, filesAttachTo, makeFeatured, setFileEverybodyFilterValue, renameFile, filesMove, attachLicense, filesLicenseAction, showAddFolderModal, folderModal, createFolder, hideAddFolderModal }) => {  
  const folderId = getFolderId(location)
  useLayoutEffect(() => {
    resetFilesModals()
  }, [])

  const handleFilterValue = (value) => {
    setFileEverybodyFilterValue(value)
    fetchFilesEverybody(folderId)
  }

  useLayoutEffect(() => {
    resetFilesEverybodyFiltersValue()
    fetchFilesEverybody(folderId)
  }, [folderId])

  const checkedFiles = files.filter(file => file.isChecked)
  const createFolderLink = '/api/files/create_folder'
  const filderIdLink = folderId ? `?folder_id=${folderId}&public="true"` : '?public="true"'
  
  return (
    <HomeLayout>
      <div className='home-page-layout__header-row'>
        <div className="home-page-layout__actions">
          {isAdmin &&
            <> 
            <Button type="primary" onClick={showAddFolderModal}>
              <span>
                <Icon icon="fa-plus"/>&nbsp;
                Add Folder
              </span>
            </Button>
            <a href={`/api/create_file${filderIdLink}`}>
              <Button type="primary">
                <span>
                  <Icon icon="fa-plus" />&nbsp;
                  Add Files
                </span>
              </Button>
            </a>
          </>
          }
        </div>
        <div className='home-page-layout__actions--right'>
        <ActionsDropdown
          files={checkedFiles}
          copyToSpace={copyToSpace}
          filesAttachTo={filesAttachTo}
          deleteFiles={(link, ids) => deleteFiles(link, ids)}
          page='public'
          makeFeatured={makeFeatured}
          renameFile={renameFile}
          filesMove={filesMove}
          attachLicense={attachLicense}
          filesLicenseAction={filesLicenseAction}
        />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeFilesEverybodyTable files={files} handleFilterValue={handleFilterValue} />
      </div>
      {
        folderModal &&
          <FilesAddFolderModal
          isOpen={folderModal.isOpen}
          isLoading={folderModal.isLoading}
          addFolderAction={(folderName) => createFolder(createFolderLink, folderName, folderId, 'true')}
          hideAction={() => {hideAddFolderModal()}}
      />
      }
    </HomeLayout>
  )
}

HomeFilesEverybodyPage.propTypes = {
  files: PropTypes.arrayOf(PropTypes.exact(HomeFileShape)),
  fetchFilesEverybody: PropTypes.func,
  resetFilesModals: PropTypes.func,
  resetFilesEverybodyFiltersValue: PropTypes.func,
  isAdmin: PropTypes.bool,
  location: PropTypes.object,
  deleteFiles: PropTypes.func,
  copyToSpace: PropTypes.func,
  filesAttachTo: PropTypes.func,
  setFileEverybodyFilterValue: PropTypes.func,
  makeFeatured: PropTypes.func,
  renameFile: PropTypes.func,
  filesMove: PropTypes.func,
  attachLicense: PropTypes.func,
  filesLicenseAction: PropTypes.func,
  showAddFolderModal: PropTypes.func,
  folderModal: PropTypes.object,
  createFolder: PropTypes.func,
  hideAddFolderModal: PropTypes.func,
}

HomeFilesEverybodyPage.defaultProps = {
  showAddFolderModal: () => { },
  hideAddFolderModal: () => { },
}


const mapStateToProps = (state) => ({
  files: homeFilesEverybodyListSelector(state),
  isAdmin: homePageAdminStatusSelector(state),
  folderModal: homeFilesAddFolderModalSelector(state),
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchFilesEverybody: (folderId) => dispatch(fetchFilesEverybody(folderId)),
  resetFilesModals: () => dispatch(resetFilesModals()),
  resetFilesEverybodyFiltersValue: () => dispatch(resetFilesEverybodyFiltersValue()),
  deleteFiles: (link, ids, folderId) => dispatch(deleteObjects(link, OBJECT_TYPES.FILE, ids)).then(({ status }) => {
    if (status) dispatch(fetchFilesEverybody(folderId))
  }),
  copyToSpace: (scope, ids) => dispatch(copyToSpaceFiles(scope, ids)).then(({ status }) => {
    if (status) dispatch(fetchFilesEverybody())
  }),
  filesAttachTo: (items, noteUids) => dispatch(filesAttachTo(items, noteUids)),
  setFileEverybodyFilterValue: (value) => dispatch(setFileEverybodyFilterValue(value)),
  makeFeatured: (link, uids, featured) => dispatch(makeFeatured(link, OBJECT_TYPES.FILE, uids, featured)),
  renameFile: (link, name, description, type, folderId) => dispatch(renameFile(link, name, description, type, folderId)).then(({ statusIsOK }) => {
    const folderId = getFolderId(ownProps.location)
    if (statusIsOK) dispatch(fetchFilesEverybody(folderId))
  }),
  filesMove: (nodeIds, targetId, link) => dispatch(filesMove(nodeIds, targetId, link)).then(({ statusIsOK }) => {
    const folderId = getFolderId(ownProps.location)
    if (statusIsOK) dispatch(fetchFilesEverybody(folderId))
  }),
  attachLicense: (link, scope, ids, folderId) => dispatch(attachLicenseFiles(link, scope, ids)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchFilesEverybody(folderId))
  }),
  filesLicenseAction: (link) => dispatch(filesLicenseAction(link)).then(({ statusIsOK }) => {
    const folderId = getFolderId(ownProps.location)
    if (statusIsOK) dispatch(fetchFilesEverybody(folderId))
  }),
  showAddFolderModal: () => dispatch(showFilesAddFolderModal()),
  createFolder: (link, name, folderId, isPublic) => dispatch(createFolder(link, name, folderId, isPublic)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchFilesEverybody(folderId))
  }),
  hideAddFolderModal: () => dispatch(hideFilesAddFolderModal()),
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomeFilesEverybodyPage))

export {
  HomeFilesEverybodyPage,
}
