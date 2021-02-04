import React from 'react'
import { shallow } from 'enzyme'

import { HomeFilesFeaturedTable } from '.'


describe('HomeFilesFeaturedTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeFilesFeaturedTable />)

    expect(component).toMatchSnapshot()
  })
})
