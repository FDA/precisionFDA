import React from 'react'
import { shallow } from 'enzyme'

import { HomeAssetsSpacesPage } from './index'


describe('HomeAssetsSpacesPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeAssetsSpacesPage />)

    expect(component).toMatchSnapshot()
  })
})
