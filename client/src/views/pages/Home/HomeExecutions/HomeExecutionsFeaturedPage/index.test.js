import React from 'react'
import { shallow } from 'enzyme'

import { HomeExecutionsFeaturedPage } from './index'


describe('HomeExecutionsFeaturedPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeExecutionsFeaturedPage />)

    expect(component).toMatchSnapshot()
  })
})
