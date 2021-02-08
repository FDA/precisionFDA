import React from 'react'
import { shallow } from 'enzyme'

import { HomeFilesFeaturedPage } from './index'


describe('HomeFilesFeaturedPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeFilesFeaturedPage />)

    expect(component).toMatchSnapshot()
  })
})
