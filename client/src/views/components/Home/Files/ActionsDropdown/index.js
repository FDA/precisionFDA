import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeFileShape from '../../../../shapes/HomeFileShape'
import {
  makePublicFiles,
  showFilesCopyToSpaceModal,
  hideFilesCopyToSpaceModal,
  showFilesRenameModal,
  hideFilesRenameModal,
  showFilesAttachToModal,
  hideFilesAttachToModal,
  showFilesDeleteModal,
  hideFilesDeleteModal,
  showFilesMoveModal,
  hideFilesMoveModal,
  showFilesAttachLicenseModal,
  hideFilesAttachLicenseModal,
  showFilesMakePublicModal,
  hideFilesMakePublicModal,
  fetchFilesByAction,
  showFilesLicenseModal,
  hideFilesLicenseModal,
} from '../../../../../actions/home'
import {
  homeFilesRenameModalSelector,
  homeFilesCopyToSpaceModalSelector,
  homeFilesMakePublicModalSelector,
  homeFilesDeleteModalSelector,
  homeFilesAttachToModalSelector,
  homeFilesModalSelector,
  homeFilesAttachLicenseModalSelector,
  homeFilesActionModalSelector,
  homeFilesLicenseModalSelector,
} from '../../../../../reducers/home/files/selectors'
import {
  contextSelector,
} from '../../../../../reducers/context/selectors'
import { HOME_FILES_ACTIONS, OBJECT_TYPES } from '../../../../../constants'
import DropdownMenu from '../../../DropdownMenu'
import CopyToSpaceModal from '../../CopyToSpaceModal'
import RenameObjectModal from '../../../Files/RenameObjectModal'
import HomeAttachToModal from '../../HomeAttachToModal'
import HomeMoveModal from '../../../../../views/components/Home/HomeMoveModal'
import AttachLicenseModal from '../../AttachLicenseModal'
import FilesActionModal from '../FilesActionModal'
import HomeLicenseModal from '../../HomeLicenseModal'


const ACTIONS_TO_REMOVE = {
  private: ['Unfeature'],
  featured: [],
  details: ['Unfeature'],
  public: ['Make public'],
  spaces: ['Track', 'Edit File Info', 'Make public', 'Delete', 'Organize', 'Attach to...', 'Attach License', 'Detach License'],
}

