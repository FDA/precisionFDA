import { createAction } from '../../../utils/redux'
import {
  HOME_APPS_TOGGLE_ALL_CHECKBOXES,
  HOME_APPS_TOGGLE_CHECKBOX,
  HOME_APPS_FEATURED_TOGGLE_ALL_CHECKBOXES,
  HOME_APPS_FEATURED_TOGGLE_CHECKBOX,
} from '../types'
import fetchApps from './fetchApps'
import fetchAppsFeatured from './fetchAppsFeatured'


const toggleAllAppsCheckboxes = () => createAction(HOME_APPS_TOGGLE_ALL_CHECKBOXES)
const toggleAppCheckbox = (id) => createAction(HOME_APPS_TOGGLE_CHECKBOX, id)

const toggleAllAppsFeaturedCheckboxes = () => createAction(HOME_APPS_FEATURED_TOGGLE_ALL_CHECKBOXES)
const toggleAppFeaturedCheckbox = (id) => createAction(HOME_APPS_FEATURED_TOGGLE_CHECKBOX, id)

export {
  fetchApps,
  fetchAppsFeatured,
  toggleAllAppsCheckboxes,
  toggleAppCheckbox,
  toggleAllAppsFeaturedCheckboxes,
  toggleAppFeaturedCheckbox,
}