import React from 'react'
import { shallow } from 'enzyme'

import { SpaceWorkflowsPage } from '.'


describe('SpaceWorkflowsPage test', () => {
  it('should render', () => {
    const space = { isPrivate: true }
    const component = shallow(<SpaceWorkflowsPage space={space} />)

    expect(component).toMatchSnapshot()
  })
})
