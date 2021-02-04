import React from 'react'
import { shallow } from 'enzyme'

import { HomeAppsSpec } from '.'


describe('HomeAppsSpec test', () => {
  it('should render', () => {
    const component = shallow(<HomeAppsSpec />)

    expect(component).toMatchSnapshot()
  })
})
