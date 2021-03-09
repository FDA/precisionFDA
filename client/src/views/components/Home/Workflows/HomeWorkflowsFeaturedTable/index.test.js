import React from 'react'
import { shallow } from 'enzyme'

import { HomeWorkflowsFeaturedTable } from '.'


describe('HomeWorkflowsFeaturedTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeWorkflowsFeaturedTable />)

    expect(component).toMatchSnapshot()
  })
})
