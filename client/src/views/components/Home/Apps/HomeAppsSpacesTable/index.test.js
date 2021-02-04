import React from 'react'
import { shallow } from 'enzyme'

import { HomeAppsSpacesTable } from '.'


describe('HomeAppsSpacesTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeAppsSpacesTable />)

    expect(component).toMatchSnapshot()
  })
})