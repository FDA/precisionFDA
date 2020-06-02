import React from 'react'
import { shallow } from 'enzyme'

import { SpaceJobsList } from '.'


describe('SpaceJobsList test', () => {
  it('should render', () => {
    const component = shallow(<SpaceJobsList spaceId={1}/>)

    expect(component).toMatchSnapshot()
  })
})
