import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeAssetShape from '../../../../shapes/HomeAssetShape'
import {
  showAssetsAttachToModal,
  hideAssetsAttachToModal,
  showAssetsEditTagsModal,
  hideAssetsEditTagsModal,
  showAssetsRenameModal,
  hideAssetsRenameModal,
  showAssetsDeleteModal,
  hideAssetsDeleteModal,
  showAssetsDownloadModal,
  hideAssetsDownloadModal,
  showAssetsAttachLicenseModal,
  hideAssetsAttachLicenseModal,
  showAssetsLicenseModal,
  hideAssetsLicenseModal,
  showAssetsAcceptLicenseModal,
  hideAssetsAcceptLicenseModal,
} from '../../../../../actions/home'
import {
  homeAssetsEditTagsModalSelector,
  homeAssetsAttachToModalSelector,
  homeAssetsRenameModalSelector,
  homeAssetsDownloadModalSelector,
  homeAssetsDeleteModalSelector,
  homeAssetsAttachLicenseModalSelector,
  homeAssetsLicenseModalSelector,
  homeAssetsAcceptLicenseModalSelector,
} from '../../../../../reducers/home/assets/selectors'
import {
  contextSelector,
} from '../../../../../reducers/context/selectors'
import { OBJECT_TYPES, HOME_FILES_ACTIONS } from '../../../../../constants'
import { DropdownMenu } from '../../../DropdownMenu'
import HomeAttachToModal from '../../HomeAttachToModal'
import HomeEditTagsModal from '../../HomeEditTagsModal'
import RenameObjectModal from '../../../RenameObjectModal'
import AssetsActionModal from '../AssetsActionModal'
import AttachLicenseModal from '../../AttachLicenseModal'
import HomeLicenseModal from '../../HomeLicenseModal'


const ACTIONS_TO_REMOVE = {
  private: ['Unfeature'],
  featured: [],
  details: ['Unfeature'],
  public: ['Make public'],
  spaces: ['Rename', 'Delete', 'Unfeature', 'Make public', 'Attach License', 'Detach License'],
}

