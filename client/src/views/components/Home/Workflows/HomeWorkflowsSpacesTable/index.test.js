import React from 'react'
import { shallow } from 'enzyme'

import { HomeWorkflowsSpacesTable } from '.'


describe('HomeWorkflowsSpacesTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeWorkflowsSpacesTable />)

    expect(component).toMatchSnapshot()
  })
})