const ActionsDropdown = (props) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const { files, page = 'private' } = props
  const filesIds = files.map(file => file.id)
  const filesUids = files.map(file => file.uid)
  const isFolder = files.every(e => e.type === 'Folder')
  const links = {}
  if (files[0] && files[0].links) {
    Object.assign(links, files[0].links)
  }

  const isAdmin = props.context.user ? props.context.user.admin : false
  const availableLicenses = props.context.user ? props.context.user.links.licenses : false
  const actions = [
    {
      text: 'Track',
      isDisabled: files.length !== 1 || !links.publish,
      link: links.track,
    },
    {
      text: 'Download',
      isDisabled: files.length === 0,
      onClick: () => setIsExportModalOpen(true),
    },
    {
      text: 'Authorize URL',
      isDisabled: files.length !== 1 || isFolder,
      link: links.link,
      method: 'post',
    },
    {
      text: isFolder ? 'Rename' : 'Edit File Info',
      isDisabled: files.length !== 1 || (isFolder ? !links.rename_folder : !links.rename),
      onClick: () => props.showFilesRenameModal(),
    },
    {
      text: 'Make public',
      isDisabled: files.length !== 1 || !links.publish,
      link: `${links.publish}&scope=public`,
      method: 'post',
    },
    {
      text: 'Feature',
      onClick: () => props.makeFeatured(files[0].links.feature, filesUids, true),
      isDisabled: files.length === 0 || !files.every(e => !e.featured || !e.links.feature),
      hide: !isAdmin || page !== 'public',
    },
    {
      text: 'Unfeature',
      onClick: () => props.makeFeatured(files[0].links.feature, filesUids, false),
      isDisabled: files.length === 0 || !files.every(e => e.featured || !e.links.feature),
      hide: !isAdmin || page !== 'public' && page !== 'featured',
    },
    {
      text: 'Delete',
      isDisabled: files.length === 0 || files.some((e) => !e.links.remove),
      onClick: () => props.showFilesDeleteModal(),
    },
    {
      text: 'Organize',
      isDisabled: files.length === 0 || files.some((e) => !e.links.organize),
      onClick: () => props.showFilesMoveModal(),
    },
    {
      text: 'Copy to space',
      isDisabled: files.length === 0,
      onClick: () => props.showCopyToSpaceModal(),
    },
    {
      text: 'Attach to...',
      isDisabled: !links.publish || files.length === 0 || !props.filesAttachTo || !files.every(e => e.links.publish),
      onClick: () => props.showFilesAttachToModal(),
    },
    {
      text: 'Attach License',
      isDisabled: files.length !== 1 || !links.license || !availableLicenses,
      onClick: () => props.showAttachLicenseModal(),
    },
    {
      text: 'Detach License',
      isDisabled: files.length !== 1,
      onClick: () => props.showFilesLicenseModal(),
      hide: files.length !== 1 || !links.detach_license,
    },
    {
      text: 'Edit tags',
      onClick: () => props.editTags(),
      hide: !props.editTags,
    },
  ]

  const availableActions = actions.filter(action => !ACTIONS_TO_REMOVE[page].includes(action.text))

  return (
    <>
      <DropdownMenu
        title='Actions'
        options={availableActions}
        message={page === 'spaces' ? 'To perform other actions on this files, access it from the Space' : ''} />
      <CopyToSpaceModal
        isLoading={props.copyToSpaceModal.isLoading}
        isOpen={props.copyToSpaceModal.isOpen}
        hideAction={() => props.hideCopyToSpaceModal()}
        ids={filesIds}
        copyAction={(scope, ids) => props.copyToSpace(scope, ids)}
      />
      {files.length === 1 &&
        <RenameObjectModal
          defaultFileName={files[0].name}
          defaultFileDescription={files[0].description ? files[0].description : ''}
          isOpen={props.renameModal.isOpen}
          isLoading={props.renameModal.isLoading}
          hideAction={() => props.hideFilesRenameModal()}
          renameAction={(name, description) => props.renameFile(
            files[0].type === 'Folder' ? files[0].links.rename_folder : `/api${files[0].links.show}`, name, description, files[0].type, files[0].id,
          )}
          isFolder={isFolder}
        />
      }
      <HomeAttachToModal
        isOpen={props.filesAttachToModal.isOpen}
        isLoading={props.filesAttachToModal.isLoading}
        hideAction={() => props.hideFilesAttachToModal()}
        ids={filesIds}
        attachAction={(items, noteUids) => props.filesAttachTo(items, noteUids)}
        itemsType={OBJECT_TYPES.FILE}
      />
      <HomeMoveModal
        isOpen={props.moveModal.isOpen}
        isLoading={props.moveModal.isLoading}
        currentFolderId={filesUids}
        hideAction={() => props.hideFilesMoveModal()}
        moveAction={(targetId) => props.filesMove(filesIds, targetId, links.organize)}
        scope={page}
      />
      <AttachLicenseModal
        isLoading={props.attachLicenseModal.isLoading}
        isOpen={props.attachLicenseModal.isOpen}
        hideAction={() => props.hideAttachLicenseModal()}
        ids={filesUids}
        attachAction={(link, scope, ids) => props.attachLicense(link, scope, ids)}
        link={links.license}
        objectLicense={files[0] && files[0].fileLicense}
      />
      <FilesActionModal
        isOpen={props.deleteModal.isOpen}
        isLoading={props.deleteModal.isLoading}
        hideAction={() => props.hideFilesDeleteModal()}
        modalAction={() => props.deleteFiles(files[0].links.remove, filesIds)}
        files={files}
        action={HOME_FILES_ACTIONS.DELETE}
        fetchFilesByAction={() => props.fetchFilesByAction(filesIds, HOME_FILES_ACTIONS.DELETE, 'private')}
        modal={props.homeFilesActionModalSelector}
      />
      <FilesActionModal
        isOpen={isExportModalOpen}
        isLoading={props.deleteModal.isLoading}
        hideAction={() => setIsExportModalOpen(false)}
        files={files}
        action={HOME_FILES_ACTIONS.DOWNLOAD}
        fetchFilesByAction={() => props.fetchFilesByAction(filesIds, HOME_FILES_ACTIONS.DOWNLOAD, 'private')}
        modal={props.homeFilesActionModalSelector}
      />
      <HomeLicenseModal
        isLoading={props.licenseModal.isLoading}
        isOpen={props.licenseModal.isOpen}
        hideAction={() => props.hideFilesLicenseModal()}
        link={links.detach_license}
        itemUid={files[0] && files[0].uid}
        fileLicense={files[0] && files[0].fileLicense}
        modalAction={(link) => props.filesLicenseAction(link)}
      />
    </>
  )
}

