import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { HomeJobShape, HomeWorkflowShape } from '../../../../shapes/HomeJobShape'
import {
  showExecutionsCopyToSpaceModal,
  hideExecutionsCopyToSpaceModal,
  showExecutionsAttachToModal,
  hideExecutionsAttachToModal,
  showExecutionsTerminateModal,
  hideExecutionsTerminateModal,
  showExecutionsEditTagsModal,
  hideExecutionsEditTagsModal,
} from '../../../../../actions/home'
import {
  homeExecutionsCopyToSpaceModalSelector,
  homeExecutionsAttachToModalSelector,
  homeExecutionsTerminateModalSelector,
  homeExecutionsEditTagsModalSelector,
} from '../../../../../reducers/home/executions/selectors'
import {
  contextSelector,
} from '../../../../../reducers/context/selectors'
import { OBJECT_TYPES } from '../../../../../constants'
import { DropdownMenu } from '../../../DropdownMenu'
import CopyToSpaceModal from '../../CopyToSpaceModal'
import HomeAttachToModal from '../../HomeAttachToModal'
import HomeExecutionsActionModal from '../HomeExecutionsActionModal'
import HomeEditTagsModal from '../../HomeEditTagsModal'


const ACTIONS_TO_REMOVE = {
  private: ['Comments', 'Edit tags', 'Unfeature'],
  details: ['Unfeature'],
  spaces: ['Track', 'Comments', 'View Logs', 'Edit tags', 'Unfeature', 'Make public'],
  public: ['Comments', 'Edit tags', 'Make public'],
  featured: ['Comments', 'Edit tags'],
}

