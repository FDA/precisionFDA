import React from 'react'
import { shallow } from 'enzyme'

import { HomeAppsSpacesPage } from './index'


describe('HomeAppsSpacesPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeAppsSpacesPage />)

    expect(component).toMatchSnapshot()
  })
})