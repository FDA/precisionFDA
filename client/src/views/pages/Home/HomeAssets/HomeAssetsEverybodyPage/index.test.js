import React from 'react'
import { shallow } from 'enzyme'

import { HomeAssetsEverybodyPage } from './index'


describe('HomeAssetsEverybodyPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeAssetsEverybodyPage />)

    expect(component).toMatchSnapshot()
  })
})
