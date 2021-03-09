import React from 'react'
import { shallow } from 'enzyme'

import { HomeWorkflowsSpec } from '.'


describe('HomeWorkflowsSpec test', () => {
  it('should render', () => {
    const component = shallow(<HomeWorkflowsSpec />)

    expect(component).toMatchSnapshot()
  })
})