ActionsDropdown.propTypes = {
  files: PropTypes.arrayOf(PropTypes.exact(HomeFileShape)),
  makePublic: PropTypes.func,
  copyToSpace: PropTypes.func,
  renameFile: PropTypes.func,
  attachLicense: PropTypes.func,
  renameModal: PropTypes.object,
  copyToSpaceModal: PropTypes.object,
  makePublicModal: PropTypes.object,
  attachLicenseModal: PropTypes.object,
  hideFilesRenameModal: PropTypes.func,
  showFilesRenameModal: PropTypes.func,
  showCopyToSpaceModal: PropTypes.func,
  hideCopyToSpaceModal: PropTypes.func,
  showFilesMakePublicModal: PropTypes.func,
  hideFilesMakePublicModal: PropTypes.func,
  makeFeatured: PropTypes.func,
  context: PropTypes.object,
  page: PropTypes.string,
  showFilesDeleteModal: PropTypes.func,
  hideFilesDeleteModal: PropTypes.func,
  deleteFiles: PropTypes.func,
  deleteModal: PropTypes.object,
  showFilesAttachToModal: PropTypes.func,
  hideFilesAttachToModal: PropTypes.func,
  filesAttachToModal: PropTypes.object,
  filesAttachTo: PropTypes.func,
  showFilesMoveModal: PropTypes.func,
  hideFilesMoveModal: PropTypes.func,
  showAttachLicenseModal: PropTypes.func,
  hideAttachLicenseModal: PropTypes.func,
  moveModal: PropTypes.object,
  fetchFilesByAction: PropTypes.func,
  homeFilesActionModalSelector: PropTypes.object,
  filesMove: PropTypes.func,
  editTags: PropTypes.func,
  filesLicenseAction: PropTypes.func,
  licenseModal: PropTypes.object,
  showFilesLicenseModal: PropTypes.func,
  hideFilesLicenseModal: PropTypes.func,
}

ActionsDropdown.defaultProps = {
  files: [],
  context: {},
  page: 'private',
  copyToSpaceModal: {},
  makePublicModal: {},
  renameModal: {},
  deleteModal: {},
  filesAttachToModal: {},
  moveModal: {},
  attachLicenseModal: {},
  homeFilesActionModalSelector: {},
  licenseModal: {},
}

const mapStateToProps = (state) => ({
  renameModal: homeFilesRenameModalSelector(state),
  copyToSpaceModal: homeFilesCopyToSpaceModalSelector(state),
  makePublicModal: homeFilesMakePublicModalSelector(state),
  context: contextSelector(state),
  deleteModal: homeFilesDeleteModalSelector(state),
  filesAttachToModal: homeFilesAttachToModalSelector(state),
  moveModal: homeFilesModalSelector(state),
  attachLicenseModal: homeFilesAttachLicenseModalSelector(state),
  homeFilesActionModalSelector: homeFilesActionModalSelector(state),
  licenseModal: homeFilesLicenseModalSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  makePublic: (ids) => dispatch(makePublicFiles(ids)),
  showCopyToSpaceModal: () => dispatch(showFilesCopyToSpaceModal()),
  hideCopyToSpaceModal: () => dispatch(hideFilesCopyToSpaceModal()),
  showFilesRenameModal: () => dispatch(showFilesRenameModal()),
  hideFilesRenameModal: () => dispatch(hideFilesRenameModal()),
  showFilesMakePublicModal: () => dispatch(showFilesMakePublicModal()),
  hideFilesMakePublicModal: () => dispatch(hideFilesMakePublicModal()),
  showFilesDeleteModal: () => dispatch(showFilesDeleteModal()),
  hideFilesDeleteModal: () => dispatch(hideFilesDeleteModal()),
  showFilesAttachToModal: () => dispatch(showFilesAttachToModal()),
  hideFilesAttachToModal: () => dispatch(hideFilesAttachToModal()),
  showFilesMoveModal: () => dispatch(showFilesMoveModal()),
  hideFilesMoveModal: () => dispatch(hideFilesMoveModal()),
  showAttachLicenseModal: () => dispatch(showFilesAttachLicenseModal()),
  hideAttachLicenseModal: () => dispatch(hideFilesAttachLicenseModal()),
  fetchFilesByAction: (ids, action) => dispatch(fetchFilesByAction(ids, action, 'private')),
  showFilesLicenseModal: () => dispatch(showFilesLicenseModal()),
  hideFilesLicenseModal: () => dispatch(hideFilesLicenseModal()),
})

export default connect(mapStateToProps, mapDispatchToProps)(ActionsDropdown)

export {
  ActionsDropdown,
}
