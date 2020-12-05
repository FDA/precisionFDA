import React from 'react'
import { shallow } from 'enzyme'

import { HomeAppsTable } from '.'


describe('HomeAppsTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeAppsTable />)

    expect(component).toMatchSnapshot()
  })
})