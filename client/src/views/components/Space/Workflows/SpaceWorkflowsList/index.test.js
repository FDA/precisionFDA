import React from 'react'
import { shallow } from 'enzyme'

import { SpaceWorkflowsList } from '.'


describe('SpaceWorkflowsList test', () => {
  it('should render', () => {
    const component = shallow(<SpaceWorkflowsList spaceId={1}/>)

    expect(component).toMatchSnapshot()
  })
})
