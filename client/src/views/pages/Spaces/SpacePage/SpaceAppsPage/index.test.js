import React from 'react'
import { shallow } from 'enzyme'

import { SpaceAppsPage } from '.'


describe('SpaceAppsPage test', () => {
  it('should render', () => {
    const space = { isPrivate: true }
    const component = shallow(<SpaceAppsPage space={space} />)

    expect(component).toMatchSnapshot()
  })
})