const ActionsDropdown = (props) => {
  const { assets, page = 'private' } = props
  const assetsIds = assets.map(asset => asset.id)
  const assetsUids = assets.map(asset => asset.uid)

  const links = {}
  if (assets[0] && assets[0].links) {
    Object.assign(links, assets[0].links)
  }

  const isAdmin = props.context.user ? props.context.user.admin : false
  const availableLicenses = props.context.user ? props.context.user.links.licenses : false
  const actions = [
    {
      text: 'Rename',
      isDisabled: assets.length !== 1,
      onClick: () => props.showRenameModal(),
    },
    {
      text: 'Download',
      isDisabled: assets.length === 0 || assets.some(e => !e.links.download),
      onClick: () => props.showDownloadModal(),
    },
    {
      text: 'Feature',
      onClick: () => props.makeFeatured(links.feature, assetsUids, true),
      isDisabled: assets.length === 0 || assets.some(e => e.featured || !e.links.feature),
      hide: !isAdmin || page !== 'public',
    },
    {
      text: 'Unfeature',
      onClick: () => props.makeFeatured(links.feature, assetsUids, false),
      isDisabled: assets.length === 0 || assets.some(e => !e.featured || !e.links.feature),
      hide: !isAdmin,
    },
    {
      text: 'Make public',
      isDisabled: assets.length !== 1 || !links.publish,
      link: `${links.publish}&scope=public`,
      method: 'post',
    },
    {
      text: 'Attach to...',
      isDisabled: assets.length === 0 || !props.attachTo || assets.some(e => !e.links.attach_to),
      onClick: () => props.showAttachToModal(),
    },
    {
      text: 'Delete',
      isDisabled: assets.length !== 1 || !links.remove,
      onClick: () => props.showDeleteModal(),
    },
    {
      text: 'Attach License',
      isDisabled: assets.length !== 1 || !links.license || !availableLicenses,
      onClick: () => props.showAttachLicenseModal(),
    },
    {
      text: 'Detach License',
      isDisabled: assets.length !== 1,
      onClick: () => props.showAssetsLicenseModal(),
      hide: assets.length !== 1 || !links.detach_license,
    },
    {
      text: 'Request license approval',
      link: links.request_approval_license,
      hide: !links.request_approval_license || page !== 'details',
    },
    {
      text: 'Accept License',
      onClick: () => props.showAssetsAcceptLicenseModal(),
      hide: !links.accept_license_action || page !== 'details',
    },
    {
      text: 'Edit tags',
      onClick: () => props.showEditTagsModal(),
      hide: !props.editTags,
    },
    {
      text: 'Comments',
      link: props.comments,
      hide: !props.comments,
    },
  ]

  const availableActions = actions.filter(action => !ACTIONS_TO_REMOVE[page].includes(action.text))

  return (
    <>
      <DropdownMenu
        title='Actions'
        options={availableActions}
        message={page === 'spaces' ? 'To perform other actions on these assets, access it from the Space' : ''}
      />
      <HomeAttachToModal
        isOpen={props.attachToModal.isOpen}
        isLoading={props.attachToModal.isLoading}
        hideAction={() => props.hideAttachToModal()}
        ids={assetsIds}
        attachAction={(items, noteUids) => props.attachTo(items, noteUids)}
        itemsType={OBJECT_TYPES.ASSET}
      />
      <HomeEditTagsModal
        isOpen={props.editTagsModal.isOpen}
        isLoading={props.editTagsModal.isLoading}
        name={assets[0] && assets[0].name}
        tags={assets[0] && assets[0].tags}
        hideAction={props.hideEditTagsModal}
        updateAction={(tags, suggestedTags) => props.editTags(assets[0].uid, tags, suggestedTags)}
      />
      {assets.length === 1 &&
        <RenameObjectModal
          isAsset
          defaultFileName={assets[0] && assets[0].origin.text}
          isOpen={props.renameModal.isOpen}
          isLoading={props.renameModal.isLoading}
          hideAction={() => props.hideRenameModal()}
          renameAction={(name) => props.rename(links.rename, name, assets[0].uid)}
        />
      }
      <AssetsActionModal
        assets={assets}
        action={HOME_FILES_ACTIONS.DELETE}
        hideAction={() => props.hideDeleteModal()}
        isOpen={props.deleteModal.isOpen}
        isLoading={props.deleteModal.isLoading}
        modalAction={() => props.deleteAsset(links.remove, assetsUids)}
      />
      <AssetsActionModal
        assets={assets}
        action={HOME_FILES_ACTIONS.DOWNLOAD}
        hideAction={() => props.hideDownloadModal()}
        isOpen={props.downloadModal.isOpen}
        isLoading={props.downloadModal.isLoading}
      />
      <AttachLicenseModal
        isLoading={props.attachLicenseModal.isLoading}
        isOpen={props.attachLicenseModal.isOpen}
        hideAction={() => props.hideAttachLicenseModal()}
        ids={assetsUids}
        attachAction={(link, scope, ids) => props.attachLicense(link, scope, ids)}
        link={links.license}
        objectLicense={assets[0] && assets[0].fileLicense}
      />
      <HomeLicenseModal
        isLoading={props.licenseModal.isLoading}
        isOpen={props.licenseModal.isOpen}
        hideAction={() => props.hideAssetsLicenseModal()}
        link={links.detach_license}
        itemUid={assets[0] && assets[0].uid}
        fileLicense={assets[0] && assets[0].fileLicense}
        modalAction={(link) => props.assetsLicenseAction(link)}
      />
      <HomeLicenseModal
        isLoading={props.acceptLicenseModal.isLoading}
        isOpen={props.acceptLicenseModal.isOpen}
        hideAction={() => props.hideAssetsAcceptLicenseModal()}
        fileLicense={assets[0] && assets[0].fileLicense}
        modalAction={() => props.assetsAcceptLicenseAction(links.accept_license_action)}
        actionType='accept'
        title='Accept License'
      />
    </>
  )
}

