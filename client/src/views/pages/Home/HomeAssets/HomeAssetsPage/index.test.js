import React from 'react'
import { shallow } from 'enzyme'

import { HomeAssetsPage } from './index'


describe('HomeAssetsPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeAssetsPage />)

    expect(component).toMatchSnapshot()
  })
})
