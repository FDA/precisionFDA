import React from 'react'
import { shallow } from 'enzyme'

import { HomeAssetsFeaturedPage } from './index'


describe('HomeAssetsFeaturedPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeAssetsFeaturedPage />)

    expect(component).toMatchSnapshot()
  })
})
