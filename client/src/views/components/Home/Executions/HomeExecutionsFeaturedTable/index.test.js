import React from 'react'
import { shallow } from 'enzyme'

import { HomeExecutionsFeaturedTable } from '.'


describe('HomeExecutionsFeaturedTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeExecutionsFeaturedTable />)

    expect(component).toMatchSnapshot()
  })
})
