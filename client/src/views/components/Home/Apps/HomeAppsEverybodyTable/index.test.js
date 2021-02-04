import React from 'react'
import { shallow } from 'enzyme'

import { HomeAppsEverybodyTable } from '.'


describe('HomeAppsEverybodyTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeAppsEverybodyTable />)

    expect(component).toMatchSnapshot()
  })
})
