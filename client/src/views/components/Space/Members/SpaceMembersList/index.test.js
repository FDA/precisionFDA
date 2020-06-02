import React from 'react'
import { shallow } from 'enzyme'

import { SpaceMembersList } from './index'


describe('SpaceMembersList test', () => {
  it('should render', () => {
    const component = shallow(<SpaceMembersList spaceId={1}/>)

    expect(component).toMatchSnapshot()
  })
})
