import React from 'react'
import { shallow } from 'enzyme'

import { HomeAppsEverybodyPage } from './index'


describe('HomeAppsEverybodyPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeAppsEverybodyPage />)

    expect(component).toMatchSnapshot()
  })
})