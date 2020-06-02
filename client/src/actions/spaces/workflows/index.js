import { createAction } from '../../../utils/redux'
import {
  SPACE_WORKFLOWS_RESET_FILTERS,
  SPACE_WORKFLOWS_TOGGLE_CHECKBOX,
  SPACE_WORKFLOWS_TOGGLE_ALL_CHECKBOXES,
  SPACE_WORKFLOWS_SHOW_COPY_MODAL,
  SPACE_WORKFLOWS_HIDE_COPY_MODAL,
} from '../types'
import fetchWorkflows from './fetchWorkflows'
import sortWorkflows from './sortWorkflows'
import fetchAccessibleWorkflows from './fetchAccessibleWorkflows'


const resetSpaceWorkflowsFilters = () => createAction(SPACE_WORKFLOWS_RESET_FILTERS)

const toggleWorkflowCheckbox = (id) => createAction(SPACE_WORKFLOWS_TOGGLE_CHECKBOX, id)
const toggleAllWorkflowCheckboxes = () => createAction(SPACE_WORKFLOWS_TOGGLE_ALL_CHECKBOXES)

const showWorkflowsCopyModal = () => createAction(SPACE_WORKFLOWS_SHOW_COPY_MODAL)
const hideWorkflowsCopyModal = () => createAction(SPACE_WORKFLOWS_HIDE_COPY_MODAL)

export {
  fetchWorkflows,
  sortWorkflows,
  resetSpaceWorkflowsFilters,
  fetchAccessibleWorkflows,
  toggleWorkflowCheckbox,
  toggleAllWorkflowCheckboxes,
  showWorkflowsCopyModal,
  hideWorkflowsCopyModal,
}
