import React from 'react'
import { shallow } from 'enzyme'

import { HomeWorkflowsTable } from '.'


describe('HomeWorkflowsTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeWorkflowsTable />)

    expect(component).toMatchSnapshot()
  })
})
