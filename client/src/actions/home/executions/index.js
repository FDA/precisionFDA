import { createAction } from '../../../utils/redux'
import {
  HOME_EXECUTIONS_EXPAND_EXECUTION,
  HOME_EXECUTIONS_EXPAND_ALL_EXECUTION,
  HOME_EXECUTIONS_TOGGLE_CHECKBOX,
  HOME_EXECUTIONS_TOGGLE_ALL_CHECKBOXES,
  HOME_EXECUTIONS_SET_FILTER_VALUE,
  HOME_EXECUTIONS_RESET_FILTERS,
  HOME_EXECUTIONS_SHOW_MODAL,
  HOME_EXECUTIONS_HIDE_MODAL,
} from './types'
import { HOME_ENTRIES_TYPES, HOME_EXECUTIONS_MODALS } from '../../../constants'
import fetchExecutions from './fetchExecutions'
import fetchExecutionsSpaces from './fetchExecutionsSpaces'
import fetchExecutionDetails from './fetchExecutionDetails'
import fetchExecutionsEverybody from './fetchExecutionsEverybody'
import fetchExecutionsFeatured from './fetchExecutionsFeatured'
import syncFiles from './syncFiles'
import terminateExecutions from './terminateExecutions'


const expandExecution = (key) => createAction(HOME_EXECUTIONS_EXPAND_EXECUTION, { executionsType: HOME_ENTRIES_TYPES.PRIVATE, key })
const expandAllExecutions = () => createAction(HOME_EXECUTIONS_EXPAND_ALL_EXECUTION, HOME_ENTRIES_TYPES.PRIVATE)
const toggleExecutionCheckbox = (key) => createAction(HOME_EXECUTIONS_TOGGLE_CHECKBOX, { executionsType: HOME_ENTRIES_TYPES.PRIVATE, key })
const toggleAllExecutionsCheckboxes = () => createAction(HOME_EXECUTIONS_TOGGLE_ALL_CHECKBOXES, HOME_ENTRIES_TYPES.PRIVATE)
const setExecutionsFilterValue = (value) => createAction(HOME_EXECUTIONS_SET_FILTER_VALUE, { executionsType: HOME_ENTRIES_TYPES.PRIVATE, value })
const resetExecutionsFiltersValue = () => createAction(HOME_EXECUTIONS_RESET_FILTERS, { executionsType: HOME_ENTRIES_TYPES.PRIVATE })

const expandExecutionSpaces = (key) => createAction(HOME_EXECUTIONS_EXPAND_EXECUTION, { executionsType: HOME_ENTRIES_TYPES.SPACES, key })
const expandAllExecutionsSpaces = () => createAction(HOME_EXECUTIONS_EXPAND_ALL_EXECUTION, HOME_ENTRIES_TYPES.SPACES)
const toggleExecutionSpacesCheckbox = (key) => createAction(HOME_EXECUTIONS_TOGGLE_CHECKBOX, { executionsType: HOME_ENTRIES_TYPES.SPACES, key })
const toggleAllExecutionsSpacesCheckboxes = () => createAction(HOME_EXECUTIONS_TOGGLE_ALL_CHECKBOXES, HOME_ENTRIES_TYPES.SPACES)
const setExecutionsSpacesFilterValue = (value) => createAction(HOME_EXECUTIONS_SET_FILTER_VALUE, { executionsType: HOME_ENTRIES_TYPES.SPACES, value })
const resetExecutionsSpacesFiltersValue = () => createAction(HOME_EXECUTIONS_RESET_FILTERS, { executionsType: HOME_ENTRIES_TYPES.SPACES })

const expandExecutionEverybody = (key) => createAction(HOME_EXECUTIONS_EXPAND_EXECUTION, { executionsType: HOME_ENTRIES_TYPES.EVERYBODY, key })
const expandAllExecutionsEverybody = () => createAction(HOME_EXECUTIONS_EXPAND_ALL_EXECUTION, HOME_ENTRIES_TYPES.EVERYBODY)
const toggleExecutionEverybodyCheckbox = (key) => createAction(HOME_EXECUTIONS_TOGGLE_CHECKBOX, { executionsType: HOME_ENTRIES_TYPES.EVERYBODY, key })
const toggleAllExecutionsEverybodyCheckboxes = () => createAction(HOME_EXECUTIONS_TOGGLE_ALL_CHECKBOXES, HOME_ENTRIES_TYPES.EVERYBODY)
const setExecutionsEverybodyFilterValue = (value) => createAction(HOME_EXECUTIONS_SET_FILTER_VALUE, { executionsType: HOME_ENTRIES_TYPES.EVERYBODY, value })
const resetExecutionsEverybodyFiltersValue = () => createAction(HOME_EXECUTIONS_RESET_FILTERS, { executionsType: HOME_ENTRIES_TYPES.EVERYBODY })

