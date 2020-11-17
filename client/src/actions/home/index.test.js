import {
  toggleAllAppsCheckboxes,
  toggleAppCheckbox,
  toggleAllAppsFeaturedCheckboxes,
  toggleAppFeaturedCheckbox,
} from './index'
import {
  HOME_APPS_TOGGLE_ALL_CHECKBOXES,
  HOME_APPS_TOGGLE_CHECKBOX,
  HOME_APPS_FEATURED_TOGGLE_ALL_CHECKBOXES,
  HOME_APPS_FEATURED_TOGGLE_CHECKBOX,
} from './types'


describe('toggleAllAppsCheckboxes()', () => {
  it('creates correct action', () => {
    expect(toggleAllAppsCheckboxes()).toEqual({
      type: HOME_APPS_TOGGLE_ALL_CHECKBOXES,
      payload: {},
    })
  })
})


describe('toggleAppCheckbox()', () => {
  it('creates correct action', () => {
    expect(toggleAppCheckbox(123)).toEqual({
      type: HOME_APPS_TOGGLE_CHECKBOX,
      payload: 123,
    })
  })
})

describe('toggleAllAppsCheckboxes()', () => {
  it('creates correct action', () => {
    expect(toggleAllAppsFeaturedCheckboxes()).toEqual({
      type: HOME_APPS_FEATURED_TOGGLE_ALL_CHECKBOXES,
      payload: {},
    })
  })
})

describe('toggleAppCheckbox()', () => {
  it('creates correct action', () => {
    expect(toggleAppFeaturedCheckbox(123)).toEqual({
      type: HOME_APPS_FEATURED_TOGGLE_CHECKBOX,
      payload: 123,
    })
  })
})