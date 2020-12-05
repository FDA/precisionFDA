import React from 'react'
import { shallow } from 'enzyme'

import { HomeAppsFeaturedTable } from '.'


describe('HomeAppsFeaturedTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeAppsFeaturedTable />)

    expect(component).toMatchSnapshot()
  })
})