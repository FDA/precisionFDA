import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeAppShape from '../../../../shapes/HomeAppShape'
import {
  showCopyToSpaceModal,
  hideCopyToSpaceModal,
  showAppsAttachToModal,
  hideAppsAttachToModal,
  showAppsComparisonModal,
  hideAppsComparisonModal,
  showAppsDeleteModal,
  hideAppsDeleteModal,
} from '../../../../../actions/home'
import {
  homeAppsAttachToModalSelector,
  homeAppsCopyToSpaceModalSelector,
  homeAppsComparisonModalSelector,
  homeAppsDeleteModalSelector,
} from '../../../../../reducers/home/apps/selectors'
import {
  contextSelector,
} from '../../../../../reducers/context/selectors'
import { HOME_APPS_ACTIONS, OBJECT_TYPES } from '../../../../../constants'
import DropdownMenu from '../../../DropdownMenu'
import CopyToSpaceModal from '../../CopyToSpaceModal'
import AppsActionModal from '../AppsActionModal'
import HomeExportModal from '../../HomeExportModal'
import HomeAttachToModal from '../../HomeAttachToModal'
import HomeAppsComparisonModal from '../HomeAppsComparisonModal'


const ACTIONS_TO_REMOVE = {
  private: ['Unfeature'],
  featured: [],
  details: ['Run', 'Run batch', 'Unfeature'],
  public: ['Make public'],
  spaces: ['Run', 'Run batch', 'Track', 'Edit', 'Fork', 'Export to', 'Make public', 'Delete', 'Attach License', 'Comments', 'Unfeature'],
}

const ActionsDropdown = (props) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [comparisonActionType, setComparisonActionType] = useState('set')

  const { apps, page = 'private' } = props
  const appsIds = apps.map(app => app.id)
  const appsUids = apps.map(app => app.uid)

  const links = {}
  if (apps[0] && apps[0].links) {
    Object.assign(links, apps[0].links)
  }

  const onComparisonActionClick = (action) => {
    setComparisonActionType(action)
    props.showAppsComparisonModal()
  }

  const isAdmin = props.context.user ? props.context.user.admin : false

  const actions = [
    {
      text: 'Run',
      isDisabled: apps.length !== 1 || !links.run_job,
      link: links.run_job,
    },
    {
      text: 'Run batch',
      isDisabled: apps.length !== 1 || !links.batch_run,
      link: links.batch_run,
    },
    {
      text: 'Track',
      isDisabled: apps.length !== 1 || !links.track,
      link: links.track,
    },
    {
      text: 'Edit',
      isDisabled: apps.length !== 1 || !links.edit,
      link: links.edit,
    },
    {
      text: 'Fork',
      isDisabled: apps.length !== 1 || !links.fork,
      link: links.fork,
    },
    {
      text: 'Export to',
      isDisabled: apps.length !== 1,
      onClick: () => setIsExportModalOpen(true),
    },
    {
      text: 'Make public',
      isDisabled: apps.length !== 1 || !links.publish,
      link: `${links.publish}&scope=public`,
      method: 'post',
    },
    {
      text: 'Feature',
      onClick: () => props.makeFeatured(apps[0].links.feature, appsUids, true),
      isDisabled: apps.length === 0 || !apps.every(e => !e.featured || !e.links.feature),
      hide: !isAdmin || page !== 'public',
    },
    {
      text: 'Unfeature',
      onClick: () => props.makeFeatured(apps[0].links.feature, appsUids, false),
      isDisabled: apps.length === 0 || !apps.every(e => e.featured || !e.links.feature),
      hide: !isAdmin,
    },
    {
      text: 'Delete',
      onClick: () => props.showAppsDeleteModal(),
      isDisabled: apps.some((e) => !e.links.delete) || apps.length === 0,
    },
    {
      text: 'Copy to space',
      isDisabled: apps.length === 0,
      onClick: () => props.showCopyToSpaceModal(),
    },
    {
      text: 'Attach to...',
      isDisabled: apps.length === 0 || !props.appsAttachTo,
      onClick: () => props.showAppsAttachToModal(),
    },
    {
      text: 'Attach License',
      isDisabled: apps.length === 0,
      hide: true,
    },
    {
      text: 'Comments',
      link: props.comments,
      hide: !props.comments,
    },
    {
      text: 'Set as Challenge App',
      onClick: () => props.setAsChallengeApp(),
      hide: !props.setAsChallengeApp || apps.some((e) => !e.links.assign_app),
    },
    {
      text: 'Edit tags',
      onClick: () => props.editTags(),
      hide: !props.editTags,
    },
    {
      text: 'Add to Comparators',
      onClick: () => onComparisonActionClick('add_to_comparators'),
      hide: !props.comparisonLinks.add_to_comparators,
    },
    {
      text: 'Set this app as comparison default',
      onClick: () => onComparisonActionClick('set_app'),
      hide: !props.comparisonLinks.set_app,
    },
    {
      text: 'Remove from Comparators',
      onClick: () => onComparisonActionClick('remove_from_comparators'),
      hide: !props.comparisonLinks.remove_from_comparators,
    },
  ]

  const exportOptions = [
    {
      label: 'Docker Container',
      link: links.export,
      isPost: true,
      value: 'docker',
    },
    {
      label: 'CWL Tool',
      link: links.cwl_export,
      value: 'cwl',
    },
    {
      label: 'WDL Task',
      link: links.wdl_export,
      value: 'wdl',
    },
  ]

  const availableActions = actions.filter(action => !ACTIONS_TO_REMOVE[page].includes(action.text))

  return (
    <>
      <DropdownMenu
        title='Actions'
        options={availableActions}
        message={page === 'spaces' ? 'To perform other actions on this app, access it from the Space' : ''}
      />
      <CopyToSpaceModal
        isLoading={props.copyToSpaceModal.isLoading}
        isOpen={props.copyToSpaceModal.isOpen}
        hideAction={() => props.hideCopyToSpaceModal()}
        ids={appsIds}
        copyAction={(scope, ids) => props.copyToSpace(scope, ids)}
      />
      <HomeExportModal
        hideAction={() => setIsExportModalOpen(false)}
        options={exportOptions}
        isOpen={isExportModalOpen}
      />
      <AppsActionModal
        isOpen={props.deleteModal.isOpen}
        isLoading={props.deleteModal.isLoading}
        hideAction={() => props.hideAppsDeleteModal()}
        modalAction={() => props.deleteApps(apps[0].links.delete, appsUids)}
        apps={apps}
        action={HOME_APPS_ACTIONS.DELETE}
      />
      <HomeAttachToModal
        isOpen={props.appsAttachToModal.isOpen}
        isLoading={props.appsAttachToModal.isLoading}
        hideAction={() => props.hideAppsAttachToModal()}
        ids={appsIds}
        attachAction={(items, noteUids) => props.appsAttachTo(items, noteUids)}
        itemsType={OBJECT_TYPES.APP}
      />
      <HomeAppsComparisonModal
        isOpen={props.comparisonModal.isOpen}
        isLoading={props.comparisonModal.isLoading}
        hideAction={() => props.hideAppsComparisonModal()}
        modalAction={() => props.comparisonAction(props.comparisonLinks[comparisonActionType])}
        actionType={comparisonActionType}
      />
    </>
  )
}

