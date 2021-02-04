import React from 'react'
import { shallow } from 'enzyme'

import { HomeWorkflowsEveryoneTable } from '.'


describe('HomeWorkflowsEveryoneTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeWorkflowsEveryoneTable />)

    expect(component).toMatchSnapshot()
  })
})
