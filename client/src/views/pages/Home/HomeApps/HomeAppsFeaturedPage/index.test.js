import React from 'react'
import { shallow } from 'enzyme'

import { HomeAppsFeaturedPage } from './index'


describe('HomeAppsFeaturedPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeAppsFeaturedPage />)

    expect(component).toMatchSnapshot()
  })
})