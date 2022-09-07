import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeFileShape from '../../../../shapes/HomeFileShape'
import {
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
  showFilesMakePublicFolderModal,
  hideFilesMakePublicFolderModal,
  fetchFilesByAction,
  showFilesLicenseModal,
  hideFilesLicenseModal,
  showFilesAcceptLicenseModal,
  hideFilesAcceptLicenseModal,
} from '../../../../../actions/home'
import {
  homeFilesRenameModalSelector,
  homeFilesCopyToSpaceModalSelector,
  homeFilesMakePublicFolderModalSelector,
  homeFilesDeleteModalSelector,
  homeFilesAttachToModalSelector,
  homeFilesModalSelector,
  homeFilesAttachLicenseModalSelector,
  homeFilesActionModalSelector,
  homeFilesLicenseModalSelector,
  homeFilesAcceptLicenseModalSelector,
} from '../../../../../reducers/home/files/selectors'
import {
  contextSelector,
} from '../../../../../reducers/context/selectors'
import { HOME_FILES_ACTIONS, OBJECT_TYPES } from '../../../../../constants'
import { DropdownMenu } from '../../../DropdownMenu'
import CopyToSpaceModal from '../../CopyToSpaceModal'
import RenameObjectModal from '../../../RenameObjectModal'
import HomeAttachToModal from '../../HomeAttachToModal'
import HomeMoveModal from '../../../../../views/components/Home/HomeMoveModal'
import AttachLicenseModal from '../../AttachLicenseModal'
import MyFilesActionModal from '../FilesActionModal'
import FilesActionModal from '../../../../../views/components/Files/FilesActionModal'
import HomeLicenseModal from '../../HomeLicenseModal'


const ACTIONS_TO_REMOVE = {
  private: ['Unfeature'],
  featured: [],
  details: ['Unfeature'],
  public: ['Make public'],
  spaces: ['Track', 'Edit File Info', 'Make public', 'Delete', 'Organize', 'Attach to...', 'Attach License', 'Detach License'],
}

