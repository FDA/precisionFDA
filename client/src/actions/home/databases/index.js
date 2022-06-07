import { createAction } from '../../../utils/redux'
import {
  HOME_DATABASES_TOGGLE_ALL_CHECKBOXES,
  HOME_DATABASES_TOGGLE_CHECKBOX,
  HOME_DATABASES_RESET_MODALS,
  HOME_DATABASES_SHOW_MODAL,
  HOME_DATABASES_HIDE_MODAL,
  HOME_DATABASES_SET_FILTER_VALUE,
  HOME_DATABASES_RESET_FILTERS,
} from './types'
import { HOME_DATABASES_MODALS, HOME_DATABASE_TYPES } from '../../../constants'
import fetchDatabases from './fetchDatabases'
import fetchDatabaseDetails from './fetchDatabaseDetails'
import editDatabaseInfo from './editDatabaseInfo'
import runDatabasesAction from './runDatabasesAction'
import createDatabase from './createDatabase'
// import fetchDatabasesSpaces from './fetchDatabasesSpaces'


const toggleAllDatabasesCheckboxes = () => createAction(HOME_DATABASES_TOGGLE_ALL_CHECKBOXES, HOME_DATABASE_TYPES.PRIVATE)
const toggleDatabaseCheckbox = (id) => createAction(HOME_DATABASES_TOGGLE_CHECKBOX, { databasesType: HOME_DATABASE_TYPES.PRIVATE, id })
const setDatabaseFilterValue = (value) => createAction(HOME_DATABASES_SET_FILTER_VALUE, { databasesType: HOME_DATABASE_TYPES.PRIVATE, value })
const resetDatabasesFiltersValue = () => createAction(HOME_DATABASES_RESET_FILTERS, { databasesType: HOME_DATABASE_TYPES.PRIVATE })

const toggleAllDatabasesSpacesCheckboxes = () => createAction(HOME_DATABASES_TOGGLE_ALL_CHECKBOXES, HOME_DATABASE_TYPES.SPACES)
const toggleDatabaseSpacesCheckbox = (id) => createAction(HOME_DATABASES_TOGGLE_CHECKBOX, { databasesType: HOME_DATABASE_TYPES.SPACES, id })
const setDatabaseSpacesFilterValue = (value) => createAction(HOME_DATABASES_SET_FILTER_VALUE, { databasesType: HOME_DATABASE_TYPES.SPACES, value })
const resetDatabasesSpacesFiltersValue = () => createAction(HOME_DATABASES_RESET_FILTERS, { databasesType: HOME_DATABASE_TYPES.SPACES })

const resetDatabasesModals = () => createAction(HOME_DATABASES_RESET_MODALS)

const showDatabaseEditTagsModal = () => createAction(HOME_DATABASES_SHOW_MODAL, HOME_DATABASES_MODALS.EDIT_TAGS)
const hideDatabaseEditTagsModal = () => createAction(HOME_DATABASES_HIDE_MODAL, HOME_DATABASES_MODALS.EDIT_TAGS)

const showDatabasesEditInfoModal = () => createAction(HOME_DATABASES_SHOW_MODAL, HOME_DATABASES_MODALS.EDIT)
const hideDatabasesEditInfoModal = () => createAction(HOME_DATABASES_HIDE_MODAL, HOME_DATABASES_MODALS.EDIT)

const showRunDatabasesActionModal = () => createAction(HOME_DATABASES_SHOW_MODAL, HOME_DATABASES_MODALS.RUN_ACTION)
const hideRunDatabasesActionModal = () => createAction(HOME_DATABASES_HIDE_MODAL, HOME_DATABASES_MODALS.RUN_ACTION)

// const showDatabasesCopyToSpaceModal = () => createAction(HOME_DATABASES_SHOW_MODAL, HOME_DATABASES_MODALS.COPY_TO_SPACE)
// const hideDatabasesCopyToSpaceModal = () => createAction(HOME_DATABASES_SHOW_MODAL, HOME_DATABASES_MODALS.COPY_TO_SPACE)

export {
  fetchDatabases,
  fetchDatabaseDetails,
  toggleAllDatabasesCheckboxes,
  toggleDatabaseCheckbox,
  setDatabaseFilterValue,
  resetDatabasesFiltersValue,

  resetDatabasesModals,

  showDatabaseEditTagsModal,
  hideDatabaseEditTagsModal,

  setDatabaseSpacesFilterValue,
  resetDatabasesSpacesFiltersValue,
  toggleAllDatabasesSpacesCheckboxes,
  toggleDatabaseSpacesCheckbox,

  showDatabasesEditInfoModal,
  hideDatabasesEditInfoModal,
  editDatabaseInfo,
  createDatabase,

  showRunDatabasesActionModal,
  hideRunDatabasesActionModal,
  runDatabasesAction,

  // fetchDatabasesSpaces,
  // showDatabasesCopyToSpaceModal,
  // hideDatabasesCopyToSpaceModal,
}
