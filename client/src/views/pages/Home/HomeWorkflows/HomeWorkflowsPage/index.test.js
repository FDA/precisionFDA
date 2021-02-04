import React from 'react'
import { shallow } from 'enzyme'

import { HomeWorkflowsPage } from './index'


describe('HomeWorkflowsPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeWorkflowsPage />)

    expect(component).toMatchSnapshot()
  })
})

