import React from 'react'
import { shallow } from 'enzyme'

import { HomeAppsPage } from './index'


describe('HomeAppsPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeAppsPage />)

    expect(component).toMatchSnapshot()
  })
})