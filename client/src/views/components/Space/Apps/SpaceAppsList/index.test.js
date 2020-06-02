import React from 'react'
import { shallow } from 'enzyme'

import { SpaceAppsList } from '.'


describe('SpaceAppsList test', () => {
  it('should render', () => {
    const component = shallow(<SpaceAppsList spaceId={1} />)

    expect(component).toMatchSnapshot()
  })
})