const ActionsDropdown = (props) => {
  const { executions, page = 'private' } = props

  const singleExecutions = executions.map((e) => e.executions ? e.executions : e).flat()
  const singleExecutionsIds = singleExecutions.map(e => e.id)
  const singleExecutionsUds = singleExecutions.map(e => e.uid)

  const singleExecutionsNotTerminated = singleExecutions.filter(e => e.links.terminate)
  const singleExecutionsNotTerminatedUids = singleExecutionsNotTerminated.map(e => e.uid)

  const links = {}
  if (singleExecutions[0] && singleExecutions[0].links) {
    Object.assign(links, singleExecutions[0].links)
  }

  const isAdmin = props.context.user ? props.context.user.admin : false

  const actions = [
    {
      text: 'View Logs',
      isDisabled: singleExecutions.length !== 1 || !links.log,
      link: links.log,
    },
    {
      text: 'Terminate',
      isDisabled: !singleExecutions && !singleExecutions.all(e => e.links.terminate),
      onClick: () => props.showTerminateModal(),
    },
    {
      text: 'Track',
      isDisabled: singleExecutions.length !== 1,
      link: links.track,
    },
    {
      text: 'Copy to space',
      isDisabled: singleExecutions.length === 0 || !props.copyToSpace,
      onClick: () => props.showCopyToSpaceModal(),
    },
    {
      text: 'Feature',
      onClick: () => props.makeFeatured(links.feature, singleExecutionsUds, true),
      isDisabled: singleExecutions.length === 0 || singleExecutions.some(e => e.featured || !e.links.feature),
      hide: !isAdmin || page !== 'public',
    },
    {
      text: 'Unfeature',
      onClick: () => props.makeFeatured(links.feature, singleExecutionsUds, false),
      isDisabled: singleExecutions.length === 0 || singleExecutions.some(e => !e.featured || !e.links.feature),
      hide: !isAdmin,
    },
    {
      text: 'Make public',
      isDisabled: singleExecutions.length !== 1 || !links.publish || executions[0].isWorkflow,
      link: `${links.publish}&scope=public`,
      method: 'post',
    },
    {
      text: 'Attach to...',
      isDisabled: singleExecutions.length === 0 || !props.attachTo,
      onClick: () => props.showAttachToModal(),
    },
    {
      text: 'Comments',
      link: props.comments,
      isDisabled: !props.comments,
    },
    {
      text: 'Edit tags',
      onClick: () => props.showExecutionsEditTagsModal(),
      hide: !props.editTags,
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
        copyAction={(scope) => props.copyToSpace(scope, singleExecutionsUds)}
      />
      <HomeAttachToModal
        isOpen={props.attachToModal.isOpen}
        isLoading={props.attachToModal.isLoading}
        hideAction={() => props.hideAttachToModal()}
        ids={singleExecutionsIds}
        attachAction={(items, noteUids) => props.attachTo(items, noteUids)}
        itemsType={OBJECT_TYPES.JOB}
      />
      <HomeExecutionsActionModal
        action='terminate'
        executions={singleExecutionsNotTerminated}
        isOpen={props.terminateModal.isOpen}
        isLoading={props.terminateModal.isLoading}
        hideAction={() => props.hideTerminateModal()}
        modalAction={() => props.terminateExecutions('/api/jobs/terminate', singleExecutionsNotTerminatedUids)}
      />
      <HomeEditTagsModal
        isOpen={props.editTagsModal.isOpen}
        isLoading={props.editTagsModal.isLoading}
        name={executions[0] && executions[0].name}
        tags={executions[0] && executions[0].tags}
        hideAction={props.hideExecutionsEditTagsModal}
        updateAction={(tags, suggestedTags) => props.editTags(executions[0].uid, tags, suggestedTags)}
      />
    </>
  )
}

ActionsDropdown.propTypes = {
  executions: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.shape(HomeWorkflowShape),
    PropTypes.shape(HomeJobShape),
  ])),
  copyToSpace: PropTypes.func,
  editTags: PropTypes.func,
  comments: PropTypes.string,
  copyToSpaceModal: PropTypes.object,
  showCopyToSpaceModal: PropTypes.func,
  hideCopyToSpaceModal: PropTypes.func,
  attachToModal: PropTypes.object,
  showAttachToModal: PropTypes.func,
  hideAttachToModal: PropTypes.func,
  attachTo: PropTypes.func,
  page: PropTypes.string,
  terminateModal: PropTypes.object,
  showTerminateModal: PropTypes.func,
  hideTerminateModal: PropTypes.func,
  terminateExecutions: PropTypes.func,
  editTagsModal: PropTypes.object,
  showExecutionsEditTagsModal: PropTypes.func,
  hideExecutionsEditTagsModal: PropTypes.func,
  context: PropTypes.object,
  makeFeatured: PropTypes.func,
}

ActionsDropdown.defaultProps = {
  executions: [],
  copyToSpaceModal: {},
  attachToModal: {},
  terminateModal: {},
  editTagsModal: {},
  context: {},
}

const mapStateToProps = (state) => ({
  copyToSpaceModal: homeExecutionsCopyToSpaceModalSelector(state),
  attachToModal: homeExecutionsAttachToModalSelector(state),
  terminateModal: homeExecutionsTerminateModalSelector(state),
  editTagsModal: homeExecutionsEditTagsModalSelector(state),
  context: contextSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  showCopyToSpaceModal: () => dispatch(showExecutionsCopyToSpaceModal()),
  hideCopyToSpaceModal: () => dispatch(hideExecutionsCopyToSpaceModal()),
  showAttachToModal: () => dispatch(showExecutionsAttachToModal()),
  hideAttachToModal: () => dispatch(hideExecutionsAttachToModal()),
  showTerminateModal: () => dispatch(showExecutionsTerminateModal()),
  hideTerminateModal: () => dispatch(hideExecutionsTerminateModal()),
  showExecutionsEditTagsModal: () => dispatch(showExecutionsEditTagsModal()),
  hideExecutionsEditTagsModal: () => dispatch(hideExecutionsEditTagsModal()),
})

export default connect(mapStateToProps, mapDispatchToProps)(ActionsDropdown)

export {
  ActionsDropdown,
}