const ActionsDropdown = (props) => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [isFileOpenModalOpen, setIsFileOpenModalOpen] = useState(false)

  const { files, page = 'private', scope } = props
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
      isDisabled: files.length !== 1 || !links.track,
      link: links.track,
    },
    {
      text: 'Open',
      isDisabled: files.length === 0 ||
                  files.some(e => e.type === 'Folder' || e.type === 'UserFile' && !e.links.download),
      onClick: () => setIsFileOpenModalOpen(true),
    },
    {
      text: 'Download',
      isDisabled: files.length === 0 ||
                  files.some(e => e.type === 'Folder' || e.type === 'UserFile' && !e.links.download),
      onClick: () => setIsDownloadModalOpen(true),
    },
    {
      text: isFolder ? 'Rename' : 'Edit File Info',
      isDisabled: files.length !== 1 || isFolder && !links.rename_folder,
      onClick: () => props.showFilesRenameModal(),
    },
    {
      text: 'Make public',
      isDisabled: files.length !== 1 || !links.publish,
      link: `${links.publish}&public=true`,
      method: 'post',
      hide: isFolder,
    },
    {
      text: 'Make public',
      isDisabled: !isAdmin || files.length !== 1 || !links.publish,
      onClick: () => props.showFilesMakePublicFolderModal(),
      hide: !isFolder,
    },
    {
      text: 'Feature',
      onClick: () => props.makeFeatured(files[0].links.feature, filesIds.concat(filesUids), true),
      isDisabled: files.length === 0 || !files.every(e => !e.featured || !e.links.feature),
      hide: !isAdmin || page !== 'public',
    },
    {
      text: 'Unfeature',
      onClick: () => props.makeFeatured(files[0].links.feature, filesIds.concat(filesUids), false),
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
      hide: !isAdmin && (['featured', 'public'].includes(page) || page === 'details' && files[0]?.location === 'Public'),
    },
    {
      text: 'Copy to space',
      isDisabled: files.length === 0 || files.some(e => !e.links.copy),
      onClick: () => props.showCopyToSpaceModal(),
    },
    {
      text: 'Attach to...',
      isDisabled: files.length === 0 || !props.filesAttachTo || files.some(e => !e.links.attach_to),
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
      text: 'Request license approval',
      link: links.request_approval_license,
      hide: !links.request_approval_license || page !== 'details',
    },
    {
      text: 'Accept License',
      onClick: () => props.showFilesAcceptLicenseModal(),
      hide: !links.accept_license_action || page !== 'details',
    },
    {
      text: 'Comments',
      link: props.comments,
      hide: !props.comments,
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
        message={page === 'spaces' ? 'To perform other actions on these files, access it from the Space' : ''} />
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
        scope={page === 'details' ? scope : page}
        spaceId={props.spaceId}
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
      {page === 'private' &&
        <MyFilesActionModal
          isOpen={props.deleteModal.isOpen}
          isLoading={props.deleteModal.isLoading}
          hideAction={() => props.hideFilesDeleteModal()}
          modalAction={() => props.deleteFiles(files[0].links.remove, filesIds)}
          files={files}
          action={HOME_FILES_ACTIONS.DELETE}
          fetchFilesByAction={() => props.fetchFilesByAction(filesIds, HOME_FILES_ACTIONS.DELETE, 'private')}
          modal={props.homeFilesActionModalSelector}
        />
      }
      {page !== 'private' &&
        <FilesActionModal
          isOpen={props.deleteModal.isOpen}
          isLoading={props.deleteModal.isLoading}
          hideAction={() => props.hideFilesDeleteModal()}
          modalAction={() => props.deleteFiles(files[0].links.remove, filesIds)}
          files={files}
          action={HOME_FILES_ACTIONS.DELETE}
          fetchFilesByAction={() => props.fetchFilesByAction(filesIds, HOME_FILES_ACTIONS.DELETE, page)}
          modal={props.homeFilesActionModalSelector}
        />
      }
      <FilesActionModal
        isOpen={isFileOpenModalOpen}
        isLoading={props.deleteModal.isLoading}
        hideAction={() => setIsFileOpenModalOpen(false)}
        files={files}
        action={HOME_FILES_ACTIONS.OPEN}
        fetchFilesByAction={() => props.fetchFilesByAction(filesIds, HOME_FILES_ACTIONS.OPEN, 'private')}
        modal={props.homeFilesActionModalSelector}
      />
      <FilesActionModal
        isOpen={isDownloadModalOpen}
        isLoading={props.deleteModal.isLoading}
        hideAction={() => setIsDownloadModalOpen(false)}
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
      <HomeLicenseModal
        isLoading={props.acceptLicenseModal.isLoading}
        isOpen={props.acceptLicenseModal.isOpen}
        hideAction={() => props.hideFilesAcceptLicenseModal()}
        fileLicense={files[0] && files[0].fileLicense}
        modalAction={() => props.filesAcceptLicenseAction(links.accept_license_action)}
        actionType='accept'
        title='Accept License'
      />
      <FilesActionModal
        isOpen={props.makePublicFolderModal.isOpen}
        isLoading={props.makePublicFolderModal.isLoading}
        hideAction={() => props.hideFilesMakePublicFolderModal()}
        modalAction={() => props.makePublicFolder(links.publish, filesIds)}
        files={files}
        action={HOME_FILES_ACTIONS.MAKE_PUBLIC_FOLDER}
        fetchFilesByAction={() => props.fetchFilesByAction(filesIds, HOME_FILES_ACTIONS.DELETE, 'private')}
        modal={props.homeFilesActionModalSelector}
      />
    </>
  )
}

