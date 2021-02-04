import { createAction } from '../../../utils/redux'
import {
  HOME_APPS_TOGGLE_ALL_CHECKBOXES,
  HOME_APPS_TOGGLE_CHECKBOX,
  HOME_APPS_RESET_MODALS,
  HOME_APPS_SHOW_MODAL,
  HOME_APPS_HIDE_MODAL,
  HOME_APPS_SET_FILTER_VALUE,
  HOME_APPS_RESET_FILTERS,
} from '../types'
import { HOME_APP_TYPES, HOME_APPS_MODALS } from '../../../constants' 
import fetchApps from './fetchApps'
import fetchAppsFeatured from './fetchAppsFeatured'
import fetchAppsEverybody from './fetchAppsEverybody'
import fetchAppsSpaces from './fetchAppsSpaces'
import fetchAppDetails from './fetchAppDetails'
import assignToChallenge from './assignToChallenge'
import comparisonAction from './comparisonAction'
import fetchAppExecutions from './fetchAppExecutions'


const toggleAllAppsCheckboxes = () => createAction(HOME_APPS_TOGGLE_ALL_CHECKBOXES, HOME_APP_TYPES.PRIVATE)
const toggleAppCheckbox = (id) => createAction(HOME_APPS_TOGGLE_CHECKBOX, { appsType: HOME_APP_TYPES.PRIVATE, id })
const setAppFilterValue = (value) => createAction(HOME_APPS_SET_FILTER_VALUE, { appsType: HOME_APP_TYPES.PRIVATE, value })
const resetAppsFiltersValue = () => createAction(HOME_APPS_RESET_FILTERS, { appsType: HOME_APP_TYPES.PRIVATE })

const toggleAllAppsFeaturedCheckboxes = () => createAction(HOME_APPS_TOGGLE_ALL_CHECKBOXES, HOME_APP_TYPES.FEATURED)
const toggleAppFeaturedCheckbox = (id) => createAction(HOME_APPS_TOGGLE_CHECKBOX, { appsType: HOME_APP_TYPES.FEATURED, id })
const setAppFeaturedFilterValue = (value) => createAction(HOME_APPS_SET_FILTER_VALUE, { appsType: HOME_APP_TYPES.FEATURED, value })
const resetAppsFeaturedFiltersValue = () => createAction(HOME_APPS_RESET_FILTERS, { appsType: HOME_APP_TYPES.FEATURED })

const toggleAllAppsEverybodyCheckboxes = () => createAction(HOME_APPS_TOGGLE_ALL_CHECKBOXES, HOME_APP_TYPES.EVERYBODY)
const toggleAppEverybodyCheckbox = (id) => createAction(HOME_APPS_TOGGLE_CHECKBOX, { appsType: HOME_APP_TYPES.EVERYBODY, id })
const setAppEverybodyFilterValue = (value) => createAction(HOME_APPS_SET_FILTER_VALUE, { appsType: HOME_APP_TYPES.EVERYBODY, value })
const resetAppsEverybodyFiltersValue = () => createAction(HOME_APPS_RESET_FILTERS, { appsType: HOME_APP_TYPES.EVERYBODY })

const toggleAllAppsSpacesCheckboxes = () => createAction(HOME_APPS_TOGGLE_ALL_CHECKBOXES, HOME_APP_TYPES.SPACES)
const toggleAppSpacesCheckbox = (id) => createAction(HOME_APPS_TOGGLE_CHECKBOX, { appsType: HOME_APP_TYPES.SPACES, id })
const setAppSpacesFilterValue = (value) => createAction(HOME_APPS_SET_FILTER_VALUE, { appsType: HOME_APP_TYPES.SPACES, value })
const resetAppsSpacesFiltersValue = () => createAction(HOME_APPS_RESET_FILTERS, { appsType: HOME_APP_TYPES.SPACES })

const resetAppsModals = () => createAction(HOME_APPS_RESET_MODALS)

const showCopyToSpaceModal = () => createAction(HOME_APPS_SHOW_MODAL, HOME_APPS_MODALS.COPY_TO_SPACE)
const hideCopyToSpaceModal = () => createAction(HOME_APPS_HIDE_MODAL, HOME_APPS_MODALS.COPY_TO_SPACE)

const showAppsAssignToChallengeModal = () => createAction(HOME_APPS_SHOW_MODAL, HOME_APPS_MODALS.ASSIGN_TO_CHALLENGE)
const hideAppsAssignToChallengeModal = () => createAction(HOME_APPS_HIDE_MODAL, HOME_APPS_MODALS.ASSIGN_TO_CHALLENGE)

const showAppEditTagsModal = () => createAction(HOME_APPS_SHOW_MODAL, HOME_APPS_MODALS.EDIT_TAGS)
const hideAppEditTagsModal = () => createAction(HOME_APPS_HIDE_MODAL, HOME_APPS_MODALS.EDIT_TAGS)

const showAppsAttachToModal = () => createAction(HOME_APPS_SHOW_MODAL, HOME_APPS_MODALS.ATTACH_TO)
const hideAppsAttachToModal = () => createAction(HOME_APPS_HIDE_MODAL, HOME_APPS_MODALS.ATTACH_TO)

const showAppsComparisonModal = () => createAction(HOME_APPS_SHOW_MODAL, HOME_APPS_MODALS.COMPARISON)
const hideAppsComparisonModal = () => createAction(HOME_APPS_HIDE_MODAL, HOME_APPS_MODALS.COMPARISON)

const showAppsDeleteModal = () => createAction(HOME_APPS_SHOW_MODAL, HOME_APPS_MODALS.DELETE)
const hideAppsDeleteModal = () => createAction(HOME_APPS_HIDE_MODAL, HOME_APPS_MODALS.DELETE)

const setAppExecutionsFilterValue = (value) => createAction(HOME_APPS_SET_FILTER_VALUE, { appsType: 'appExecutions', value })
const resetAppExecutionsFiltersValue = () => createAction(HOME_APPS_RESET_FILTERS, { appsType: 'appExecutions' })

export {
  fetchApps,
  fetchAppsFeatured,
  fetchAppsEverybody,
  fetchAppsSpaces,
  fetchAppDetails,
  assignToChallenge,
  comparisonAction,
  fetchAppExecutions,
  toggleAllAppsCheckboxes,
  toggleAppCheckbox,
  setAppFilterValue,
  resetAppsFiltersValue,
  setAppFeaturedFilterValue,
  resetAppsFeaturedFiltersValue,
  setAppEverybodyFilterValue,
  resetAppsEverybodyFiltersValue,
  setAppSpacesFilterValue,
  resetAppsSpacesFiltersValue,
  toggleAllAppsFeaturedCheckboxes,
  toggleAppFeaturedCheckbox,
  toggleAllAppsEverybodyCheckboxes,
  toggleAppEverybodyCheckbox,
  toggleAllAppsSpacesCheckboxes,
  toggleAppSpacesCheckbox,
  resetAppsModals,
  showCopyToSpaceModal,
  hideCopyToSpaceModal,
  showAppsAssignToChallengeModal,
  hideAppsAssignToChallengeModal,
  showAppEditTagsModal,
  hideAppEditTagsModal,
  showAppsAttachToModal,
  hideAppsAttachToModal,
  showAppsComparisonModal,
  hideAppsComparisonModal,
  showAppsDeleteModal,
  hideAppsDeleteModal,
  setAppExecutionsFilterValue,
  resetAppExecutionsFiltersValue,
}
