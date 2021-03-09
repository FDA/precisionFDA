import React from 'react'
import { shallow } from 'enzyme'

import { HomeWorkflowsFeaturedPage } from './index'


describe('HomeWorkflowsFeaturedPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeWorkflowsFeaturedPage />)

    expect(component).toMatchSnapshot()
  })
})


