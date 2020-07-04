import React from 'react'
import { shallow } from 'enzyme'

import { SpaceJobsPage } from '.'


describe('SpaceJobsPage test', () => {
  it('should render', () => {
    const space = { isPrivate: true }
    const component = shallow(<SpaceJobsPage space={space} />)

    expect(component).toMatchSnapshot()
  })
})
