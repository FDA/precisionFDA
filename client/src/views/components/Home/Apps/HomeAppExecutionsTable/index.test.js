import React from 'react'
import { shallow } from 'enzyme'

import { HomeAppsExecutionsTable } from '.'


describe('HomeAppsExecutionsTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeAppsExecutionsTable />)

    expect(component).toMatchSnapshot()
  })
})