ActionsDropdown.propTypes = {
  files: PropTypes.arrayOf(PropTypes.exact(HomeFileShape)),
  copyToSpace: PropTypes.func,
  renameFile: PropTypes.func,
  attachLicense: PropTypes.func,
  renameModal: PropTypes.object,
  copyToSpaceModal: PropTypes.object,
  makePublicFolderModal: PropTypes.object,
  attachLicenseModal: PropTypes.object,
  hideFilesRenameModal: PropTypes.func,
  showFilesRenameModal: PropTypes.func,
  showCopyToSpaceModal: PropTypes.func,
  hideCopyToSpaceModal: PropTypes.func,
  showFilesMakePublicFolderModal: PropTypes.func,
  hideFilesMakePublicFolderModal: PropTypes.func,
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
  acceptLicenseModal: PropTypes.object,
  showFilesAcceptLicenseModal: PropTypes.func,
  hideFilesAcceptLicenseModal: PropTypes.func,
  filesAcceptLicenseAction: PropTypes.func,
  scope: PropTypes.string,
  spaceId: PropTypes.string,
  comments: PropTypes.string,
  makePublicFolder: PropTypes.func,
}

ActionsDropdown.defaultProps = {
  files: [],
  context: {},
  page: 'private',
  copyToSpaceModal: {},
  makePublicFolderModal: {},
  renameModal: {},
  deleteModal: {},
  filesAttachToModal: {},
  moveModal: {},
  attachLicenseModal: {},
  homeFilesActionModalSelector: {},
  licenseModal: {},
  acceptLicenseModal: {},
}

const mapStateToProps = (state) => ({
  renameModal: homeFilesRenameModalSelector(state),
  copyToSpaceModal: homeFilesCopyToSpaceModalSelector(state),
  makePublicFolderModal: homeFilesMakePublicFolderModalSelector(state),
  context: contextSelector(state),
  deleteModal: homeFilesDeleteModalSelector(state),
  filesAttachToModal: homeFilesAttachToModalSelector(state),
  moveModal: homeFilesModalSelector(state),
  attachLicenseModal: homeFilesAttachLicenseModalSelector(state),
  homeFilesActionModalSelector: homeFilesActionModalSelector(state),
  licenseModal: homeFilesLicenseModalSelector(state),
  acceptLicenseModal: homeFilesAcceptLicenseModalSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  showCopyToSpaceModal: () => dispatch(showFilesCopyToSpaceModal()),
  hideCopyToSpaceModal: () => dispatch(hideFilesCopyToSpaceModal()),
  showFilesRenameModal: () => dispatch(showFilesRenameModal()),
  hideFilesRenameModal: () => dispatch(hideFilesRenameModal()),
  showFilesMakePublicFolderModal: () => dispatch(showFilesMakePublicFolderModal()),
  hideFilesMakePublicFolderModal: () => dispatch(hideFilesMakePublicFolderModal()),
  showFilesDeleteModal: () => dispatch(showFilesDeleteModal()),
  hideFilesDeleteModal: () => dispatch(hideFilesDeleteModal()),
  showFilesAttachToModal: () => dispatch(showFilesAttachToModal()),
  hideFilesAttachToModal: () => dispatch(hideFilesAttachToModal()),
  showFilesMoveModal: () => dispatch(showFilesMoveModal()),
  hideFilesMoveModal: () => dispatch(hideFilesMoveModal()),
  showAttachLicenseModal: () => dispatch(showFilesAttachLicenseModal()),
  hideAttachLicenseModal: () => dispatch(hideFilesAttachLicenseModal()),
  fetchFilesByAction: (ids, action, scope) => dispatch(fetchFilesByAction(ids, action, scope)),
  showFilesLicenseModal: () => dispatch(showFilesLicenseModal()),
  hideFilesLicenseModal: () => dispatch(hideFilesLicenseModal()),
  showFilesAcceptLicenseModal: () => dispatch(showFilesAcceptLicenseModal()),
  hideFilesAcceptLicenseModal: () => dispatch(hideFilesAcceptLicenseModal()),
})

export default connect(mapStateToProps, mapDispatchToProps)(ActionsDropdown)

export {
  ActionsDropdown,
}
