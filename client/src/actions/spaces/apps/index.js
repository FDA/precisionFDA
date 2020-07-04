import { createAction } from '../../../utils/redux'
import {
  SPACE_APPS_RESET_FILTERS,
  SPACE_APPS_TOGGLE_CHECKBOX,
  SPACE_APPS_TOGGLE_ALL_CHECKBOXES,
  SPACE_APPS_SHOW_COPY_MODAL,
  SPACE_APPS_HIDE_COPY_MODAL,
} from '../types'
import fetchApps from './fetchApps'
import sortApps from './sortApps'
import fetchAccessibleApps from './fetchAccessibleApps'


const resetSpaceAppsFilters = () => createAction(SPACE_APPS_RESET_FILTERS)

const toggleAppCheckbox = (id) => createAction(SPACE_APPS_TOGGLE_CHECKBOX, id)
const toggleAllAppCheckboxes = () => createAction(SPACE_APPS_TOGGLE_ALL_CHECKBOXES)

const showAppsCopyModal = () => createAction(SPACE_APPS_SHOW_COPY_MODAL)
const hideAppsCopyModal = () => createAction(SPACE_APPS_HIDE_COPY_MODAL)

export {
  fetchApps,
  sortApps,
  resetSpaceAppsFilters,
  fetchAccessibleApps,
  toggleAppCheckbox,
  toggleAllAppCheckboxes,
  showAppsCopyModal,
  hideAppsCopyModal,
}
