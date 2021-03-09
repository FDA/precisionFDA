import React from 'react'
import { shallow } from 'enzyme'

import { HomeWorkflowsEveryonePage } from './index'


describe('HomeWorkflowsEveryonePage test', () => {
  it('should render', () => {
    const component = shallow(<HomeWorkflowsEveryonePage />)

    expect(component).toMatchSnapshot()
  })
})