ActionsDropdown.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.exact(HomeAppShape)),
  copyToSpace: PropTypes.func,
  setAsChallengeApp: PropTypes.func,
  editTags: PropTypes.func,
  comments: PropTypes.string,
  copyToSpaceModal: PropTypes.object,
  showCopyToSpaceModal: PropTypes.func,
  hideCopyToSpaceModal: PropTypes.func,
  page: PropTypes.string,
  appsAttachToModal: PropTypes.object,
  showAppsAttachToModal: PropTypes.func,
  hideAppsAttachToModal: PropTypes.func,
  appsAttachTo: PropTypes.func,
  comparisonModal: PropTypes.object,
  comparisonLinks: PropTypes.object,
  showAppsComparisonModal: PropTypes.func,
  hideAppsComparisonModal: PropTypes.func,
  comparisonAction: PropTypes.func,
  deleteApps: PropTypes.func,
  deleteModal: PropTypes.object,
  showAppsDeleteModal: PropTypes.func,
  hideAppsDeleteModal: PropTypes.func,
  makeFeatured: PropTypes.func,
  context: PropTypes.object,
}

ActionsDropdown.defaultProps = {
  apps: [],
  copyToSpaceModal: {},
  appsAttachToModal: {},
  comparisonLinks: {},
  comparisonModal: {},
  deleteModal: {},
  context: {},
}

const mapStateToProps = (state) => ({
  copyToSpaceModal: homeAppsCopyToSpaceModalSelector(state),
  appsAttachToModal: homeAppsAttachToModalSelector(state),
  comparisonModal: homeAppsComparisonModalSelector(state),
  deleteModal: homeAppsDeleteModalSelector(state),
  context: contextSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  showCopyToSpaceModal: () => dispatch(showCopyToSpaceModal()),
  hideCopyToSpaceModal: () => dispatch(hideCopyToSpaceModal()),
  showAppsAttachToModal: () => dispatch(showAppsAttachToModal()),
  hideAppsAttachToModal: () => dispatch(hideAppsAttachToModal()),
  showAppsComparisonModal: () => dispatch(showAppsComparisonModal()),
  hideAppsComparisonModal: () => dispatch(hideAppsComparisonModal()),
  showAppsDeleteModal: () => dispatch(showAppsDeleteModal()),
  hideAppsDeleteModal: () => dispatch(hideAppsDeleteModal()),
})

export default connect(mapStateToProps, mapDispatchToProps)(ActionsDropdown)

export {
  ActionsDropdown,
}
