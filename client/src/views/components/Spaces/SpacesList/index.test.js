import React from 'react'
import { shallow } from 'enzyme'

import { SpacesList } from '.'


describe('SpacesList test', () => {
  it('should render', () => {
    const component = shallow(<SpacesList spaces={[]} />)

    expect(component).toMatchSnapshot()
  })
})