ActionsDropdown.propTypes = {
  assets: PropTypes.arrayOf(PropTypes.exact(HomeAssetShape)),
  editTags: PropTypes.func,
  page: PropTypes.string,
  attachTo: PropTypes.func,
  showAttachToModal: PropTypes.func,
  hideAttachToModal: PropTypes.func,
  showEditTagsModal: PropTypes.func,
  hideEditTagsModal: PropTypes.func,
  showRenameModal: PropTypes.func,
  hideRenameModal: PropTypes.func,
  showDeleteModal: PropTypes.func,
  hideDeleteModal: PropTypes.func,
  showDownloadModal: PropTypes.func,
  hideDownloadModal: PropTypes.func,
  showAttachLicenseModal: PropTypes.func,
  hideAttachLicenseModal: PropTypes.func,
  context: PropTypes.object,
  makeFeatured: PropTypes.func,
  comments: PropTypes.string,
  attachToModal: PropTypes.object,
  editTagsModal: PropTypes.object,
  renameModal: PropTypes.object,
  deleteModal: PropTypes.object,
  downloadModal: PropTypes.object,
  attachLicenseModal: PropTypes.object,
  rename: PropTypes.func,
  deleteAsset: PropTypes.func,
  attachLicense: PropTypes.func,
  licenseModal: PropTypes.object,
  showAssetsLicenseModal: PropTypes.func,
  hideAssetsLicenseModal: PropTypes.func,
  assetsLicenseAction: PropTypes.func,
  acceptLicenseModal: PropTypes.object,
  showAssetsAcceptLicenseModal: PropTypes.func,
  hideAssetsAcceptLicenseModal: PropTypes.func,
  assetsAcceptLicenseAction: PropTypes.func,
}

ActionsDropdown.defaultProps = {
  assets: [],
  attachToModal: {},
  editTagsModal: {},
  renameModal: {},
  deleteModal: {},
  downloadModal: {},
  attachLicenseModal: {},
  context: {},
  licenseModal: {},
  acceptLicenseModal: {},
}

const mapStateToProps = (state) => ({
  attachToModal: homeAssetsAttachToModalSelector(state),
  editTagsModal: homeAssetsEditTagsModalSelector(state),
  renameModal: homeAssetsRenameModalSelector(state),
  deleteModal: homeAssetsDeleteModalSelector(state),
  downloadModal: homeAssetsDownloadModalSelector(state),
  attachLicenseModal: homeAssetsAttachLicenseModalSelector(state),
  context: contextSelector(state),
  licenseModal: homeAssetsLicenseModalSelector(state),
  acceptLicenseModal: homeAssetsAcceptLicenseModalSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  showAttachToModal: () => dispatch(showAssetsAttachToModal()),
  hideAttachToModal: () => dispatch(hideAssetsAttachToModal()),
  showEditTagsModal: () => dispatch(showAssetsEditTagsModal()),
  hideEditTagsModal: () => dispatch(hideAssetsEditTagsModal()),
  showRenameModal: () => dispatch(showAssetsRenameModal()),
  hideRenameModal: () => dispatch(hideAssetsRenameModal()),
  showDeleteModal: () => dispatch(showAssetsDeleteModal()),
  hideDeleteModal: () => dispatch(hideAssetsDeleteModal()),
  showDownloadModal: () => dispatch(showAssetsDownloadModal()),
  hideDownloadModal: () => dispatch(hideAssetsDownloadModal()),
  showAttachLicenseModal: () => dispatch(showAssetsAttachLicenseModal()),
  hideAttachLicenseModal: () => dispatch(hideAssetsAttachLicenseModal()),
  showAssetsLicenseModal: () => dispatch(showAssetsLicenseModal()),
  hideAssetsLicenseModal: () => dispatch(hideAssetsLicenseModal()),
  showAssetsAcceptLicenseModal: () => dispatch(showAssetsAcceptLicenseModal()),
  hideAssetsAcceptLicenseModal: () => dispatch(hideAssetsAcceptLicenseModal()),
})

export default connect(mapStateToProps, mapDispatchToProps)(ActionsDropdown)

export {
  ActionsDropdown,
}
