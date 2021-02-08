import React from 'react'
import { shallow } from 'enzyme'

import { HomeWorkflowsSpacesPage } from './index'


describe('HomeWorkflowsSpacesPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeWorkflowsSpacesPage />)

    expect(component).toMatchSnapshot()
  })
})

