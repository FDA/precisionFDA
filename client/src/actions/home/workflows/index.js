import { createAction } from '../../../utils/redux'
import {
  HOME_WORKFLOWS_TOGGLE_ALL_CHECKBOXES,
  HOME_WORKFLOWS_TOGGLE_CHECKBOX,
  HOME_WORKFLOWS_RESET_MODALS,
  HOME_WORKFLOWS_SHOW_MODAL,
  HOME_WORKFLOWS_HIDE_MODAL,
  HOME_WORKFLOWS_SET_FILTER_VALUE,
  HOME_WORKFLOWS_RESET_FILTERS,
  HOME_WORKFLOWS_EXECUTIONS_EXPAND_EXECUTION,
  HOME_WORKFLOWS_EXECUTIONS_EXPAND_ALL_EXECUTIONS,
  HOME_WORKFLOWS_EXECUTIONS_SET_FILTER_VALUE,
  HOME_WORKFLOWS_EXECUTIONS_RESET_FILTERS,
} from '../workflows/types'
import { HOME_WORKFLOW_TYPES, HOME_WORKFLOWS_MODALS, OBJECT_TYPES } from '../../../constants'
import fetchWorkflows from './fetchWorkflows'
import fetchWorkflowsFeatured from './fetchWorkflowsFeatured'
import fetchWorkflowsEveryone from './fetchWorkflowsEveryone'
import fetchWorkflowsSpaces from './fetchWorkflowsSpaces'
import fetchWorkflowDetails from './fetchWorkflowDetails'
import fetchWorkflowDiagram from './fetchWorkflowDiagram'
import fetchWorkflowExecutions from './fetchWorkflowExecutions'


const expandExecution = (key) => createAction(HOME_WORKFLOWS_EXECUTIONS_EXPAND_EXECUTION, { key })
const expandAllExecutions = () => createAction(HOME_WORKFLOWS_EXECUTIONS_EXPAND_ALL_EXECUTIONS)
const setExecutionsFilterValue = (value) => createAction(HOME_WORKFLOWS_EXECUTIONS_SET_FILTER_VALUE, { value })
const resetExecutionsFiltersValue = () => createAction(HOME_WORKFLOWS_EXECUTIONS_RESET_FILTERS)

const setWorkflowExecutionsFilterValue = (value) => createAction(HOME_WORKFLOWS_SET_FILTER_VALUE, { workflowsType: 'workflowExecutions', value })
const resetWorkflowExecutionsFiltersValue = () => createAction(HOME_WORKFLOWS_RESET_FILTERS, { workflowsType: 'workflowExecutions' })

const toggleAllWorkflowsCheckboxes = () => createAction(HOME_WORKFLOWS_TOGGLE_ALL_CHECKBOXES, HOME_WORKFLOW_TYPES.PRIVATE)
const toggleWorkflowCheckbox = (id) => createAction(HOME_WORKFLOWS_TOGGLE_CHECKBOX, { workflowsType: HOME_WORKFLOW_TYPES.PRIVATE, id })
const setWorkflowFilterValue = (value) => createAction(HOME_WORKFLOWS_SET_FILTER_VALUE, { workflowsType: HOME_WORKFLOW_TYPES.PRIVATE, value })
const resetWorkflowsFiltersValue = () => createAction(HOME_WORKFLOWS_RESET_FILTERS, { workflowsType: HOME_WORKFLOW_TYPES.PRIVATE })

const toggleAllWorkflowsFeaturedCheckboxes = () => createAction(HOME_WORKFLOWS_TOGGLE_ALL_CHECKBOXES, HOME_WORKFLOW_TYPES.FEATURED)
const toggleWorkflowFeaturedCheckbox = (id) => createAction(HOME_WORKFLOWS_TOGGLE_CHECKBOX, { workflowsType: HOME_WORKFLOW_TYPES.FEATURED, id })
const setWorkflowFeaturedFilterValue = (value) => createAction(HOME_WORKFLOWS_SET_FILTER_VALUE, { workflowsType: HOME_WORKFLOW_TYPES.FEATURED, value })
const resetWorkflowsFeaturedFiltersValue = () => createAction(HOME_WORKFLOWS_RESET_FILTERS, { workflowsType: HOME_WORKFLOW_TYPES.FEATURED })

const toggleAllWorkflowsEveryoneCheckboxes = () => createAction(HOME_WORKFLOWS_TOGGLE_ALL_CHECKBOXES, HOME_WORKFLOW_TYPES.EVERYONE)
const toggleWorkflowEveryoneCheckbox = (id) => createAction(HOME_WORKFLOWS_TOGGLE_CHECKBOX, { workflowsType: HOME_WORKFLOW_TYPES.EVERYONE, id })
const setWorkflowEveryoneFilterValue = (value) => createAction(HOME_WORKFLOWS_SET_FILTER_VALUE, { workflowsType: HOME_WORKFLOW_TYPES.EVERYONE, value })
const resetWorkflowsEveryoneFiltersValue = () => createAction(HOME_WORKFLOWS_RESET_FILTERS, { workflowsType: HOME_WORKFLOW_TYPES.EVERYONE })

const toggleAllWorkflowsSpacesCheckboxes = () => createAction(HOME_WORKFLOWS_TOGGLE_ALL_CHECKBOXES, HOME_WORKFLOW_TYPES.SPACES)
const toggleWorkflowSpacesCheckbox = (id) => createAction(HOME_WORKFLOWS_TOGGLE_CHECKBOX, { workflowsType: HOME_WORKFLOW_TYPES.SPACES, id })
const setWorkflowSpacesFilterValue = (value) => createAction(HOME_WORKFLOWS_SET_FILTER_VALUE, { workflowsType: HOME_WORKFLOW_TYPES.SPACES, value })
const resetWorkflowsSpacesFiltersValue = () => createAction(HOME_WORKFLOWS_RESET_FILTERS, { workflowsType: HOME_WORKFLOW_TYPES.SPACES })

