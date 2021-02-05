import {
  toggleAllAppsCheckboxes,
  toggleAppCheckbox,
<<<<<<< HEAD
  setCurrentTab,
  setCurrentPage,
  selectAccessibleSpace,
  setAppFilterValue,
  resetAppsFiltersValue,
  setIsLeftMenuOpen,
=======
  toggleAllAppsFeaturedCheckboxes,
  toggleAppFeaturedCheckbox,
>>>>>>> production
} from './index'
import {
  HOME_APPS_TOGGLE_ALL_CHECKBOXES,
  HOME_APPS_TOGGLE_CHECKBOX,
<<<<<<< HEAD
  HOME_SET_CURRENT_TAB,
  HOME_SET_CURRENT_PAGE,
  HOME_SELECT_ACCESSIBLE_SPACE,
  HOME_APPS_SET_FILTER_VALUE,
  HOME_APPS_RESET_FILTERS,
  HOME_SET_IS_LEFT_MENU_OPEN,
} from './types'
import { HOME_APP_TYPES } from '../../constants'
=======
  HOME_APPS_FEATURED_TOGGLE_ALL_CHECKBOXES,
  HOME_APPS_FEATURED_TOGGLE_CHECKBOX,
} from './types'
>>>>>>> production


describe('toggleAllAppsCheckboxes()', () => {
  it('creates correct action', () => {
    expect(toggleAllAppsCheckboxes()).toEqual({
      type: HOME_APPS_TOGGLE_ALL_CHECKBOXES,
<<<<<<< HEAD
      payload: HOME_APP_TYPES.PRIVATE,
=======
      payload: {},
>>>>>>> production
    })
  })
})


describe('toggleAppCheckbox()', () => {
  it('creates correct action', () => {
    expect(toggleAppCheckbox(123)).toEqual({
      type: HOME_APPS_TOGGLE_CHECKBOX,
<<<<<<< HEAD
      payload: { appsType: HOME_APP_TYPES.PRIVATE, id: 123 },
    })
  })
})

describe('setCurrentTab()', () => {
  it('creates correct action', () => {
    expect(setCurrentTab(123)).toEqual({
      type: HOME_SET_CURRENT_TAB,
=======
>>>>>>> production
      payload: 123,
    })
  })
})

<<<<<<< HEAD
describe('setCurrentPage()', () => {
  it('creates correct action', () => {
    expect(setCurrentPage(123)).toEqual({
      type: HOME_SET_CURRENT_PAGE,
      payload: 123,
=======
describe('toggleAllAppsCheckboxes()', () => {
  it('creates correct action', () => {
    expect(toggleAllAppsFeaturedCheckboxes()).toEqual({
      type: HOME_APPS_FEATURED_TOGGLE_ALL_CHECKBOXES,
      payload: {},
>>>>>>> production
    })
  })
})

<<<<<<< HEAD
describe('selectAccessibleSpace()', () => {
  it('creates correct action', () => {
    expect(selectAccessibleSpace(123)).toEqual({
      type: HOME_SELECT_ACCESSIBLE_SPACE,
      payload: 123,
    })
  })
})

describe('setAppFilterValue()', () => {
  it('creates correct action', () => {
    expect(setAppFilterValue({ a: 1 })).toEqual({
      type: HOME_APPS_SET_FILTER_VALUE,
      payload: {
        appsType: HOME_APP_TYPES.PRIVATE,
        value: { a: 1 },
      },
    })
  })
})

describe('resetAppsFiltersValue()', () => {
  it('creates correct action', () => {
    expect(resetAppsFiltersValue()).toEqual({
      type: HOME_APPS_RESET_FILTERS,
      payload: {
        appsType: HOME_APP_TYPES.PRIVATE,
      },
    })
  })
})

describe('setIsLeftMenuOpen()', () => {
  it('creates correct action', () => {
    expect(setIsLeftMenuOpen(true)).toEqual({
      type: HOME_SET_IS_LEFT_MENU_OPEN,
      payload: true,
    })
  })
})
=======
describe('toggleAppCheckbox()', () => {
  it('creates correct action', () => {
    expect(toggleAppFeaturedCheckbox(123)).toEqual({
      type: HOME_APPS_FEATURED_TOGGLE_CHECKBOX,
      payload: 123,
    })
  })
})
>>>>>>> production