const expandExecutionFeatured = (key) => createAction(HOME_EXECUTIONS_EXPAND_EXECUTION, { executionsType: HOME_ENTRIES_TYPES.FEATURED, key })
const expandAllExecutionsFeatured = () => createAction(HOME_EXECUTIONS_EXPAND_ALL_EXECUTION, HOME_ENTRIES_TYPES.FEATURED)
const toggleExecutionFeaturedCheckbox = (key) => createAction(HOME_EXECUTIONS_TOGGLE_CHECKBOX, { executionsType: HOME_ENTRIES_TYPES.FEATURED, key })
const toggleAllExecutionsFeaturedCheckboxes = () => createAction(HOME_EXECUTIONS_TOGGLE_ALL_CHECKBOXES, HOME_ENTRIES_TYPES.FEATURED)
const setExecutionsFeaturedFilterValue = (value) => createAction(HOME_EXECUTIONS_SET_FILTER_VALUE, { executionsType: HOME_ENTRIES_TYPES.FEATURED, value })
const resetExecutionsFeaturedFiltersValue = () => createAction(HOME_EXECUTIONS_RESET_FILTERS, { executionsType: HOME_ENTRIES_TYPES.FEATURED })

const showExecutionsCopyToSpaceModal = () => createAction(HOME_EXECUTIONS_SHOW_MODAL, HOME_EXECUTIONS_MODALS.COPY_TO_SPACE)
const hideExecutionsCopyToSpaceModal = () => createAction(HOME_EXECUTIONS_HIDE_MODAL, HOME_EXECUTIONS_MODALS.COPY_TO_SPACE)
const showExecutionsAttachToModal = () => createAction(HOME_EXECUTIONS_SHOW_MODAL, HOME_EXECUTIONS_MODALS.ATTACH_TO)
const hideExecutionsAttachToModal = () => createAction(HOME_EXECUTIONS_HIDE_MODAL, HOME_EXECUTIONS_MODALS.ATTACH_TO)
const showExecutionsTerminateModal = () => createAction(HOME_EXECUTIONS_SHOW_MODAL, HOME_EXECUTIONS_MODALS.TERMINATE)
const hideExecutionsTerminateModal = () => createAction(HOME_EXECUTIONS_HIDE_MODAL, HOME_EXECUTIONS_MODALS.TERMINATE)
const showExecutionsEditTagsModal = () => createAction(HOME_EXECUTIONS_SHOW_MODAL, HOME_EXECUTIONS_MODALS.EDIT_TAGS)
const hideExecutionsEditTagsModal = () => createAction(HOME_EXECUTIONS_HIDE_MODAL, HOME_EXECUTIONS_MODALS.EDIT_TAGS)

export {
  fetchExecutions,
  fetchExecutionsSpaces,
  fetchExecutionDetails,
  fetchExecutionsEverybody,
  fetchExecutionsFeatured,
  syncFiles,
  terminateExecutions,
  expandExecution,
  expandAllExecutions,
  toggleExecutionCheckbox,
  toggleAllExecutionsCheckboxes,
  expandExecutionSpaces,
  expandAllExecutionsSpaces,
  toggleExecutionSpacesCheckbox,
  toggleAllExecutionsSpacesCheckboxes,
  setExecutionsFilterValue,
  resetExecutionsFiltersValue,
  setExecutionsSpacesFilterValue,
  resetExecutionsSpacesFiltersValue,
  showExecutionsCopyToSpaceModal,
  hideExecutionsCopyToSpaceModal,
  showExecutionsAttachToModal,
  hideExecutionsAttachToModal,
  showExecutionsTerminateModal,
  hideExecutionsTerminateModal,
  showExecutionsEditTagsModal,
  hideExecutionsEditTagsModal,
  expandExecutionEverybody,
  expandAllExecutionsEverybody,
  toggleExecutionEverybodyCheckbox,
  toggleAllExecutionsEverybodyCheckboxes,
  setExecutionsEverybodyFilterValue,
  resetExecutionsEverybodyFiltersValue,
  expandExecutionFeatured,
  expandAllExecutionsFeatured,
  toggleExecutionFeaturedCheckbox,
  toggleAllExecutionsFeaturedCheckboxes,
  setExecutionsFeaturedFilterValue,
  resetExecutionsFeaturedFiltersValue,
}