const resetWorkflowsModals = () => createAction(HOME_WORKFLOWS_RESET_MODALS)

const showWorkflowsRenameModal = () => createAction(HOME_WORKFLOWS_SHOW_MODAL, HOME_WORKFLOWS_MODALS.RENAME)
const hideWorkflowsRenameModal = () => createAction(HOME_WORKFLOWS_HIDE_MODAL, HOME_WORKFLOWS_MODALS.RENAME)

const showWorkflowsCopyToSpaceModal = () => createAction(HOME_WORKFLOWS_SHOW_MODAL, HOME_WORKFLOWS_MODALS.COPY_TO_SPACE)
const hideWorkflowsCopyToSpaceModal = () => createAction(HOME_WORKFLOWS_HIDE_MODAL, HOME_WORKFLOWS_MODALS.COPY_TO_SPACE)

const showWorkflowsMakePublicModal = () => createAction(HOME_WORKFLOWS_SHOW_MODAL, HOME_WORKFLOWS_MODALS.MAKE_PUBLIC)
const hideWorkflowsMakePublicModal = () => createAction(HOME_WORKFLOWS_HIDE_MODAL, HOME_WORKFLOWS_MODALS.MAKE_PUBLIC)

const showWorkflowsDeleteModal = () => createAction(HOME_WORKFLOWS_SHOW_MODAL, HOME_WORKFLOWS_MODALS.DELETE)
const hideWorkflowsDeleteModal = () => createAction(HOME_WORKFLOWS_HIDE_MODAL, HOME_WORKFLOWS_MODALS.DELETE)

const showWorkflowsRunModal = () => createAction(HOME_WORKFLOWS_SHOW_MODAL, HOME_WORKFLOWS_MODALS.RUN_WORKFLOW)
const hideWorkflowsRunModal = () => createAction(HOME_WORKFLOWS_HIDE_MODAL, HOME_WORKFLOWS_MODALS.RUN_WORKFLOW)

const showWorkflowsRunBatchModal = () => createAction(HOME_WORKFLOWS_SHOW_MODAL, HOME_WORKFLOWS_MODALS.RUN_BATCH_WORKFLOWS)
const hideWorkflowsRunBatchModal = () => createAction(HOME_WORKFLOWS_HIDE_MODAL, HOME_WORKFLOWS_MODALS.RUN_BATCH_WORKFLOWS)

const showWorkflowsAttachToModal = () => createAction(HOME_WORKFLOWS_SHOW_MODAL, HOME_WORKFLOWS_MODALS.ATTACH_TO)
const hideWorkflowsAttachToModal = () => createAction(HOME_WORKFLOWS_HIDE_MODAL, HOME_WORKFLOWS_MODALS.ATTACH_TO)

const workflowsAttachTo = (items, noteUids) => createAction(OBJECT_TYPES.WORKFLOW, items, noteUids)
const showWorkflowEditTagsModal = () => createAction(HOME_WORKFLOWS_SHOW_MODAL, HOME_WORKFLOWS_MODALS.EDIT_TAGS)
const hideWorkflowEditTagsModal = () => createAction(HOME_WORKFLOWS_HIDE_MODAL, HOME_WORKFLOWS_MODALS.EDIT_TAGS)

export {
  showWorkflowEditTagsModal,
  hideWorkflowEditTagsModal,
  fetchWorkflows,
  fetchWorkflowsFeatured,
  fetchWorkflowsEveryone,
  fetchWorkflowsSpaces,
  fetchWorkflowDetails,
  fetchWorkflowDiagram,
  fetchWorkflowExecutions,
  toggleAllWorkflowsCheckboxes,
  toggleWorkflowCheckbox,
  setWorkflowFilterValue,
  resetWorkflowsFiltersValue,
  setWorkflowFeaturedFilterValue,
  resetWorkflowsFeaturedFiltersValue,
  setWorkflowEveryoneFilterValue,
  resetWorkflowsEveryoneFiltersValue,
  setWorkflowSpacesFilterValue,
  resetWorkflowsSpacesFiltersValue,
  toggleAllWorkflowsFeaturedCheckboxes,
  toggleWorkflowFeaturedCheckbox,
  toggleAllWorkflowsEveryoneCheckboxes,
  toggleWorkflowEveryoneCheckbox,
  toggleAllWorkflowsSpacesCheckboxes,
  toggleWorkflowSpacesCheckbox,
  resetWorkflowsModals,
  showWorkflowsRenameModal,
  hideWorkflowsRenameModal,
  showWorkflowsCopyToSpaceModal,
  hideWorkflowsCopyToSpaceModal,
  showWorkflowsMakePublicModal,
  hideWorkflowsMakePublicModal,
  showWorkflowsDeleteModal,
  hideWorkflowsDeleteModal,
  showWorkflowsRunModal,
  hideWorkflowsRunModal,
  showWorkflowsRunBatchModal,
  hideWorkflowsRunBatchModal,
  showWorkflowsAttachToModal,
  hideWorkflowsAttachToModal,
  workflowsAttachTo,
  setWorkflowExecutionsFilterValue,
  resetWorkflowExecutionsFiltersValue,
  expandExecution,
  expandAllExecutions,
  setExecutionsFilterValue,
  resetExecutionsFiltersValue,
}
