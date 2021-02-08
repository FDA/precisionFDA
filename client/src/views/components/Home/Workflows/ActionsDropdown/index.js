import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeWorkflowsShape from '../../../../shapes/HomeWorkflowsShape'
import {
  showWorkflowsCopyToSpaceModal,
  hideWorkflowsCopyToSpaceModal,
  showWorkflowsAttachToModal,
  hideWorkflowsAttachToModal,
  makePublicWorkflows,
  copyToSpaceWorkflows,
  showWorkflowsRenameModal,
  showWorkflowsMakePublicModal,
  hideWorkflowsMakePublicModal,
  showWorkflowsDeleteModal,
  hideWorkflowsDeleteModal,
} from '../../../../../actions/home'
import {
  homeWorkflowsMakePublicModalSelector,
  homeWorkflowsCopyToSpaceModalSelector,
  homeWorkflowsDeleteModalSelector,
} from '../../../../../reducers/home/workflows/selectors'
import {
  contextSelector,
} from '../../../../../reducers/context/selectors'
import { HOME_WORKFLOWS_ACTIONS, OBJECT_TYPES } from '../../../../../constants'
import DropdownMenu from '../../../DropdownMenu'
import CopyToSpaceModal from '../../CopyToSpaceModal'
import WorkflowsActionModal from '../../Workflows/WorkflowsActionModal'
import HomeExportModal from '../../HomeExportModal'
import HomeAttachToModal from '../../HomeAttachToModal'


const ACTIONS_TO_REMOVE = {
  private: ['Unfeature', 'Feature', 'Make public', 'Attach to...'],
  featured: ['Run', 'Run Batch', 'Make public', 'Attach to...'],
  details: ['Run', 'Run Batch', 'Unfeature', 'Make public', 'Attach to...'],
  public: ['Make public', 'Make public', 'Attach to...'],
  spaces: [
    'Run', 'Run Batch', 'Track', 'Edit', 'Diagram',
    'Make public', 'Delete', 'Attach License', 'Comments',
    'Unfeature', 'Make public',
  ],
}

const ActionsDropdown = (props) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const { workflows, page = 'private' } = props
  const workflowsIds = workflows.map(workflow => workflow.id)
  const workflowUids = workflows.map(workflow => workflow.uid)
  const links = {}
  if (workflows[0] && workflows[0].links) {
    Object.assign(links, workflows[0].links)
  }

  const isAdmin = props.context.user ? props.context.user.admin : false

  const actions = [
    {
      text: 'Run',
      isDisabled: workflows.length !== 1 || !links.run_workflow,
      link: `${links.show}/analyses/new`,
    },
    {
      text: 'Run Batch',
      isDisabled: workflows.length !== 1 || !links.batch_run_workflow,
      link: links.batch_run_workflow,
    },
    {
      text: 'Diagram',
      isDisabled: workflows.length !== 1 || !links.diagram,
    },
    {
      text: 'Edit',
      isDisabled: workflows.length !==1 || !links.edit,
      link: links.edit,
    },
    {
      text: 'Fork',
      isDisabled: workflows.length !==1 || !links.fork,
      link: links.fork,
    },
    {
      text: 'Export to',
      isDisabled: workflows.length !==1,
      onClick: () => setIsExportModalOpen(true),
    },
    {
      text: 'Feature',
      onClick: () => props.makeFeatured(workflows[0].links.feature, workflowUids, true),
      isDisabled: workflows.length === 0 || !workflows.every(e => !e.featured || !e.links.feature),
      hide: page !== 'public',
    },
    {
      text: 'Unfeature',
      onClick: () => props.makeFeatured(workflows[0].links.feature, workflowUids, false),
      isDisabled: workflows.length === 0 || !workflows.every(e => e.featured || !e.links.feature),
      hide: !isAdmin,
    },
    {
      text: 'Make public',
      isDisabled: workflows.length === 0 || !links.publish,
      link: links.publish,
      method: 'post',
    },
    {
      text: 'Delete',
      onClick: () => props.showWorkflowsDeleteModal(),
      isDisabled: workflows.some((e) => !e.links.delete) || workflows.length === 0 ,
      method: 'put',
    },
    {
      text: 'Copy to space',
      isDisabled: workflows.length === 0,
      onClick: () => props.showWorkflowsCopyToSpaceModal(),
    },
    {
      text: 'Attach to...',
      isDisabled: true,
      onClick: () => {
        props.showWorkflowsAttachToModal()
      },
    },
    {
      text: 'Edit tags',
      onClick: () => props.editTags(),
      hide: !props.editTags,
    },
  ]

  const exportOptions = [
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
        message={page === 'spaces' ? 'To perform other actions on this workflow, access it from the Space' : ''}
      />
      <CopyToSpaceModal
        isLoading={props.copyToSpaceModal.isLoading}
        isOpen={props.copyToSpaceModal.isOpen}
        hideAction={() => props.hideWorkflowsCopyToSpaceModal()}
        ids={workflowsIds}
        copyAction={(scope, ids) => props.copyToSpace(scope, ids)}
      />
      <HomeExportModal
        hideAction={() => setIsExportModalOpen(false)}
        options={exportOptions}
        isOpen={isExportModalOpen}
      />
      <WorkflowsActionModal
        isOpen={props.deleteModal.isOpen}
        isLoading={props.deleteModal.isLoading}
        hideAction={() => props.hideWorkflowsDeleteModal()}
        modalAction={() => props.deleteWorkflows(workflows[0].links.delete, workflowUids)}
        workflows={workflows}
        action={'delete'}
      />
      <WorkflowsActionModal
        isOpen={props.makePublicModal.isOpen}
        isLoading={props.makePublicModal.isLoading}
        hideAction={() => props.hideWorkflowsMakePublicModal()}
        modalAction={() => props.makePublic(workflowsIds)}
        workflows={workflows}
        action={HOME_WORKFLOWS_ACTIONS.MAKE_PUBLIC}
      />
      <HomeAttachToModal
        isOpen={props.attachToModal.isOpen}
        isLoading={props.attachToModal.isLoading}
        hideAction={() => props.hideWorkflowsAttachToModal()}
        ids={workflowsIds}
        attachAction={(items, noteUids) => props.workflowsAttachTo(items, noteUids)}
        itemsType={OBJECT_TYPES.WORKFLOW}
      />
    </>
  )
}

