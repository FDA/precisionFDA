import React from 'react'
import { shallow } from 'enzyme'

import { HomeWorkflowsSinglePage } from './index'


describe('HomeWorkflowsSinglePage test', () => {
  it('should render', () => {
    const component = shallow(<HomeWorkflowsSinglePage />)

    expect(component).toMatchSnapshot()
  })
})
