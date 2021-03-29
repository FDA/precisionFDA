import React from 'react'
import { shallow } from 'enzyme'

import { HomeWorkflowExecutionsTable } from './index'


describe('HomeWorkflowsExecutionsTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeWorkflowExecutionsTable />)

    expect(component).toMatchSnapshot()
  })
})