ActionsDropdown.propTypes = {
  workflows: PropTypes.arrayOf(PropTypes.exact(HomeWorkflowsShape)),
  page: PropTypes.string,
  makePublic: PropTypes.func,
  copyToSpace: PropTypes.func,
  renameModal: PropTypes.object,
  editTags: PropTypes.func,
  copyToSpaceModal: PropTypes.object,
  makePublicModal: PropTypes.object,
  hideWorkflowsRenameModal: PropTypes.func,
  showWorkflowsRenameModal: PropTypes.func,
  showWorkflowsCopyToSpaceModal: PropTypes.func,
  hideCopyToSpaceModal: PropTypes.func,
  showWorkflowsMakePublicModal: PropTypes.func,
  hideWorkflowsMakePublicModal: PropTypes.func,
  deleteWorkflows: PropTypes.func,
  attachToModal: PropTypes.object,
  showWorkflowsAttachToModal: PropTypes.func,
  makeFeatured: PropTypes.func,
  workflowsAttachTo: PropTypes.func,
  hideWorkflowsAttachToModal: PropTypes.func,
  hideWorkflowsDeleteModal: PropTypes.func,
  context: PropTypes.object,
  hideWorkflowsCopyToSpaceModal: PropTypes.func,
  showWorkflowsDeleteModal: PropTypes.func,
  deleteModal: PropTypes.object,
}

ActionsDropdown.defaultProps = {
  workflows: [],
  attachToModal: {},
  context: {},
  copyToSpaceModal: {},
  deleteModal: {},
  makePublicModal: {},
}

const mapStateToProps = (state) => ({
  copyToSpaceModal: homeWorkflowsCopyToSpaceModalSelector(state),
  makePublicModal: homeWorkflowsMakePublicModalSelector(state),
  deleteModal: homeWorkflowsDeleteModalSelector(state),
  context: contextSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  showWorkflowsCopyToSpaceModal: () => dispatch(showWorkflowsCopyToSpaceModal()),
  hideWorkflowsCopyToSpaceModal: () => dispatch(hideWorkflowsCopyToSpaceModal()),
  showWorkflowsDeleteModal: () => dispatch(showWorkflowsDeleteModal()),
  hideWorkflowsDeleteModal: () => dispatch(hideWorkflowsDeleteModal()),
  makePublic: (ids) => dispatch(makePublicWorkflows(ids)),
  copyToSpace: (scope, ids) => dispatch(copyToSpaceWorkflows(scope, ids)),
  showWorkflowsRenameModal: () => dispatch(showWorkflowsRenameModal()),
  showWorkflowsMakePublicModal: () => dispatch(showWorkflowsMakePublicModal()),
  hideWorkflowsMakePublicModal: () => dispatch(hideWorkflowsMakePublicModal()),
  showWorkflowsAttachToModal: () => dispatch(showWorkflowsAttachToModal()),
  hideWorkflowsAttachToModal: () => dispatch(hideWorkflowsAttachToModal()),
})

export default connect(mapStateToProps, mapDispatchToProps)(ActionsDropdown)

export {
  ActionsDropdown,
}
